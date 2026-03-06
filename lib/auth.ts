import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: any;
      url: string;
    }) => {
      try {
        await resend.emails.send({
          from: `Lomhea <${fromEmail}>`,
          to: user.email,
          subject: "Reset your password - Lomhea",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #10b981;">Password Reset Request</h2>
              <p>We received a request to reset your password for your Lomhea account.</p>
              <div style="margin: 30px 0;">
                <a href="${url}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;">${url}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px;">The Lomhea Team</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send reset email:", err);
      }
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
      },
      banned: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },

  events: {
    user: {
      created: async ({ user }: { user: any }) => {
        // Automatically make the primary test email an ADMIN
        if (user.email === "chountheachumnith@gmail.com") {
          await (prisma.user as any).update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
        }
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: any;
      url: string;
    }) => {
      try {
        await resend.emails.send({
          from: `Lomhea <${fromEmail}>`,
          to: user.email,
          subject: "Verify your email - Lomhea",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #10b981;">Welcome to Lomhea!</h2>
              <p>Thank you for joining our community of explorers. Please verify your email to unlock all features.</p>
              <div style="margin: 30px 0;">
                <a href="${url}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Email Address</a>
              </div>
              <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;">${url}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px;">This email was sent by Lomhea. If you didn't create an account, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    },
  },
  plugins: [],
});
