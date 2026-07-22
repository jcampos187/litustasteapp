"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/* ── Optimized WebP dish photos ─────────────────────────────── */
const slides = [
  "/0c7005e0-f25a-4232-8b5c-8c52d5e92efc.webp",
  "/d51fbf36-ed3b-4c9d-adc8-9e151ef8cc9f.webp",
  "/a800ec98-4c44-460a-ad82-e19e89302dc1.webp",
  "/9208262f-8e60-45f6-81c5-e5d551782aa8.webp",
  "/8a35db6f-d3b1-4082-8a8d-3e6312ff3a2b.webp",
  "/8dfde07e-baff-474e-a360-d518194829b6.webp",
  "/ee69a6ed-b287-4ef9-846e-75cf473950ed.webp",
  "/ec28e03c-8353-4b2e-8638-78cc6c3d04b1.webp",
  "/a243935c-1967-4a29-a4c4-1dde134d2e8b.webp",
  "/27a8c128-475a-433b-9e51-30e6695b990a.webp",
  "/1e967c85-5b37-422d-b11a-6735b2b35ed0.webp",
];

const AUTOPLAY_INTERVAL = 5000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  const totalSlides = slides.length;

  const goTo = useCallback((index: number) => {
    setCurrent((index + totalSlides) % totalSlides);
  }, [totalSlides]);

  /* ── Auto-play ────────────────────────────────────────────── */
  useEffect(() => {
    if (isPaused || isHovered) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, AUTOPLAY_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, isHovered, totalSlides]);

  /* ── Keyboard navigation ──────────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(currentRef.current - 1);
      if (e.key === "ArrowRight") goTo(currentRef.current + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goTo]);

  return (
    <div className="animate-fade-in-up relative mx-auto w-full max-w-lg" style={{ animationDelay: "0.2s" }}>
      {/* ── Floating polaroid-style frame ─────────────────────── */}
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Main image card ──────────────────────────────────── */}
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl
                     shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.08)]
                     ring-1 ring-white/10
                     transition-all duration-500
                     group-hover:shadow-[0_28px_80px_-20px_rgba(0,0,0,0.4),_0_0_0_1px_rgba(255,255,255,0.12)]
                     group-hover:-translate-y-1"
        >
          {/* Slides with Ken Burns CSS animation */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {slides.map((src, i) => (
              <div
                key={src}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
                  i === current ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className={`relative h-full w-full ${
                    i === current ? "animate-ken-burns" : "scale-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Platillo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px"
                    priority={i < 2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Gradient overlays ──────────────────────────────── */}
          <div className="pointer-events-none absolute inset-0 z-[2] rounded-2xl bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-20 bg-gradient-to-b from-black/20 to-transparent" />

          {/* ── Top badge: glassmorphism category pill ──────────── */}
          <div className="absolute left-4 top-4 z-[5]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[0.65rem] font-semibold tracking-wider text-white/90 shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lt-green" />
              {String(current + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
          </div>

          {/* ── Previous / Next buttons ─────────────────────────── */}
          <div
            className={`absolute inset-x-0 top-1/2 z-[5] flex -translate-y-1/2 justify-between px-2 transition-all duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={() => goTo(currentRef.current - 1)}
              aria-label="Anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lt-charcoal shadow-lg shadow-black/15 backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-lt-terracotta hover:shadow-xl hover:-translate-x-0.5 active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goTo(currentRef.current + 1)}
              aria-label="Siguiente"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lt-charcoal shadow-lg shadow-black/15 backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-lt-terracotta hover:shadow-xl hover:translate-x-0.5 active:scale-90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* ── Bottom controls: pause/play ────────────────────── */}
          <div className="absolute bottom-4 left-1/2 z-[5] -translate-x-1/2">
            <button
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? "Reanudar" : "Pausar"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white/70 backdrop-blur-sm transition-all hover:bg-white/30 hover:text-white active:scale-90"
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* ── Decorative frame glow ─────────────────────────── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 -z-10 rounded-[28px] border border-lt-green/5 bg-gradient-to-b from-white/30 to-transparent opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100"
          />
        </div>
      </div>

      {/* ── Thumbnail strip ────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-center gap-2 px-2">
        <button
          onClick={() => goTo(currentRef.current - 1)}
          aria-label="Anterior"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-lt-charcoal/50 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-lt-terracotta active:scale-90"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto snap-x snap-mandatory py-1">
          {slides.map((src, i) => (
            <button
              key={src}
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={`snap-start relative shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                i === current
                  ? "h-14 w-14 scale-110 ring-2 ring-lt-terracotta ring-offset-2 ring-offset-white shadow-md"
                  : "h-12 w-12 opacity-60 hover:opacity-90 hover:scale-105"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
              {i === current && (
                <div className="absolute inset-0 bg-lt-terracotta/10" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => goTo(currentRef.current + 1)}
          aria-label="Siguiente"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-lt-charcoal/50 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-lt-terracotta active:scale-90"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
