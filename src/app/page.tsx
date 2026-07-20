import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meals, weeklyMenus, weeklyMenuItems, dietaryTags } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import MealCard from "@/components/MealCard";

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
          HERO — Full-viewport premium hero w/ SVG art & animations
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-lt-cream via-white to-lt-cream">
        {/* ── Animated gradient orbs (deeper, layered blur) ── */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] animate-float-slow rounded-full bg-lt-terracotta/6 blur-3xl" style={{animationDelay: '0s'}} />
        <div className="pointer-events-none absolute -bottom-48 -left-48 h-[700px] w-[700px] animate-float-medium rounded-full bg-lt-olive/6 blur-3xl" style={{animationDelay: '2s'}} />
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-[400px] w-[400px] animate-float-fast rounded-full bg-lt-gold/6 blur-[120px]" style={{animationDelay: '4s'}} />

        {/* ── Subtle dot-grid pattern overlay ── */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #2D6A4F 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* ──────────────────────────────────
            DECORATIVE FLOATING SVG ELEMENTS
            ────────────────────────────────── */}

        {/* Leaf — top left */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[6%] top-[12%] hidden animate-float-slow opacity-15 sm:block" style={{animationDelay: '0.5s'}}>
          <svg width="70" height="90" viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M35 90C35 90 5 68 5 38C5 17 18 0 35 0C52 0 65 17 65 38C65 68 35 90 35 90Z" fill="url(#leafGrad1)" opacity="0.7"/>
            <path d="M35 88L35 10" stroke="#2D6A4F" strokeWidth="1.2" strokeLinecap="round" opacity="0.25"/>
            <defs>
              <linearGradient id="leafGrad1" x1="35" y1="0" x2="35" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#52B788"/>
                <stop offset="1" stopColor="#2D6A4F"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Small leaf — right side */}
        <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-[18%] hidden animate-float-medium opacity-12 sm:block" style={{animationDelay: '1.5s'}}>
          <svg width="40" height="55" viewBox="0 0 40 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 55C20 55 3 40 3 22C3 10 10 0 20 0C30 0 37 10 37 22C37 40 20 55 20 55Z" fill="url(#leafGrad2)" opacity="0.7"/>
            <path d="M20 54L20 6" stroke="#40916C" strokeWidth="1" strokeLinecap="round" opacity="0.2"/>
            <defs>
              <linearGradient id="leafGrad2" x1="20" y1="0" x2="20" y2="55" gradientUnits="userSpaceOnUse">
                <stop stopColor="#95D5B2"/>
                <stop offset="1" stopColor="#40916C"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Herb sprig — bottom left */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[18%] left-[5%] hidden animate-sway opacity-15 lg:block" style={{animationDelay: '0.8s'}}>
          <svg width="50" height="70" viewBox="0 0 50 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 70C25 70 10 50 10 30C10 15 17 5 25 5" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            <path d="M25 70C25 70 40 50 40 30C40 15 33 5 25 5" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
            <ellipse cx="15" cy="25" rx="6" ry="4" fill="#95D5B2" opacity="0.3" transform="rotate(-20 15 25)"/>
            <ellipse cx="35" cy="20" rx="6" ry="4" fill="#95D5B2" opacity="0.25" transform="rotate(20 35 20)"/>
            <ellipse cx="20" cy="12" rx="5" ry="3.5" fill="#95D5B2" opacity="0.35" transform="rotate(-10 20 12)"/>
            <ellipse cx="30" cy="8" rx="5" ry="3.5" fill="#95D5B2" opacity="0.3" transform="rotate(15 30 8)"/>
          </svg>
        </div>

        {/* Floating food emojis */}
        <div aria-hidden="true" className="pointer-events-none absolute left-[12%] top-[38%] hidden animate-float-slow opacity-25 sm:block" style={{animationDelay: '1s'}}>
          <span className="text-3xl drop-shadow-sm">🥗</span>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute right-[18%] top-[30%] hidden animate-float-medium opacity-20 lg:block" style={{animationDelay: '2s'}}>
          <span className="text-2xl drop-shadow-sm">🌿</span>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[28%] left-[14%] hidden animate-float-fast opacity-20 sm:block" style={{animationDelay: '0.3s'}}>
          <span className="text-2xl drop-shadow-sm">🥑</span>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute right-[8%] bottom-[35%] hidden animate-float-slow opacity-15 lg:block" style={{animationDelay: '1.8s'}}>
          <span className="text-xl drop-shadow-sm">🍅</span>
        </div>

        {/* ──────────────────────────────────
            FOOD ART — Concentric rings + Plate
            (desktop only, right side)
            ────────────────────────────────── */}
        <div aria-hidden="true" className="pointer-events-none absolute right-[2%] top-[10%] hidden animate-fade-in-up xl:block">
          <div className="relative h-[380px] w-[380px]">
            {/* Ring 1 — outermost */}
            <div className="absolute inset-0 animate-spin-slow rounded-full border border-lt-green/10" />
            {/* Ring 2 */}
            <div className="absolute inset-[35px] animate-spin-reverse rounded-full border-2 border-lt-terracotta/8" />
            {/* Ring 3 — dashed */}
            <div className="absolute inset-[70px] animate-spin-slow rounded-full border border-dashed border-lt-gold/10" style={{animationDuration: '40s'}} />
            {/* Ring 4 */}
            <div className="absolute inset-[105px] animate-spin-reverse rounded-full border border-lt-green-pale/15" style={{animationDuration: '20s'}} />

            {/* Center — Plate with food SVG */}
            <div className="absolute inset-[120px] flex items-center justify-center">
              <div className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full bg-gradient-to-br from-white/80 to-lt-cream-dark/60 shadow-inner backdrop-blur-sm">
                {/* Plate rim */}
                <svg viewBox="0 0 140 140" className="absolute inset-0 h-full w-full">
                  <ellipse cx="70" cy="70" rx="68" ry="66" fill="none" stroke="#E8E3DC" strokeWidth="1.5" opacity="0.8"/> {/* Plate outer rim */}
                  <ellipse cx="70" cy="70" rx="55" ry="53" fill="#FDFBF7" opacity="0.5"/> {/* Plate inner */}
                  {/* Food — main protein */}
                  <ellipse cx="70" cy="70" rx="38" ry="30" fill="#F5F0E8" opacity="0.6"/> {/* Base */}
                  {/* Grilled protein shape */}
                  <ellipse cx="65" cy="65" rx="22" ry="14" fill="#C3734E" opacity="0.35" transform="rotate(-15 65 65)"/>
                  {/* Rice/grain side */}
                  <ellipse cx="78" cy="78" rx="16" ry="10" fill="#E8C45A" opacity="0.3" transform="rotate(10 78 78)"/>
                  {/* Vegetable side */}
                  <ellipse cx="55" cy="77" rx="12" ry="8" fill="#52B788" opacity="0.3" transform="rotate(-10 55 77)"/>
                  {/* Garnish dots */}
                  <circle cx="50" cy="55" r="2.5" fill="#2D6A4F" opacity="0.25"/>
                  <circle cx="78" cy="58" r="2" fill="#C3734E" opacity="0.25"/>
                  <circle cx="62" cy="52" r="1.5" fill="#D4A017" opacity="0.3"/>
                </svg>
                {/* Steam lines */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex gap-2">
                    <div className="h-6 w-0.5 animate-steam rounded-full bg-lt-warm-brown/10" />
                    <div className="h-8 w-0.5 animate-steam-delayed rounded-full bg-lt-warm-brown/10" />
                    <div className="h-5 w-0.5 animate-steam rounded-full bg-lt-warm-brown/10" style={{animationDelay: '1s'}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────
            MAIN CONTENT
            ────────────────────────────────── */}
        <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 py-28 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            {/* Premium badge — glassmorphism */}
            <div className="mb-8 inline-flex animate-fade-in-down items-center gap-2.5 rounded-full border border-lt-olive/15 bg-white/80 px-5 py-2 shadow-lg shadow-lt-green/5 backdrop-blur-md">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-lt-green/10 to-lt-green-pale/20 text-xs">🌿</span>
              <span className="text-sm font-medium text-lt-olive-dark">
                Comida preparada fresca — Recibe en tu casa
              </span>
            </div>

            {/* Main heading — serif display */}
            <h1 className="animate-fade-in-up font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.08] tracking-tight text-lt-warm-brown sm:text-6xl md:text-7xl lg:text-8xl">
              Tu comida de la
              <br />
              <span className="lt-gradient-text">semana, preparada</span>
              <br />
              con amor
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-base leading-relaxed text-lt-charcoal/65 delay-100 sm:text-lg md:text-xl">
              Menú semanal fresco, saludable y delicioso. Elige tus platillos
              favoritos y recibe todo listo para calentar y disfrutar.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex animate-fade-in-up flex-col items-center justify-center gap-4 delay-200 sm:flex-row">
              <Link
                href="/menu"
                className="lt-btn group relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-lt-green px-9 text-base font-semibold text-white shadow-xl shadow-lt-green/25 transition-all hover:bg-lt-green-deep hover:shadow-2xl hover:shadow-lt-green/30 sm:w-auto"
              >
                <span className="relative z-10">Ver Menú Semanal</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
                {/* Shine effect */}
                <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              {!userId && (
                <Link
                  href="/auth/sign-up"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-lt-card-border px-8 text-base font-semibold text-lt-warm-brown transition-all hover:border-lt-green/40 hover:bg-lt-green/5 hover:text-lt-green sm:w-auto"
                >
                  Crear Cuenta Gratis
                </Link>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex animate-fade-in-up flex-wrap items-center justify-center gap-8 text-xs text-lt-charcoal/40 delay-300">
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

          {/* ── Scroll indicator ── */}
          <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 animate-fade-in-up flex-col items-center gap-2 sm:flex" style={{animationDelay: '1s'}}>
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-lt-charcoal/25">
              Descubre
            </span>
            {/* Mouse icon */}
            <div className="relative h-7 w-[18px] rounded-full border-2 border-lt-charcoal/20">
              <div className="animate-scroll-wheel absolute left-1/2 top-1.5 h-[5px] w-[2px] -translate-x-1/2 rounded-full bg-lt-charcoal/30" />
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
      <section className="relative bg-white px-6 py-24 sm:py-28">
        {/* Decorative top line */}
        <div className="lt-divider absolute left-0 right-0 top-0" />

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-lt-olive">
              Cómo Funciona
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-lt-warm-brown sm:text-5xl">
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
            ].map((item) => (
              <div
                key={item.step}
                className="group relative overflow-hidden rounded-2xl border border-lt-card-border bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-lt-green-pale/50 hover:shadow-lg hover:shadow-lt-green/5"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WEEKLY MENU PREVIEW
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-lt-cream px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-lt-olive">
                Menú Semanal
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-lt-warm-brown sm:text-5xl">
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

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeMenu?.items.slice(0, 6).map((item, i) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <MealCard meal={item} tags={activeMenu.tags} />
              </div>
            ))}
            {!activeMenu && (
              <div className="col-span-full py-20 text-center">
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
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STORY / ABOUT
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white px-6 py-24 sm:py-28">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-lt-terracotta/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-lt-green/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-lt-terracotta/10 to-lt-gold/10 text-3xl">
            👨‍🍳
          </span>

          <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-lt-warm-brown sm:text-5xl">
            Hecho con ingredientes
            <br />
            <span className="lt-gradient-text">frescos y mucho amor</span>
          </h2>

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
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Final Call to Action
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-24 sm:py-28">
        {/* Background with subtle gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lt-cream via-white to-lt-cream" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-lt-green/5 blur-[120px]" />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-lt-warm-brown sm:text-5xl">
            ¿Listo para comer rico
            <br />
            <span className="lt-gradient-text">esta semana?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-lt-charcoal/60">
            Haz tu pedido antes del corte y recibe tus comidas frescas y listas
            para disfrutar.
          </p>

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
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-lt-card-border px-8 text-base font-semibold text-lt-warm-brown transition-all hover:border-lt-green/40 hover:bg-lt-green/5 hover:text-lt-green sm:w-auto"
              >
                Crear Cuenta Gratis
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
