import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    // Manual Upsert to bypass generated client type issues
    const existingReview = await (prisma as any).review.findFirst({
      where: {
        userId: session.user.id,
        placeId: placeId,
      },
    });

    let review;
    if (existingReview) {
      review = await (prisma as any).review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
      });
    } else {
      review = await (prisma as any).review.create({
        data: {
          rating,
          comment,
          userId: session.user.id,
          placeId,
        },
      });
    }

    // 2. Fetch all ratings to calculate average
    const allReviews = await (prisma as any).review.findMany({
      where: { placeId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
      allReviews.length;

    // 3. Update the place with the new average and count
    await (prisma as any).place.update({
      where: { id: placeId },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
