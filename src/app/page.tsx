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
          HERO — Full-viewport premium hero
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] overflow-hidden bg-gradient-to-b from-lt-cream via-white to-lt-cream">
        {/* Large decorative background shapes */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-lt-terracotta/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-lt-olive/5 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-[300px] w-[300px] rounded-full bg-lt-gold/5 blur-[120px]" />

        {/* Subtle pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #2D6A4F 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center px-6 py-28 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            {/* Premium badge */}
            <div className="mb-8 inline-flex animate-fade-in-down items-center gap-2.5 rounded-full border border-lt-olive/20 bg-white px-5 py-2 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lt-green/10 text-xs">🌿</span>
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
        </div>

        {/* Curved divider */}
        <div className="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-lt-cream to-transparent" />
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
