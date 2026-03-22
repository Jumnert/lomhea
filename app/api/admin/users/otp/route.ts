import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";
import nodemailer from "nodemailer";
import crypto from "crypto";

const WEBMASTER_EMAIL = "chountheachumnith@gmail.com";

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate 4-digit OTP
  const otp = crypto.randomInt(1000, 9999).toString();

  // Store in Redis (Keyed by session user ID)
  const otpKey = `otp:admin:action:${session.user.id}`;
  await redis.set(otpKey, otp, { ex: 300 });

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("SMTP Credentials Missing.");
    }

    await transporter.sendMail({
      from: `"Lomhea Admin" <${process.env.GMAIL_USER}>`,
      to: WEBMASTER_EMAIL,
      subject: "🔒 Admin Action OTP Verification",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #000; text-align: center;">Security Verification</h2>
          <p>A sensitive administrative action has been requested.</p>
          <div style="background: #f8f9fa; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px solid #eaeaea;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Verification Code</p>
            <h1 style="font-size: 42px; letter-spacing: 12px; margin: 0; color: #000; font-family: monospace;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 11px; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "OTP sent to Gmail" });
  } catch (error: any) {
    console.error("Failed to send OTP email:", error.message);
    return NextResponse.json(
      {
        error: "Failed to send email via Gmail SMTP.",
        debug_otp: otp,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { otp } = await request.json();
    const otpKey = `otp:admin:action:${session.user.id}`;

    // Explicitly get as string from Redis
    const storedOtp = await redis.get<string>(otpKey);

    if (!storedOtp) {
      return NextResponse.json(
        { error: "Code expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Force string comparison for robust verification
    if (String(otp).trim() !== String(storedOtp).trim()) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 },
      );
    }

    // Success - clear state
    await redis.del(otpKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Verification server error" },
      { status: 500 },
    );
  }
}
