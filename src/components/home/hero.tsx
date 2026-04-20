// src/components/home/hero.tsx
"use client";

export function Hero() {
  return (
    <section className="relative h-[calc(100svh-1cm)] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/fallback_poster/hero-match.jpg')" }}
      >
        <video
          src="/videos/hero-match.mp4"
          poster="/fallback_poster/hero-match.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="w-full h-full object-cover object-[center_55%]"
        />
      </div>
    </section>
  );
}
