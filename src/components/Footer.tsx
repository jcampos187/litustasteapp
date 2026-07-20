import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-lt-cream-dark bg-lt-warm-brown text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
          <img
                src="/logo.png"
                alt="Litus Taste"
                className="h-10 w-10 rounded-xl object-contain"
              />
              <span className="flex flex-col">
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-white">
                  Litus <span className="text-lt-gold-light">Taste</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-lt-sage">
                  Comida Preparada
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Comida preparada fresca y deliciosa. Hecho con ingredientes
              naturales y mucho amor en Costa Rica. 🇨🇷
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-lt-gold-light">
              Navegación
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Menú Semanal
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Mis Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-lt-gold-light">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@litustaste.com"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  info@litustaste.com
                </a>
              </li>
              <li>
                <span className="text-sm text-white/60">
                  Costa Rica 🇨🇷
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Litus Taste. Todos los derechos reservados.
          </p>
          <p className="mt-2 text-xs text-white/30">
            Hecho con <span className="text-lt-terracotta-light">❤️</span> en{" "}
            <span className="text-lt-gold-light">Costa Rica</span>{" "}
            <span role="img" aria-label="Bandera de Costa Rica">🇨🇷</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
