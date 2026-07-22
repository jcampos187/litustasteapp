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
    <div className="animate-fade-in-up mx-auto w-full max-w-[280px] sm:max-w-sm" style={{ animationDelay: "0.2s" }}>
      {/* ── Container with lt-hero-frame gradient border ──────── */}
      <div className="lt-hero-frame group relative">
        <div
          className="lt-img-shine relative overflow-hidden rounded-[18px] shadow-2xl shadow-lt-green/15 transition-all duration-500 group-hover:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* ── Inner image area (3:4 portrait) ─────────────────── */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px]">
            {/* Slides */}
            <div className="absolute inset-0">
              {slides.map((src, i) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Platillo ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                    priority={i < 2}
                  />
                </div>
              ))}
            </div>

            {/* ── Gradient depth overlay ───────────────────────── */}
            <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* ── Top badge ──────────────────────────────────────── */}
            <div className="absolute left-3 top-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[0.6rem] font-semibold tracking-wider text-white/80 shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lt-green/80" />
                {String(current + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </span>
            </div>

            {/* ── Previous / Next buttons ─────────────────────────── */}
            <div
              className={`absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-1.5 transition-all duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <button
                onClick={() => goTo(currentRef.current - 1)}
                aria-label="Anterior"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/70 shadow-lg shadow-black/20 backdrop-blur-lg transition-all duration-200 hover:bg-white/25 hover:text-white hover:-translate-x-0.5 active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goTo(currentRef.current + 1)}
                aria-label="Siguiente"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/70 shadow-lg shadow-black/20 backdrop-blur-lg transition-all duration-200 hover:bg-white/25 hover:text-white hover:translate-x-0.5 active:scale-90"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* ── Bottom controls: pause/play ────────────────────── */}
            <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
              <button
                onClick={() => setIsPaused((p) => !p)}
                aria-label={isPaused ? "Reanudar" : "Pausar"}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white/50 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white active:scale-90"
              >
                {isPaused ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Pagination dots ────────────────────────────────── */}
        <div className="mt-3 flex items-center justify-center gap-1.5 px-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={`rounded-full transition-all duration-500 ${
                i === current
                  ? "w-5 bg-lt-green/70"
                  : "w-1.5 bg-lt-charcoal/20 hover:bg-lt-charcoal/40"
              } h-1.5`}
            />
          ))}
        </div>
      </div>

      {/* ── Thumbnail strip ────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-center gap-1.5 px-2">
        <button
          onClick={() => goTo(currentRef.current - 1)}
          aria-label="Anterior"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-lt-charcoal/5 text-lt-charcoal/40 transition-all hover:bg-lt-charcoal/10 hover:text-lt-charcoal/70 active:scale-90"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto snap-x snap-mandatory py-1">
          {slides.map((src, i) => (
            <button
              key={src}
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={`snap-start relative shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                i === current
                  ? "h-10 w-10 scale-110 ring-2 ring-lt-green/50 shadow-md"
                  : "h-8 w-8 opacity-50 hover:opacity-80 hover:scale-105"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => goTo(currentRef.current + 1)}
          aria-label="Siguiente"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-lt-charcoal/5 text-lt-charcoal/40 transition-all hover:bg-lt-charcoal/10 hover:text-lt-charcoal/70 active:scale-90"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
