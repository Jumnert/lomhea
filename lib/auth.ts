import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { redisStorage } from "@better-auth/redis-storage";
import { redis } from "./redis";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
const isLocalDevelopment =
  process.env.NODE_ENV !== "production" && !process.env.VERCEL;
const configuredBaseUrl =
  isLocalDevelopment
    ? "http://localhost:3000"
    : process.env.BETTER_AUTH_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

const trustedOrigins = Array.from(
  new Set(
    [
      configuredBaseUrl,
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://lomhea.vercel.app",
    ].filter((origin): origin is string => Boolean(origin))
  )
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secondaryStorage: {
    get: async (key: string) => {
      const value = await redis.get(key);
      return value ? JSON.stringify(value) : null;
    },
    set: async (key: string, value: string, ttl?: number) => {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key: string) => {
      await redis.del(key);
    },
  },
  baseURL: configuredBaseUrl,
  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
    ...(discordClientId && discordClientSecret
      ? {
          discord: {
            clientId: discordClientId,
            clientSecret: discordClientSecret,
          },
        }
      : {}),
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
      coverImage: {
        type: "string",
        required: false,
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

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
