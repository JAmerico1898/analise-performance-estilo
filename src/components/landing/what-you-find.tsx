// src/components/landing/what-you-find.tsx
const ITEMS = [
  {
    quality: "Defesa",
    color: "text-q-defesa",
    text: "Como o time se organiza sem a bola: compactação, altura defensiva, pressão.",
  },
  {
    quality: "Transições",
    color: "text-q-trans-of",
    text: "O que acontece nos 10 segundos após ganhar ou perder a bola.",
  },
  {
    quality: "Ataque",
    color: "text-q-ataque",
    text: "Finalizações, xG, grandes oportunidades. O ataque que mais fabrica chances.",
  },
  {
    quality: "Criação de chances",
    color: "text-q-criacao",
    text: "Passes decisivos, xT (ameaça esperada), toques na área.",
  },
];

export function WhatYouFind() {
  return (
    <section id="como-funciona" className="bg-ink py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">O que você vai encontrar</p>
        <h2 className="max-w-3xl font-display text-4xl font-bold text-snow md:text-5xl">
          Cinco qualidades do jogo, medidas rodada a rodada.
        </h2>
        <p className="mt-4 max-w-2xl font-serif text-lg text-mist">
          Cada jogo do Brasileirão é decomposto em cinco qualidades. Cada qualidade é explicada em métricas comparáveis — com Z-score para você ver o que é normal e o que é desvio.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {ITEMS.map((item) => (
            <div key={item.quality} className="rounded-lg border border-steel bg-graphite p-6">
              <p className={`font-display text-2xl font-bold ${item.color}`}>{item.quality}</p>
              <p className="mt-2 font-serif text-base text-snow">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
