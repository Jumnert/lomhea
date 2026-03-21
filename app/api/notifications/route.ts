import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await (prisma as any).notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (id) {
      await (prisma as any).notification.update({
        where: { id, userId: session.user.id },
        data: { isRead: true },
      });
    } else {
      await (prisma as any).notification.updateMany({
        where: { userId: session.user.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}
