// src/components/landing/hero.tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-24 md:pb-32">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-neon">Brasileirão · Série A · 2026</p>
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-snow md:text-[72px]">
          Análise honesta,<br />
          <span className="text-neon">direto da matemática</span> do jogo.
        </h1>
        <p className="mt-6 max-w-xl font-serif text-lg text-mist md:text-xl">
          Defesa, transições, ataque e criação de chances dos 20 clubes da Série A — medidos, contextualizados e explicados em português direto.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-neon px-6 py-3 font-sans text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Explorar análises →
          </Link>
          <a
            href="#como-funciona"
            className="rounded-md border border-mist/50 px-6 py-3 font-sans text-sm font-semibold text-snow hover:border-neon hover:text-neon"
          >
            Como funciona
          </a>
        </div>
      </div>
    </section>
  );
}
