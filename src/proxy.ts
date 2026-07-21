import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/menu",
  "/auth(.*)",
  "/api/uploadthing",
  "/api/auth(.*)",
  "/api/settings",
  "/api/meals(.*)",
  "/api/orders(.*)",
]);

const authMiddleware = clerkMiddleware(async (auth, req) => {
  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
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
