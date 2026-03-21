import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 },
      );
    }

    const record = await (prisma as any).verification.findFirst({
      where: {
        identifier: `otp:${email}`,
        value: code,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (new Date() > new Date(record.expiresAt)) {
      await (prisma as any).verification.delete({ where: { id: record.id } });
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Mark the user's email as verified
    await (prisma as any).user.updateMany({
      where: { email },
      data: { emailVerified: true },
    });

    // Clean up the OTP record
    await (prisma as any).verification.delete({ where: { id: record.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
