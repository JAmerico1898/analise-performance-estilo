// src/components/landing/who-analyzes.tsx
export function WhoAnalyzes() {
  return (
    <section className="bg-graphite py-24">
      <div className="mx-auto max-w-[900px] px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">Quem analisa</p>
        <h2 className="font-display text-4xl font-bold text-snow md:text-5xl">José Américo Antunes</h2>
        <p className="mt-6 font-serif text-lg leading-relaxed text-snow">
          Projeto editorial independente sobre o Brasileirão Série A, baseado em dados oficiais da Opta / Twelve Football. O objetivo é descrever o que acontece em campo sem jargão, sem métrica pela métrica, sem ranking por ranking.
        </p>
        <p className="mt-4 font-serif text-lg leading-relaxed text-mist">
          Cada análise é assinada e responde a uma pergunta concreta: como foi a defesa? o time caiu de rendimento? a surpresa da rodada tem lastro?
        </p>
      </div>
    </section>
  );
}
