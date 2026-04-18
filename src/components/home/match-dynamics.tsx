// src/components/home/match-dynamics.tsx
import dashboard from "@/data/compiled/dashboard.json";
import type { Dashboard } from "@/types/data";

const data = dashboard as Dashboard;

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function MatchDynamics() {
  // Visual widths — heuristic mappings so bars aren't flat.
  // Top xG: z / 3 (clamped); std: std / 1.5; golsRodada: golsRodada / (jogos*4); golsMedios: golsMedios / 4
  const topZ = data.top_xg.z;
  const stdZ = data.xg_z_std_liga;

  const widths = {
    xg: clamp01(topZ / 3),
    std: clamp01(stdZ / 1.5),
    gols: data.jogos_rodada > 0 ? clamp01(data.gols_rodada / (data.jogos_rodada * 4)) : 0,
    media: clamp01(data.gols_medios_liga / 4),
  };

  const fmtZ = (z: number) => `Z ${z >= 0 ? "+" : ""}${z.toFixed(2)}`;

  return (
    <section id="dynamics" className="py-20 md:py-24 bg-[#060e20]">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-start mb-4">
          <div className="md:w-1/3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#dae2fd]">
              MATCH DYNAMICS
            </h2>
            <div className="w-16 h-1 kinetic-gradient mb-6" />
            <p className="text-[#c4c9ac] text-sm leading-relaxed">
              Panorama da última rodada e da forma da liga. xG é apresentado em Z-score (desvio relativo à média da temporada); gols são contagem de partidas.
            </p>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Maior xG da rodada */}
            <div className="p-6 bg-[#131b2e] rounded-sm">
              <p className="text-[10px] text-[#c4c9ac] uppercase tracking-widest mb-2 font-mono">
                Maior xG · Rodada {data.rodada}
              </p>
              <div className="text-xl md:text-2xl font-black text-[#dae2fd] leading-tight truncate">
                {data.top_xg.displayName}
              </div>
              <div className="mt-1 font-mono tabular text-sm text-[#c3f400] font-bold">
                {fmtZ(topZ)}
              </div>
              <div className="mt-4 w-full h-1 bg-[#2d3449] overflow-hidden">
                <div className="h-full bg-[#c3f400]" style={{ width: `${widths.xg * 100}%` }} />
              </div>
            </div>

            {/* Tile 2: Shape-of-league (std of xG Z) */}
            <div className="p-6 bg-[#131b2e] rounded-sm">
              <p className="text-[10px] text-[#c4c9ac] uppercase tracking-widest mb-2 font-mono">
                xG · Dispersão da Liga
              </p>
              <div className="text-3xl font-black text-[#dae2fd] font-mono tabular">
                σ {stdZ.toFixed(2)}
              </div>
              <p className="mt-1 text-[10px] text-[#c4c9ac]/70 uppercase tracking-widest font-mono">
                desvio-padrão Z
              </p>
              <div className="mt-4 w-full h-1 bg-[#2d3449] overflow-hidden">
                <div className="h-full bg-[#63f7ff]" style={{ width: `${widths.std * 100}%` }} />
              </div>
            </div>

            {/* Tile 3: Gols Totais da Rodada */}
            <div className="p-6 bg-[#131b2e] rounded-sm">
              <p className="text-[10px] text-[#c4c9ac] uppercase tracking-widest mb-2 font-mono">
                Gols Totais da Rodada
              </p>
              <div className="text-3xl font-black text-[#dae2fd] font-mono tabular">
                {data.gols_rodada}
              </div>
              <p className="mt-1 text-[10px] text-[#c4c9ac]/70 uppercase tracking-widest font-mono">
                em {data.jogos_rodada} jogos
              </p>
              <div className="mt-4 w-full h-1 bg-[#2d3449] overflow-hidden">
                <div
                  className="h-full bg-[#abd600]"
                  style={{ width: `${widths.gols * 100}%` }}
                />
              </div>
            </div>

            {/* Tile 4: Gols Médios por Jogo (liga) — lime border, rodada badge */}
            <div className="p-6 bg-[#131b2e] border-l-2 border-[#c3f400]">
              <p className="text-[10px] text-[#c3f400] uppercase tracking-widest mb-2 font-mono">
                Gols Médios · Liga
              </p>
              <div className="text-3xl font-black text-[#dae2fd] font-mono tabular">
                {data.gols_medios_liga.toFixed(1)}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse" />
                <span className="text-[9px] uppercase font-bold text-[#c4c9ac] tracking-widest">
                  Rodada {data.rodada}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
