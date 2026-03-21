import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const isDev = process.env.NODE_ENV === "development";

// Gmail SMTP transporter — free, sends to any address, no domain needed
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your normal password)
    },
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Delete any existing code for this email
    await (prisma as any).verification.deleteMany({
      where: { identifier: `otp:${email}` },
    });

    // Store code in DB (expires in 10 minutes)
    await (prisma as any).verification.create({
      data: {
        identifier: `otp:${email}`,
        value: code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️  GMAIL_USER or GMAIL_APP_PASSWORD not set in .env");
      if (isDev) {
        console.log(`\n🔑 DEV OTP for ${email}: ${code}\n`);
        return NextResponse.json({
          success: true,
          devCode: code,
          warning: "Gmail credentials not set — using dev fallback.",
        });
      }
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 },
      );
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `Lomhea <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${code} — Your Lomhea verification code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
          <div style="margin-bottom: 28px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 8px 14px;">
              <span style="color: #10b981; font-weight: 900; font-size: 18px;">L</span>
              <span style="color: #065f46; font-weight: 800; font-size: 16px; letter-spacing: -0.3px;">Lomhea</span>
            </div>
          </div>

          <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px 0;">Verify your email address</h2>
          <p style="color: #6b7280; font-size: 15px; margin: 0 0 32px 0; line-height: 1.5;">
            Use the code below to complete your Lomhea account setup. It expires in <strong>10 minutes</strong>.
          </p>

          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px solid #6ee7b7; border-radius: 14px; padding: 28px; text-align: center; margin-bottom: 32px;">
            <p style="font-size: 52px; font-weight: 900; letter-spacing: 18px; color: #059669; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.5;">
            If you didn't request this code, you can safely ignore this email. Your account won't be created without verification.
          </p>
          
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #d1d5db; font-size: 12px; margin: 0;">© 2025 Lomhea — Discover Cambodia</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${email}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Send OTP error:", err?.message || err);

    // Fallback for dev: return the code even if email fails
    if (isDev) {
      const fallbackCode = await (prisma as any).verification
        .findFirst({
          where: {
            identifier: `otp:${req.url ? new URL(req.url).searchParams.get("email") : ""}`,
          },
        })
        .catch(() => null);

      console.log(`\n🔑 DEV FALLBACK — check DB for OTP\n`);
      return NextResponse.json({
        success: true,
        devCode: null, // We can't recover the code here, user checks console
        warning: "Email failed — check server logs",
      });
    }

    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 },
    );
  }
}
