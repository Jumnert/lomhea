import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch the target user's current role
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { role, banned } = await req.json();

    // MODERATOR Restrictions
    if (session.user.role === "MODERATOR") {
      // 1. Cannot modify an ADMIN or another MODERATOR
      if (
        (targetUser.role as string) === "ADMIN" ||
        (targetUser.role as string) === "MODERATOR"
      ) {
        return NextResponse.json(
          { error: "Insufficient permissions to modify this user level." },
          { status: 403 },
        );
      }
      // 2. Cannot promote anyone to MODERATOR or ADMIN
      if (role === "ADMIN" || role === "MODERATOR") {
        return NextResponse.json(
          { error: "Moderators cannot promote users to Moderator or Admin." },
          { status: 403 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: role as any,
        banned: banned as boolean,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
