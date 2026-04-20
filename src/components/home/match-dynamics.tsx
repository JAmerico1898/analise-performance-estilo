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
    <section id="dynamics" className="bg-[#f3f4f6] py-20 md:py-24">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mb-10 flex flex-col items-start gap-10 md:mb-4 md:flex-row md:gap-12">
          <div className="md:w-1/3">
            <h2 className="mb-4 text-2xl font-bold uppercase tracking-tight text-[#0b1326] md:text-3xl">
              Desempenho da rodada
            </h2>
            <div className="kinetic-gradient mb-6 h-1 w-16" />
            <p className="text-sm leading-relaxed text-[#3b4456]">
              Os líderes de cada qualidade na rodada {data.rodada}.
            </p>
          </div>

          <div className="grid w-full flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {data.leaders.map((leader) => {
              const accent = ACCENT[leader.quality];
              return (
                <div
                  key={leader.quality}
                  className="border border-[#e5e7eb] border-l-2 bg-white px-2 py-3 text-center shadow-[0_1px_8px_rgba(11,19,38,0.08)]"
                  style={{ borderLeftColor: accent }}
                >
                  <p
                    className="mb-1 font-mono text-[9px] font-bold uppercase tracking-wider leading-tight opacity-100"
                    style={{ color: accent }}
                  >
                    {leader.label}
                  </p>
                  <div
                    className="whitespace-nowrap text-[#0b1326] font-black leading-tight"
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
