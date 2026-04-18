// src/components/landing/hero.tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-ink pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-neon">
          Brasileirão · Série A · 2026
        </p>
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-snow md:text-[72px]">
          Análise honesta,
          <br />
          <span className="text-neon">direto da matemática</span> do jogo.
        </h1>
        <p className="mt-6 max-w-xl font-serif text-lg text-mist md:text-xl">
          Defesa, transições, ataque e criação de chances dos 20 clubes da Série A — medidos, contextualizados e explicados em português direto.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-snow px-6 py-3 font-sans text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Explorar análises →
          </Link>
          <a
            href="#como-funciona"
            className="rounded-md border border-steel px-6 py-3 font-sans text-sm font-semibold text-snow hover:border-neon hover:text-neon"
          >
            Como funciona
          </a>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[1100px] px-6">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-steel bg-graphite shadow-[0_30px_60px_-20px_rgba(15,16,18,0.25)]">
          <video
            className="h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/hero-poster.jpg"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <img
            src="/videos/hero-poster.jpg"
            alt=""
            aria-hidden
            className="hidden h-full w-full object-cover motion-reduce:block"
          />
        </div>
      </div>
    </section>
  );
}
