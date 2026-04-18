// src/components/home/match-dynamics.tsx
import dashboard from "@/data/compiled/dashboard.json";
import type { Dashboard, QualitySlug } from "@/types/data";

const data = dashboard as Dashboard;

const ACCENT: Record<QualitySlug, string> = {
  trans_defensiva: "#abd600",
  trans_ofensiva: "#63f7ff",
  ataque: "#c3f400",
  criacao_de_chances: "#00f4fe",
};

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

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

          <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.leaders.map((leader) => {
              const accent = ACCENT[leader.quality];
              const width = clamp01(leader.z / 3);
              return (
                <div
                  key={leader.quality}
                  className="border-l-2 bg-[#131b2e] p-6"
                  style={{ borderLeftColor: accent }}
                >
                  <p
                    className="mb-2 font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: accent }}
                  >
                    {leader.label}
                  </p>
                  <div className="truncate text-xl font-black leading-tight text-[#dae2fd] md:text-2xl">
                    {leader.displayName}
                  </div>
                  <div className="mt-4 h-1 w-full overflow-hidden bg-[#2d3449]">
                    <div
                      className="h-full"
                      style={{ width: `${width * 100}%`, backgroundColor: accent }}
                    />
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
