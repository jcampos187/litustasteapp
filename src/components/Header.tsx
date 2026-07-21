import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import CartDrawerButton from "./CartDrawerButton";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const { userId } = await auth();

  // Check if the user is an admin
  let isAdmin = false;
  if (userId) {
    try {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);
      isAdmin = !!dbUser && dbUser.role === "admin";
    } catch {
      // Gracefully handle DB errors
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-lt-cream-dark bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Litus Taste"
            className="h-10 w-10 rounded-xl object-contain"
          />
          <span className="flex flex-col">
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight tracking-tight text-lt-warm-brown">
              Litus <span className="lt-gradient-text">Taste</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-lt-olive">
              Comida Preparada
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/"
            className="lt-nav-link text-sm font-medium text-lt-charcoal/70 transition-colors hover:text-lt-green"
          >
            Inicio
          </Link>
          <Link
            href="/menu"
            className="lt-nav-link text-sm font-medium text-lt-charcoal/70 transition-colors hover:text-lt-green"
          >
            Menú Semanal
          </Link>
        </nav>

        {/* Right side: Cart + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Cart button */}
          <CartDrawerButton />

          {/* Mobile menu (md and below) */}
          <MobileMenu isAdmin={isAdmin} />

          {/* Desktop auth (md and up) */}
          <div className="hidden items-center gap-3 md:flex">
            {userId ? (
              <UserMenu isAdmin={isAdmin} />
            ) : (
              <Link
                href="/auth/sign-in"
                className="rounded-lg border border-lt-card-border px-5 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:border-lt-green/30 hover:text-lt-green"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
