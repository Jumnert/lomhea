import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function proxy(request: NextRequest) {
  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const identifier = `ratelimit_${ip}_${userAgent.substring(0, 50)}`;

    const { success, limit, reset, remaining } =
      await ratelimit.limit(identifier);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter: reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }
  }

  // 2. Auth Protection for Admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Auth Protection for User routes
  if (
    request.nextUrl.pathname.startsWith("/favorites") ||
    request.nextUrl.pathname.startsWith("/request-place")
  ) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
