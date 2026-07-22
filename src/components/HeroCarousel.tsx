"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/* ── All dish photos from the public folder ──────────────────── */
const images = [
  "/0c7005e0-f25a-4232-8b5c-8c52d5e92efc.jpeg",
  "/d51fbf36-ed3b-4c9d-adc8-9e151ef8cc9f.jpeg",
  "/a800ec98-4c44-460a-ad82-e19e89302dc1.jpeg",
  "/9208262f-8e60-45f6-81c5-e5d551782aa8.jpeg",
  "/8a35db6f-d3b1-4082-8a8d-3e6312ff3a2b.jpeg",
  "/8dfde07e-baff-474e-a360-d518194829b6.jpeg",
  "/ee69a6ed-b287-4ef9-846e-75cf473950ed.jpeg",
  "/ec28e03c-8353-4b2e-8638-78cc6c3d04b1.jpeg",
  "/a243935c-1967-4a29-a4c4-1dde134d2e8b.jpeg",
  "/27a8c128-475a-433b-9e51-30e6695b990a.jpeg",
  "/1e967c85-5b37-422d-b11a-6735b2b35ed0.jpeg",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  if (images.length === 0) return null;

  const totalSlides = images.length;

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
      className="lt-hero-frame animate-fade-in-up relative aspect-square h-auto w-full overflow-hidden rounded-[18px] shadow-2xl shadow-lt-green/15"
      style={{ animationDelay: "0.2s" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Slides ───────────────────────────────────────── */}

      {/* Previous slide (for seamless pre-fetch) */}
      <div className="absolute inset-0 overflow-hidden rounded-[18px]">
        {images.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === current
                ? "scale-100 opacity-100 blur-0"
                : i === (current - 1 + totalSlides) % totalSlides
                  ? "scale-105 opacity-0 blur-sm"
                  : "scale-110 opacity-0 blur-sm"
            }`}
          >
            <Image
              src={src}
              alt={`Platillo ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 520px"
              priority={i < 2}
              loading={i < 2 ? undefined : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* ── Gradient overlays ─────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-lt-green/8 via-transparent to-lt-amber/8 z-[2]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 via-black/10 to-transparent z-[2]" />

      {/* ── Previous / Next buttons ───────────────────────── */}
      <div
        className={`absolute inset-x-0 top-1/2 z-[5] flex -translate-y-1/2 justify-between px-3 transition-all duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => goTo(currentRef.current - 1)}
          aria-label="Anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lt-charcoal backdrop-blur-sm transition-all hover:bg-white hover:text-lt-terracotta hover:shadow-lg active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => goTo(currentRef.current + 1)}
          aria-label="Siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lt-charcoal backdrop-blur-sm transition-all hover:bg-white hover:text-lt-terracotta hover:shadow-lg active:scale-90"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Bottom bar: dots + pause toggle ───────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-[5] flex items-center justify-center gap-2 px-4 pb-4">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={`rounded-full transition-all duration-500 ${
                i === current
                  ? "w-6 bg-white shadow-md"
                  : "w-1.5 bg-white/50 hover:bg-white/80"
              } h-1.5`}
            />
          ))}
        </div>

        {/* Pause / Play toggle */}
        <button
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Reanudar" : "Pausar"}
          className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white/70 backdrop-blur-sm transition-all hover:bg-white/30 hover:text-white"
        >
          {isPaused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* ── Counter badge (top-left) ──────────────────────── */}
      <div className="absolute left-3 top-3 z-[5] rounded-full bg-black/30 px-2.5 py-1 text-[0.65rem] font-medium text-white/80 backdrop-blur-sm">
        {current + 1} / {totalSlides}
      </div>
    </div>
  );
}
