/**
 * Next.js middleware — re-exports the Clerk auth middleware from proxy.ts.
 *
 * Next.js ONLY discovers middleware in files named `middleware.ts` at the
 * root or `src/` directory. Without this file, the Clerk middleware never
 * runs and `auth()` in server components cannot reliably read OAuth session
 * cookies (e.g. Google sign-in).
 */
export { proxy as default, config } from "./proxy";
