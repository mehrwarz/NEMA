import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      const session = await verifyToken(token);

      if (!session?.user) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }

    } catch (error) {
      console.error("💥 Bounced: Error during token verification step:", error);
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};