"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type AnimationVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation direction / style */
  variant?: AnimationVariant;
  /** Delay in ms before animating (for staggering) */
  delay?: number;
  /** Duration in ms */
  duration?: number;
  /** Additional classes for the wrapper */
  className?: string;
  /** Whether to animate only once (default true) */
  once?: boolean;
  /** HTML tag to render (default: section) */
  as?: ElementType;
}

const variantStyles: Record<AnimationVariant, string> = {
  "fade-up": "translate-y-8",
  "fade-down": "-translate-y-8",
  "fade-left": "translate-x-8",
  "fade-right": "-translate-x-8",
  scale: "scale-[0.96]",
  none: "",
};

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 600,
  className = "",
  once = true,
  as: Tag = "section",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, once]);

  return (
    <Tag
      ref={ref}
      className={`${className} sr-hidden transition-all ${variantStyles[variant]} ${
        isVisible ? "!opacity-100 !translate-y-0 !translate-x-0 !scale-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
