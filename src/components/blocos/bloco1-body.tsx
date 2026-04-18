// src/components/blocos/bloco1-body.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PerformanceTeamRow } from "@/types/data";

type QualityKey =
  | "q_defesa"
  | "q_trans_defensiva"
  | "q_trans_ofensiva"
  | "q_ataque"
  | "q_criacao_de_chances";

const QUALITIES: Array<{ key: QualityKey; label: string; accent: string }> = [
  { key: "q_defesa", label: "Defesa", accent: "#63f7ff" },
  { key: "q_trans_defensiva", label: "Transição defensiva", accent: "#abd600" },
  { key: "q_trans_ofensiva", label: "Transição ofensiva", accent: "#ffb94d" },
  { key: "q_ataque", label: "Ataque", accent: "#c3f400" },
  { key: "q_criacao_de_chances", label: "Criação de chances", accent: "#ff7ad9" },
];

const AXIS_MIN = -3;
const AXIS_MAX = 3;
const STRIP_WIDTH = 520;
const STRIP_HEIGHT = 64;
const MARGIN = 16;

function mapZtoX(z: number) {
  const clamped = Math.max(AXIS_MIN, Math.min(AXIS_MAX, z));
  const t = (clamped - AXIS_MIN) / (AXIS_MAX - AXIS_MIN);
  return MARGIN + t * (STRIP_WIDTH - 2 * MARGIN);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  if (!m || !d) return iso;
  return `${d}/${m}`;
}

function describeGame(g: PerformanceTeamRow): string {
  return `R${g.rodada} · ${formatDate(g.data)} · ${g.partida} · ${g.place}`;
}

function fmtZ(z: number): string {
  return `${z >= 0 ? "+" : ""}${z.toFixed(2)}`;
}

function rankOf(games: PerformanceTeamRow[], selected: PerformanceTeamRow, key: QualityKey): number {
  const sorted = [...games].sort((a, b) => b[key] - a[key]);
  return sorted.findIndex((g) => g.game_id === selected.game_id) + 1;
}

export function Bloco1Body({ games }: { games: PerformanceTeamRow[] }) {
  const [selectedIdx, setSelectedIdx] = useState(games.length - 1);
  const selected = games[selectedIdx];
  const total = games.length;

  const goPrev = () => setSelectedIdx((i) => Math.max(0, i - 1));
  const goNext = () => setSelectedIdx((i) => Math.min(total - 1, i + 1));

  const options = useMemo(
    () => games.map((g, i) => ({ i, label: describeGame(g) })),
    [games],
  );

  return (
    <section className="mt-10">
      {/* Game selector */}
      <div className="flex flex-col gap-3 rounded-sm border border-[#222a3d] bg-[#131b2e] p-4 md:flex-row md:items-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4c9ac] md:w-40">
          Jogo selecionado
        </p>
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={selectedIdx === 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#2d3449] bg-[#171f33] text-[#c3f400] transition-colors hover:border-[#c3f400] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#2d3449]"
            aria-label="Jogo anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(parseInt(e.target.value, 10))}
            className="flex-1 rounded-sm border border-[#2d3449] bg-[#171f33] px-3 py-2 font-mono text-sm text-[#dae2fd] focus:border-[#c3f400] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
          >
            {options.map((o) => (
              <option key={o.i} value={o.i}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={goNext}
            disabled={selectedIdx === total - 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#2d3449] bg-[#171f33] text-[#c3f400] transition-colors hover:border-[#c3f400] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#2d3449]"
            aria-label="Próximo jogo"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Help line */}
      <p className="mt-4 text-xs leading-relaxed text-[#c4c9ac]">
        Cada faixa mostra os {total} jogos da equipe na competição para uma qualidade. O marcador em destaque é o jogo selecionado. Z positivo = desempenho acima da média da própria equipe; Z negativo = abaixo.
      </p>

      {/* Quality strips */}
      <div className="mt-6 grid grid-cols-1 gap-3">
        {QUALITIES.map((q) => {
          const zSel = selected[q.key];
          const rank = rankOf(games, selected, q.key);
          return (
            <div
              key={q.key}
              className="flex flex-col gap-3 rounded-sm border-l-2 bg-[#131b2e] p-4 md:flex-row md:items-center md:gap-6"
              style={{ borderLeftColor: q.accent }}
            >
              <div className="md:w-48 md:shrink-0">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: q.accent }}
                >
                  {q.label}
                </p>
                <p className="mt-1 font-mono tabular text-lg font-black text-[#dae2fd]">
                  Z {fmtZ(zSel)}
                </p>
                <p className="mt-1 text-[11px] text-[#c4c9ac]">
                  {rank}º de {total} jogos
                </p>
              </div>

              <div className="relative w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
                  className="w-full max-w-[640px]"
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label={`Distribuição ${q.label}: ${fmtZ(zSel)} no jogo selecionado, ${rank} de ${total}`}
                >
                  {/* Axis baseline */}
                  <line
                    x1={MARGIN}
                    x2={STRIP_WIDTH - MARGIN}
                    y1={STRIP_HEIGHT / 2}
                    y2={STRIP_HEIGHT / 2}
                    stroke="#2d3449"
                    strokeWidth={1}
                  />
                  {/* Zero line */}
                  <line
                    x1={mapZtoX(0)}
                    x2={mapZtoX(0)}
                    y1={12}
                    y2={STRIP_HEIGHT - 12}
                    stroke="#444933"
                    strokeDasharray="2 3"
                    strokeWidth={1}
                  />
                  {/* Axis labels */}
                  <text x={MARGIN} y={STRIP_HEIGHT - 2} fill="#5e5e5e" fontSize={9} fontFamily="DM Mono, monospace">
                    −3
                  </text>
                  <text x={mapZtoX(0) - 3} y={STRIP_HEIGHT - 2} fill="#5e5e5e" fontSize={9} fontFamily="DM Mono, monospace">
                    0
                  </text>
                  <text x={STRIP_WIDTH - MARGIN - 10} y={STRIP_HEIGHT - 2} fill="#5e5e5e" fontSize={9} fontFamily="DM Mono, monospace">
                    +3
                  </text>
                  {/* Other games */}
                  {games.map((g) => {
                    if (g.game_id === selected.game_id) return null;
                    const cx = mapZtoX(g[q.key]);
                    return (
                      <circle
                        key={g.game_id}
                        cx={cx}
                        cy={STRIP_HEIGHT / 2}
                        r={4}
                        fill="#8e9379"
                        fillOpacity={0.5}
                      >
                        <title>{`R${g.rodada} · ${g.partida} · Z ${fmtZ(g[q.key])}`}</title>
                      </circle>
                    );
                  })}
                  {/* Selected game highlight */}
                  <circle
                    cx={mapZtoX(zSel)}
                    cy={STRIP_HEIGHT / 2}
                    r={8}
                    fill={q.accent}
                    stroke="#0b1326"
                    strokeWidth={2}
                  >
                    <title>{`${describeGame(selected)} · Z ${fmtZ(zSel)}`}</title>
                  </circle>
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
