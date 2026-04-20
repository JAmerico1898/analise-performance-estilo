// src/components/blocos/bloco4-body.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type {
  MovingAvgDataset,
  MovingAvgTeamSeries,
  QualityMetricsMap,
} from "@/types/data";
import type { Club } from "@/lib/clubs";
import qualityMetricsJson from "@/data/compiled/quality-metrics.json";
import { LineChart, type LineSeries } from "./line-chart";

const qualityMetricsMap = qualityMetricsJson as QualityMetricsMap;

type QualityKey =
  | "q_defesa"
  | "q_trans_defensiva"
  | "q_trans_ofensiva"
  | "q_ataque"
  | "q_criacao_de_chances";

type QualitySpec = {
  key: QualityKey;
  label: string;
  accent: string;
};

const QUALITIES: QualitySpec[] = [
  { key: "q_defesa", label: "Defesa", accent: "#63f7ff" },
  { key: "q_trans_defensiva", label: "Transição defensiva", accent: "#abd600" },
  { key: "q_trans_ofensiva", label: "Transição ofensiva", accent: "#ffb94d" },
  { key: "q_ataque", label: "Ataque", accent: "#c3f400" },
  { key: "q_criacao_de_chances", label: "Criação de chances", accent: "#ff7ad9" },
];

const MUTED_COLOR = "#8e9379";

function fmtZ(z: number): string {
  return `${z >= 0 ? "+" : ""}${z.toFixed(2)}`;
}

// Pad/truncate a series so its length equals `targetLen`. Shorter inputs are
// padded with null; longer inputs are truncated to `targetLen`.
function padTo(values: Array<number | null>, targetLen: number): Array<number | null> {
  if (values.length === targetLen) return values;
  if (values.length > targetLen) return values.slice(0, targetLen);
  const out = values.slice();
  while (out.length < targetLen) out.push(null);
  return out;
}

export function Bloco4Body({
  club,
  dataset2026,
  series2026,
  series2025,
}: {
  club: Club;
  dataset2026: MovingAvgDataset;
  series2026: MovingAvgTeamSeries;
  series2025: MovingAvgTeamSeries | null;
}) {
  const [activeQuality, setActiveQuality] = useState<QualityKey>("q_defesa");
  const [drillDown, setDrillDown] = useState(false);

  const activeSpec = QUALITIES.find((q) => q.key === activeQuality)!;

  // X-axis spans ONLY the rodadas played so far in 2026. The 2025 dashed line
  // is truncated to the same range so it evolves in tandem with the 2026 line
  // (comparing "where the team was at rodada N last year vs this year").
  const len2026 = series2026.qualities[activeQuality]?.length ?? 0;
  const maxRodada = Math.max(len2026, 1);
  // First rodada with data: use 3 (both datasets produce their first MA at R3).
  const minRodadaWithMA = 3;

  // Main chart series for the active quality.
  const qualitySeries: LineSeries[] = useMemo(() => {
    const arr: LineSeries[] = [];
    const v2026 = series2026.qualities[activeQuality] ?? [];
    arr.push({
      key: "2026",
      label: "2026",
      values: padTo(v2026, maxRodada),
      color: activeSpec.accent,
      highlighted: true,
      style: "solid",
    });
    if (series2025) {
      const v2025 = series2025.qualities[activeQuality] ?? [];
      arr.push({
        key: "2025",
        label: "2025",
        values: padTo(v2025, maxRodada),
        color: MUTED_COLOR,
        highlighted: true,
        style: "dashed",
      });
    }
    return arr;
  }, [series2026, series2025, activeQuality, activeSpec.accent, maxRodada]);

  // Drill-down: list metrics composing the active quality.
  const activeMetrics = qualityMetricsMap[activeSpec.label] ?? [];

  return (
    <section className="mt-10">
      {/* Fallback card — only when the club didn't play 2025 */}
      {!series2025 ? (
        <div
          className="mb-6 rounded-sm border-l-2 bg-white p-4"
          style={{ borderLeftColor: "#ffb94d" }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: "#ffb94d" }}
          >
            Sem dados de 2025
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#0b1326]">
            Este clube não disputou a Série A em 2025. Apenas a trajetória 2026
            é exibida abaixo.
          </p>
        </div>
      ) : null}

      {/* Quality tabs */}
      <div
        role="tablist"
        aria-label="Qualidades"
        className="flex flex-wrap gap-2"
      >
        {QUALITIES.map((q) => {
          const isActive = q.key === activeQuality;
          return (
            <button
              key={q.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveQuality(q.key)}
              className={
                "rounded-sm border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
                (isActive
                  ? "bg-[#f3f4f6] text-[#0b1326]"
                  : "border-[#e5e7eb] bg-white text-[#3b4456] hover:border-[#c3f400] hover:text-[#556b00]")
              }
              style={{
                borderColor: isActive ? q.accent : undefined,
                borderBottomWidth: isActive ? 2 : 1,
              }}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Drill-down toggle */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setDrillDown((v) => !v)}
          className="inline-flex items-center gap-2 rounded-sm border border-[#e5e7eb] bg-white px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#556b00] transition-colors hover:border-[#c3f400] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-expanded={drillDown}
        >
          {drillDown ? (
            <>
              Ocultar métricas
              <ChevronUp className="size-3" />
            </>
          ) : (
            <>
              Ver métricas
              <ChevronDown className="size-3" />
            </>
          )}
        </button>
      </div>

      {!drillDown ? (
        <div className="mt-4 rounded-sm bg-white p-4">
          <p className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.25em] text-[#3b4456]">
            <span style={{ color: activeSpec.accent }}>{activeSpec.label}</span>
            {" · "}Média móvel 3 jogos · Z-score
          </p>
          <LineChart
            series={qualitySeries}
            maxX={maxRodada}
            minXWithData={minRodadaWithMA}
            ariaLabel={`${club.displayName} — ${activeSpec.label}: média móvel de 3 jogos, comparação 2026 vs 2025`}
            tooltipFormatter={(seriesLabel, rodada, value) => (
              <>
                <p
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    color: seriesLabel === "2026" ? activeSpec.accent : MUTED_COLOR,
                  }}
                >
                  {club.displayName} · {seriesLabel}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[#3b4456] tabular-nums">
                  Rodada {rodada}
                </p>
                <p className="mt-1 font-mono text-[11px] text-[#0b1326] tabular-nums">
                  Z {fmtZ(value)}
                </p>
              </>
            )}
          />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#3b4456]">
              <svg width="24" height="6" aria-hidden>
                <line
                  x1="0"
                  y1="3"
                  x2="24"
                  y2="3"
                  stroke={activeSpec.accent}
                  strokeWidth="2"
                />
              </svg>
              2026
            </span>
            {series2025 ? (
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#3b4456]">
                <svg width="24" height="6" aria-hidden>
                  <line
                    x1="0"
                    y1="3"
                    x2="24"
                    y2="3"
                    stroke={MUTED_COLOR}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                </svg>
                2025
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-sm bg-white p-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#3b4456]">
            Métricas que compõem{" "}
            <span style={{ color: activeSpec.accent }}>{activeSpec.label}</span>
          </p>
          {activeMetrics.length === 0 ? (
            <p className="text-sm text-[#3b4456]">
              Sem métricas cadastradas para esta qualidade.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {activeMetrics.map((m) => {
                const v2026 = series2026.metricsZ[m.metric] ?? [];
                const v2025 = series2025?.metricsZ[m.metric] ?? [];
                const len = Math.max(v2026.length, 1);
                const miniSeries: LineSeries[] = [
                  {
                    key: "2026",
                    label: "2026",
                    values: padTo(v2026, len),
                    color: activeSpec.accent,
                    highlighted: true,
                    style: "solid",
                  },
                ];
                if (series2025) {
                  miniSeries.push({
                    key: "2025",
                    label: "2025",
                    values: padTo(v2025, len),
                    color: MUTED_COLOR,
                    highlighted: true,
                    style: "dashed",
                  });
                }
                return (
                  <div
                    key={m.metric}
                    className="flex flex-col gap-2 rounded-sm bg-[#0f1628] p-3"
                  >
                    <p className="font-mono text-[10px] leading-snug text-[#0b1326]">
                      {m.metric}
                    </p>
                    <LineChart
                      series={miniSeries}
                      maxX={len}
                      minXWithData={minRodadaWithMA}
                      height={140}
                      compact
                      ariaLabel={`${m.metric}: média móvel de 3 jogos, comparação 2026 vs 2025`}
                      tooltipFormatter={(seriesLabel, rodada, value) => (
                        <>
                          <p
                            className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                            style={{
                              color:
                                seriesLabel === "2026"
                                  ? activeSpec.accent
                                  : MUTED_COLOR,
                            }}
                          >
                            {seriesLabel}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-[#3b4456] tabular-nums">
                            Rodada {rodada}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-[#0b1326] tabular-nums">
                            Z {fmtZ(value)}
                          </p>
                        </>
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Unused in 2025-specific code paths but kept for parity with Bloco 3. */}
      {dataset2026.teams.length === 0 ? (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#3b4456]">
          Aviso: dataset 2026 vazio.
        </p>
      ) : null}
    </section>
  );
}
