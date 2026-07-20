import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meals, weeklyMenus, weeklyMenuItems, dietaryTags } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import ScrollReveal from "@/components/ScrollReveal";

async function getActiveMenu() {
  try {
    const menu = await db
      .select()
      .from(weeklyMenus)
      .where(
        and(
          eq(weeklyMenus.isPublished, true),
          eq(weeklyMenus.isArchived, false)
        )
      )
      .orderBy(desc(weeklyMenus.createdAt))
      .limit(1);

    if (menu.length === 0) return null;

    const items = await db
      .select({
        id: meals.id,
        name: meals.name,
        description: meals.description,
        price: meals.price,
        currency: meals.currency,
        portionSize: meals.portionSize,
        imageUrl: meals.imageUrl,
        calories: meals.calories,
        proteinG: meals.proteinG,
        carbsG: meals.carbsG,
        fatG: meals.fatG,
        dietaryTags: meals.dietaryTags,
        displayOrder: weeklyMenuItems.displayOrder,
      })
      .from(weeklyMenuItems)
      .innerJoin(meals, eq(weeklyMenuItems.mealId, meals.id))
      .where(
        and(
          eq(weeklyMenuItems.weeklyMenuId, menu[0].id),
          eq(meals.isActive, true)
        )
      )
      .orderBy(weeklyMenuItems.displayOrder);

    const tags = await db.select().from(dietaryTags);

    return { menu: menu[0], items, tags };
  } catch {
    return null;
  }
}

export default async function Home() {
  const { userId } = await auth();
  const activeMenu = await getActiveMenu();

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HERO — Split layout with food imagery & vivid accents
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-lt-cream via-white to-lt-cream">
        {/* ── Animated gradient orbs (vivid, layered depth) ── */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] animate-float-slow rounded-full bg-lt-terracotta/10 blur-3xl" style={{animationDelay: '0s'}} />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-48 h-[700px] w-[700px] animate-float-medium rounded-full bg-lt-green/10 blur-3xl" style={{animationDelay: '2s'}} />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/3 top-1/4 h-[400px] w-[400px] animate-float-fast rounded-full bg-lt-amber/8 blur-[120px]" style={{animationDelay: '4s'}} />

        {/* ── Subtle dot-grid pattern overlay ── */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #15803D 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* ──────────────────────────────────
            MAIN CONTENT — Split layout
            ────────────────────────────────── */}
        <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center px-6 py-28 sm:py-32 lg:flex-row lg:py-40">
          {/* Left: Content */}
          <div className="flex-1 text-center lg:max-w-xl lg:text-left xl:max-w-2xl">
            {/* Premium badge — glassmorphism */}
            <div className="mb-8 inline-flex animate-fade-in-down items-center gap-2.5 rounded-full border border-lt-green/20 bg-white/90 px-5 py-2 shadow-lg shadow-lt-green/10 backdrop-blur-md">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-lt-green to-lt-green-light text-xs text-white">🌿</span>
              <span className="text-sm font-medium text-lt-olive-dark">
                Comida preparada fresca — Recibe en tu casa
              </span>
            </div>

            {/* Main heading — serif display */}
            <h1 className="animate-fade-in-up font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight text-lt-warm-brown sm:text-5xl md:text-6xl lg:text-7xl">
              Tu comida de la
              <br />
              <span className="lt-gradient-text">semana, preparada</span>
              <br />
              <span className="lt-gradient-fire">con amor</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-base leading-relaxed text-lt-charcoal/65 delay-100 sm:text-lg lg:mx-0">
              Menú semanal fresco, saludable y delicioso. Elige tus platillos
              favoritos y recibe todo listo para calentar y disfrutar.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex animate-fade-in-up flex-col items-center gap-4 delay-200 sm:flex-row lg:justify-start">
              <Link
                href="/menu"
                className="lt-btn group relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-lt-green px-9 text-base font-semibold text-white shadow-xl shadow-lt-green/25 transition-all hover:bg-lt-green-deep hover:shadow-2xl hover:shadow-lt-green/30 sm:w-auto"
              >
                <span className="relative z-10">Ver Menú Semanal</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
                {/* Shine effect */}
                <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              {!userId && (
                <Link
                  href="/auth/sign-up"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-lt-card-border px-8 text-base font-semibold text-lt-warm-brown transition-all hover:border-lt-terracotta/50 hover:bg-lt-terracotta/5 hover:text-lt-terracotta sm:w-auto"
                >
                  Crear Cuenta Gratis
                </Link>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex animate-fade-in-up flex-wrap items-center justify-center gap-8 text-xs text-lt-charcoal/40 delay-300 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <span className="text-sm">🥗</span> Ingredientes frescos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sm">🚚</span> Envío a domicilio
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sm">⏱️</span> Listo en minutos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sm">🇨🇷</span> Hecho en Costa Rica
              </span>
            </div>
          </div>

          {/* Right: Hero Image — hidden on mobile, shown lg+ */}
          <div className="mt-16 hidden flex-1 lg:mt-0 lg:flex lg:justify-end lg:pl-16">
            <div className="lt-hero-frame animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="lt-img-shine relative h-[420px] w-[420px] overflow-hidden rounded-[18px] shadow-2xl shadow-lt-green/15 xl:h-[520px] xl:w-[520px]">
                <Image
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                  alt="Bowl de comida fresca y saludable"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 0px, (max-width: 1280px) 420px, 520px"
                  priority
                />
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-tr from-lt-green/5 via-transparent to-lt-amber/5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Wave divider ── */}
        <div className="absolute -bottom-px left-0 right-0 h-20">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-full w-full">
            <path
              d="M0 80C240 40 480 0 720 40C960 80 1200 40 1440 20L1440 80L0 80Z"
              fill="#FFFFFF"
              opacity="1"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — 3 steps
         ═══════════════════════════════════════════════════════════ */}
      <ScrollReveal variant="fade-up" className="relative bg-white px-6 py-24 sm:py-28">
        {/* Decorative top line */}
        <div className="lt-divider absolute left-0 right-0 top-0" />

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-lt-olive">
              Cómo Funciona
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-lt-warm-brown sm:text-4xl">
              Comer bien nunca fue
              <br />
              <span className="lt-gradient-text">tan fácil</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                emoji: "📋",
                title: "Elige tu menú",
                desc: "Revisa el menú semanal y selecciona los platillos que más te gusten. Todos preparados con ingredientes frescos y naturales.",
                color: "from-lt-green/10 to-lt-green-pale/10",
                iconBg: "bg-lt-green/10",
              },
              {
                step: "02",
                emoji: "🛒",
                title: "Haz tu pedido",
                desc: "Agrega todo al carrito y confirma tu pedido antes del corte. Recibirás una confirmación al instante.",
                color: "from-lt-terracotta/10 to-lt-gold/10",
                iconBg: "bg-lt-terracotta/10",
              },
              {
                step: "03",
                emoji: "🍽️",
                title: "Disfruta",
                desc: "Recibe tus comidas listas en la puerta de tu casa. Solo calienta y disfruta. Más tiempo para lo que importa.",
                color: "from-lt-olive/10 to-lt-green-pale/10",
                iconBg: "bg-lt-olive/10",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} variant="fade-up" delay={i * 120} duration={500}>
                <div className="group relative overflow-hidden rounded-2xl border border-lt-card-border bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-lt-green-pale/50 hover:shadow-lg hover:shadow-lt-green/5">
                  {/* Step number */}
                  <span className="font-[family-name:var(--font-display)] absolute -right-4 -top-4 text-[5rem] font-bold leading-none text-lt-card-border/30 select-none">
                    {item.step}
                  </span>

                  {/* Icon */}
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${item.iconBg}`}
                  >
                    {item.emoji}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-lt-warm-brown">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-lt-charcoal/60">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════════════════════
          WEEKLY MENU PREVIEW
         ═══════════════════════════════════════════════════════════ */}
      <ScrollReveal variant="fade-up" className="relative bg-lt-cream px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal variant="fade-up" delay={100}>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-lt-olive">
                  Menú Semanal
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-lt-warm-brown sm:text-4xl">
                  {activeMenu
                    ? "Selecciona tus favoritos"
                    : "Menú disponible pronto"}
                </h2>
                <p className="mt-3 max-w-xl text-base text-lt-charcoal/60">
                  {activeMenu
                    ? "Elige los platillos que más te gusten para esta semana"
                    : "El menú se publica pronto. ¡Regístrate para recibir notificaciones!"}
                </p>
              </div>
              {activeMenu && (
                <Link
                  href="/menu"
                  className="lt-btn-outline inline-flex h-12 shrink-0 items-center gap-2 rounded-xl px-6 text-sm font-semibold"
                >
                  Ver menú completo
                  <span className="text-lg">→</span>
                </Link>
              )}
            </div>
          </ScrollReveal>

          <div className="mt-12 divide-y divide-lt-card-border border-t border-lt-card-border">
            {activeMenu?.items.slice(0, 6).map((item, i) => (
              <ScrollReveal key={item.id} variant="fade-up" delay={i * 80 + 200} duration={500}>
                <div className="flex items-center gap-4 py-4 sm:gap-6 sm:py-5">
                  {/* Small thumbnail */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-lt-green/10 to-lt-terracotta/10 sm:h-20 sm:w-20">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xl opacity-40">🍽️</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate text-base font-bold text-lt-warm-brown sm:text-lg">
                        {item.name}
                      </h3>
                      <span className="shrink-0 text-base font-bold text-lt-terracotta sm:text-lg">
                        ₡{parseInt(item.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-lt-charcoal/50 sm:mt-1">
                      {item.description}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {item.calories && (
                        <span className="text-[11px] text-lt-charcoal/40">
                          🔥 {item.calories} cal
                        </span>
                      )}
                      {item.proteinG && (
                        <span className="text-[11px] text-lt-charcoal/40">
                          💪 {item.proteinG}g prot.
                        </span>
                      )}
                      {item.dietaryTags &&
                        item.dietaryTags
                          .split(",")
                          .slice(0, 3)
                          .map((slug) => {
                            const tag = activeMenu?.tags.find((t) => t.slug === slug.trim());
                            return (
                              <span
                                key={slug}
                                className="inline-flex items-center gap-0.5 rounded-full bg-lt-green/8 px-2 py-0.5 text-[10px] font-medium text-lt-olive-dark"
                              >
                                {tag?.emoji && <span>{tag.emoji}</span>}
                                {tag?.name || slug}
                              </span>
                            );
                          })}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
            {!activeMenu && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-lt-green/5">
                  <span className="text-5xl">🍽️</span>
                </div>
                <p className="text-lg font-semibold text-lt-warm-brown">
                  El menú de esta semana estará disponible pronto
                </p>
                <p className="mt-2 text-sm text-lt-charcoal/40">
                  Vuelve pronto para ver las opciones de esta semana
                </p>
                {!userId && (
                  <Link
                    href="/auth/sign-up"
                    className="lt-btn mt-8 inline-flex h-12 items-center gap-2 rounded-xl px-7 text-sm font-semibold"
                  >
                    Crear Cuenta
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════════════════════
          STORY / ABOUT
         ═══════════════════════════════════════════════════════════ */}
      <ScrollReveal variant="fade-up" className="relative overflow-hidden bg-white px-6 py-24 sm:py-28">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-lt-terracotta/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-lt-green/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <ScrollReveal variant="fade-up" delay={100}>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-lt-terracotta/10 to-lt-gold/10 text-3xl">
              👨‍🍳
            </span>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={200}>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-lt-warm-brown sm:text-4xl">
              Hecho con ingredientes
              <br />
              <span className="lt-gradient-text">frescos y mucho amor</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={300}>
            <div className="mx-auto mt-8 max-w-2xl space-y-5 text-left text-base leading-relaxed text-lt-charcoal/70 sm:text-center">
              <p>
                En Litus Taste creemos que la buena comida empieza con buenos
                ingredientes. Seleccionamos productos frescos y naturales para
                preparar cada platillo con dedicación.
              </p>
              <p className="sm:text-lg sm:leading-relaxed">
                Nuestro objetivo es hacerte la vida más fácil: recibe tus comidas
                listas, solo calienta y disfruta. <strong>Más tiempo para lo que importa.</strong>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={400}>
            {/* Divider with emblem */}
            <div className="mx-auto mt-10 flex max-w-xs items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-lt-card-border to-transparent" />
              <span className="shrink-0 font-[family-name:var(--font-display)] text-2xl italic text-lt-olive">
                ♡
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-lt-card-border to-transparent" />
            </div>

            <p className="mt-4 text-sm font-medium text-lt-olive-dark">
              🇨🇷 Hecho en Costa Rica con mucho amor
            </p>
          </ScrollReveal>
        </div>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Final Call to Action
         ═══════════════════════════════════════════════════════════ */}
      <ScrollReveal variant="fade-up" className="relative px-6 py-24 sm:py-28">
        {/* Background with subtle gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lt-cream via-white to-lt-cream" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-lt-green/5 blur-[120px]" />

        <div className="relative mx-auto max-w-2xl text-center">
          <ScrollReveal variant="fade-up" delay={100}>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-lt-warm-brown sm:text-4xl">
              ¿Listo para comer rico
              <br />
              <span className="lt-gradient-text">esta semana?</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={200}>
            <p className="mx-auto mt-4 max-w-lg text-base text-lt-charcoal/60">
              Haz tu pedido antes del corte y recibe tus comidas frescas y listas
              para disfrutar.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={300}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/menu"
                className="lt-btn group relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-lt-green px-9 text-base font-semibold text-white shadow-xl shadow-lt-green/25 transition-all hover:bg-lt-green-deep hover:shadow-2xl hover:shadow-lt-green/30 sm:w-auto"
              >
                <span className="relative z-10">Ver Menú</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
                <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              {!userId && (
                <Link
                  href="/auth/sign-up"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-lt-card-border px-8 text-base font-semibold text-lt-warm-brown transition-all hover:border-lt-terracotta/50 hover:bg-lt-terracotta/5 hover:text-lt-terracotta sm:w-auto"
                >
                  Crear Cuenta Gratis
                </Link>
              )}
            </div>
          </ScrollReveal>
        </div>
      </ScrollReveal>
    </>
  );
}
