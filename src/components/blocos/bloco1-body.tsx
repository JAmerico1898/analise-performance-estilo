// src/components/blocos/bloco1-body.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PerformanceTeamRow, QualityMetricsMap } from "@/types/data";
import qualityMetricsJson from "@/data/compiled/quality-metrics.json";
import { Strip, describeGame } from "./distribution-strip";

const qualityMetricsMap = qualityMetricsJson as QualityMetricsMap;

type QualityKey =
  | "q_defesa"
  | "q_trans_defensiva"
  | "q_trans_ofensiva"
  | "q_ataque"
  | "q_criacao_de_chances";

type QualitySpec = {
  key: QualityKey;
  label: string; // Portuguese label matching the CSV / quality-metrics key
  accent: string;
};

const QUALITIES: QualitySpec[] = [
  { key: "q_defesa", label: "Defesa", accent: "#63f7ff" },
  { key: "q_trans_defensiva", label: "Transição defensiva", accent: "#abd600" },
  { key: "q_trans_ofensiva", label: "Transição ofensiva", accent: "#ffb94d" },
  { key: "q_ataque", label: "Ataque", accent: "#c3f400" },
  { key: "q_criacao_de_chances", label: "Criação de chances", accent: "#ff7ad9" },
];

const QUALITY_BY_KEY: Record<QualityKey, QualitySpec> = Object.fromEntries(
  QUALITIES.map((q) => [q.key, q]),
) as Record<QualityKey, QualitySpec>;

function rankByQuality(
  games: PerformanceTeamRow[],
  selected: PerformanceTeamRow,
  key: QualityKey,
): number {
  const sorted = [...games].sort((a, b) => b[key] - a[key]);
  return sorted.findIndex((g) => g.game_id === selected.game_id) + 1;
}

function rankByMetric(
  games: PerformanceTeamRow[],
  selected: PerformanceTeamRow,
  metric: string,
): number {
  const valueOf = (g: PerformanceTeamRow) => g.metrics?.[metric] ?? 0;
  const sorted = [...games].sort((a, b) => valueOf(b) - valueOf(a));
  return sorted.findIndex((g) => g.game_id === selected.game_id) + 1;
}

export function Bloco1Body({ games }: { games: PerformanceTeamRow[] }) {
  const [selectedIdx, setSelectedIdx] = useState(games.length - 1);
  const [openQuality, setOpenQuality] = useState<QualityKey | null>(null);
  const selected = games[selectedIdx];
  const total = games.length;

  const goPrev = () => setSelectedIdx((i) => Math.max(0, i - 1));
  const goNext = () => setSelectedIdx((i) => Math.min(total - 1, i + 1));

  const options = useMemo(
    () => games.map((g, i) => ({ i, label: describeGame(g) })),
    [games],
  );

  const openSpec = openQuality ? QUALITY_BY_KEY[openQuality] : null;
  const openMetrics = openSpec ? qualityMetricsMap[openSpec.label] ?? [] : [];

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

      {openSpec ? (
        <>
          {/* Drill-down header: back button + breadcrumb */}
          <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => setOpenQuality(null)}
              className="inline-flex w-fit items-center gap-2 rounded-sm border border-[#2d3449] bg-[#171f33] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#c3f400] transition-colors hover:border-[#c3f400] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1326]"
            >
              <ChevronLeft className="size-4" />
              Voltar para qualidades
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4c9ac]">
              Clube vs Clube{" "}
              <span className="text-[#8e9379]">·</span>{" "}
              <span style={{ color: openSpec.accent }}>{openSpec.label}</span>
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#c4c9ac]">
            O gráfico abaixo apresenta o desempenho da equipe nas métricas que compõem a qualidade{" "}
            <span style={{ color: openSpec.accent }}>{openSpec.label}</span>. O jogo selecionado está destacado. Todos os valores são Z-scores normalizados dentro da equipe.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {openMetrics.length === 0 ? (
              <p className="text-sm text-[#c4c9ac]">Sem métricas cadastradas para esta qualidade.</p>
            ) : (
              openMetrics.map((m) => {
                const zSel = selected.metrics?.[m.metric] ?? 0;
                const rawSel = selected.rawMetrics?.[m.metric];
                const rank = rankByMetric(games, selected, m.metric);
                const points = games.map((g) => ({
                  gameId: g.game_id,
                  rodada: g.rodada,
                  partida: g.partida,
                  z: g.metrics?.[m.metric] ?? 0,
                  raw: g.rawMetrics?.[m.metric],
                }));
                return (
                  <Strip
                    key={m.metric}
                    label={m.metric}
                    accent={openSpec.accent}
                    zSelected={zSel}
                    rawSelected={rawSel}
                    rank={rank}
                    total={total}
                    selectedGameId={selected.game_id}
                    selectedDescribe={describeGame(selected)}
                    points={points}
                  />
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* Help line */}
          <p className="mt-4 text-xs leading-relaxed text-[#c4c9ac]">
            Cada faixa mostra os {total} jogos da equipe na competição para uma qualidade. O marcador em destaque é o jogo selecionado. Z positivo = desempenho acima da média da própria equipe; Z negativo = abaixo. Clique em uma qualidade para ver as métricas que a compõem.
          </p>

          {/* Quality strips */}
          <div className="mt-6 grid grid-cols-1 gap-3">
            {QUALITIES.map((q) => {
              const zSel = selected[q.key];
              const rank = rankByQuality(games, selected, q.key);
              const points = games.map((g) => ({
                gameId: g.game_id,
                rodada: g.rodada,
                partida: g.partida,
                z: g[q.key],
              }));
              return (
                <Strip
                  key={q.key}
                  label={q.label}
                  accent={q.accent}
                  zSelected={zSel}
                  rank={rank}
                  total={total}
                  selectedGameId={selected.game_id}
                  selectedDescribe={describeGame(selected)}
                  points={points}
                  onClick={() => setOpenQuality(q.key)}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
