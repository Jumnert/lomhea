import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// PATCH - edit a PENDING request
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only the owner can edit it
    const existing = await (prisma as any).placeRequest.findFirst({
      where: { id, userId: session.user.id, status: "PENDING" },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Not found or not editable" },
        { status: 404 },
      );

    const body = await req.json();
    const updated = await (prisma as any).placeRequest.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE - cancel a PENDING request
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await (prisma as any).placeRequest.findFirst({
      where: { id, userId: session.user.id, status: "PENDING" },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Not found or not cancellable" },
        { status: 404 },
      );

    await (prisma as any).placeRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
