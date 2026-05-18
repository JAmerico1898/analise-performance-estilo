// src/components/home/hero.tsx
"use client";

export function Hero() {
  return (
    <section className="relative h-[55svh] md:h-[70svh] lg:h-[calc(100svh-1cm)] flex items-center overflow-hidden">
      <video
        src="/videos/hero-match.mp4?v=2026-04-22"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 z-0 w-full h-full object-cover object-[center_55%]"
      />
    </section>
  );
}
