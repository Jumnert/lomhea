import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Check for protected routes like favorites or reviews
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
  matcher: ["/admin/:path*", "/favorites/:path*", "/request-place/:path*"],
};
