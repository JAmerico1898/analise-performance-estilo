// src/components/home/match-dynamics.tsx
import dashboard from "@/data/compiled/dashboard.json";
import type { Dashboard, QualitySlug } from "@/types/data";

const data = dashboard as Dashboard;

const ACCENT: Record<QualitySlug, string> = {
  defesa: "#00f4fe",
  trans_defensiva: "#abd600",
  trans_ofensiva: "#63f7ff",
  ataque: "#c3f400",
  criacao_de_chances: "#00f4fe",
};

export function MatchDynamics() {
  return (
    <section id="dynamics" className="bg-[#060e20] py-20 md:py-24">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mb-10 flex flex-col items-start gap-10 md:mb-4 md:flex-row md:gap-12">
          <div className="md:w-1/3">
            <h2 className="mb-4 text-3xl font-bold uppercase tracking-tight text-[#dae2fd] md:text-4xl">
              Desempenho da rodada
            </h2>
            <div className="kinetic-gradient mb-6 h-1 w-16" />
            <p className="text-sm leading-relaxed text-[#c4c9ac]">
              Os líderes de cada qualidade na rodada {data.rodada}.
            </p>
          </div>

          <div className="grid w-full flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {data.leaders.map((leader) => {
              const accent = ACCENT[leader.quality];
              return (
                <div
                  key={leader.quality}
                  className="border-l-2 bg-[#131b2e] px-2 py-3"
                  style={{ borderLeftColor: accent }}
                >
                  <p
                    className="mb-1 font-mono text-[9px] uppercase tracking-wider leading-tight"
                    style={{ color: accent }}
                  >
                    {leader.label}
                  </p>
                  <div
                    className="whitespace-nowrap text-[#dae2fd] font-black leading-tight"
                    style={{ fontSize: "clamp(0.75rem, 1.1vw, 1rem)" }}
                  >
                    {leader.displayName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
