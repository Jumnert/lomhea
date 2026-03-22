import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { invalidatePattern } from "@/lib/redis-utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: placeId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // 1. Create or update the review (compatible even without composite unique index)
    const existingReview = await (prisma as any).review.findFirst({
      where: {
        userId: session.user.id,
        placeId,
      },
      select: { id: true },
    });

    const review = existingReview
      ? await (prisma as any).review.update({
          where: { id: existingReview.id },
          data: { rating, comment },
        })
      : await (prisma as any).review.create({
          data: {
            rating,
            comment,
            userId: session.user.id,
            placeId,
          },
        });

    // 2. Perform aggregation directly in the DB (much faster)
    const stats = await (prisma as any).review.aggregate({
      where: { placeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = stats._avg.rating || 0;
    const reviewCount = stats._count.rating || 0;

    // 3. Update the place with the new average and count
    await (prisma as any).place.update({
      where: { id: placeId },
      data: {
        rating: averageRating,
        reviewCount: reviewCount,
      },
    });

    // 4. Invalidate global places cache
    await invalidatePattern("places:*");

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
