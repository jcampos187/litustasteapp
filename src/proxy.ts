import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/menu",
  "/auth(.*)",
  "/api/uploadthing",
  "/api/auth(.*)",
]);

const authMiddleware = clerkMiddleware(async (auth, req) => {
  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // For admin routes, also check admin role
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.public_metadata as
      | Record<string, unknown>
      | undefined;
    const role = metadata?.role as string | undefined;

    if (role !== "admin") {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }
});

export function proxy(request: NextRequest, _event: any) {
  return authMiddleware(request, _event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
