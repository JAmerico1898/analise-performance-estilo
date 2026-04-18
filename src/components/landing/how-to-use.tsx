// src/components/landing/how-to-use.tsx
const JOURNEYS = [
  {
    persona: "Jornalista",
    question: "Como foi o Flamengo contra o Vasco?",
    flow: "Bloco 1 — Clube vs Clube. Comparação direta por qualidade no jogo específico.",
  },
  {
    persona: "Analista",
    question: "Por que o Palmeiras caiu de rendimento?",
    flow: "Bloco 3 — Clube na Competição. Média móvel rodada a rodada, drill-down por métrica.",
  },
  {
    persona: "Torcedor",
    question: "Meu time joga bem ou tá enganando?",
    flow: "Bloco 2 — Clube na Rodada. A última partida em contexto, com análise em texto.",
  },
];

export function HowToUse() {
  return (
    <section className="bg-ink py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">Como usar</p>
        <h2 className="font-display text-4xl font-bold text-snow md:text-5xl">Três jeitos de entrar.</h2>

        <div className="mt-12 space-y-4">
          {JOURNEYS.map((j) => (
            <div key={j.persona} className="rounded-lg border border-steel bg-graphite p-6 md:flex md:items-center md:gap-8">
              <div className="md:w-48">
                <p className="font-mono text-xs uppercase tracking-widest text-mist">{j.persona}</p>
                <p className="font-display text-xl font-semibold text-neon">"{j.question}"</p>
              </div>
              <p className="mt-3 font-serif text-base text-snow md:mt-0 md:flex-1">{j.flow}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
