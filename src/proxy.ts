import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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
  // Always call auth() to hydrate the auth context — this is essential
  // for OAuth logins (Google, etc.) where the session cookie needs to be
  // verified on the server side so that downstream auth() calls in server
  // components return the correct userId.
  const { userId } = await auth();

  // Protect non-public routes from unauthenticated users
  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
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
