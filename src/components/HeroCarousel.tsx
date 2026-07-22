"use client";

import { useState, useEffect, useRef } from "react";
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

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  const totalSlides = slides.length;

  const goTo = (index: number) => {
    setCurrent((index + totalSlides) % totalSlides);
  };

  /* ── Auto-play ────────────────────────────────────────────── */
  useEffect(() => {
    if (isPaused || isHovered) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 4500);
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
  }, []);

  return (
    <div
      className="animate-fade-in-up relative w-full"
      style={{ animationDelay: "0.2s" }}
    >
      {/* ── Card frame ─────────────────────────────────────── */}
      <div
        className="lt-hero-frame group relative aspect-square h-auto w-full overflow-hidden rounded-[20px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25),_0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-500 hover:shadow-[0_12px_56px_-16px_rgba(0,0,0,0.35),_0_0_0_1px_rgba(0,0,0,0.06)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Slides ─────────────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden rounded-[20px]">
          {slides.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                i === current
                  ? "scale-100 opacity-100 blur-0"
                  : i === (current - 1 + totalSlides) % totalSlides
                    ? "scale-[1.02] opacity-0 blur-[2px]"
                    : "scale-[1.04] opacity-0 blur-[4px]"
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
          ))}
        </div>

        {/* ── Gradient overlays ──────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-tr from-black/10 via-transparent to-amber-900/10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-2/5 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />

        {/* ── Previous / Next buttons ─────────────────────────── */}
        <div
          className={`absolute inset-x-0 top-1/2 z-[5] flex -translate-y-1/2 justify-between px-3 transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => goTo(currentRef.current - 1)}
            aria-label="Anterior"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-lt-charcoal shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-lt-terracotta hover:shadow-xl active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => goTo(currentRef.current + 1)}
            aria-label="Siguiente"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-lt-charcoal shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-lt-terracotta hover:shadow-xl active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* ── Bottom bar: dots + pause toggle ────────────────── */}
        <div className="absolute inset-x-0 bottom-0 z-[5] flex items-center justify-center gap-3 px-5 pb-5">
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-7 bg-white shadow-md"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                } h-1.5`}
              />
            ))}
          </div>

          {/* Pause / Play toggle */}
          <button
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? "Reanudar" : "Pausar"}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white/60 backdrop-blur-sm transition-all hover:bg-white/30 hover:text-white"
          >
            {isPaused ? (
              <Play className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* ── Counter badge (top-left) ─────────────────────────── */}
        <div className="absolute left-4 top-4 z-[5] rounded-full bg-black/30 px-2.5 py-1 text-[0.625rem] font-medium tracking-wider text-white/70 backdrop-blur-sm">
          {String(current + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </div>
        {/* ── Decorative frame glow (inside group for hover) ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 -z-10 rounded-[28px] border border-lt-green/5 bg-gradient-to-b from-white/30 to-transparent opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100"
        />
      </div>
    </div>
  );
}
