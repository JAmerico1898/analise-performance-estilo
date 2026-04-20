// src/components/blocos/bloco3-body.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MovingAvgDataset, QualityMetricsMap } from "@/types/data";
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
  label: string;    // matches context.csv quality label
  accent: string;
};

const QUALITIES: QualitySpec[] = [
  { key: "q_defesa", label: "Defesa", accent: "#63f7ff" },
  { key: "q_trans_defensiva", label: "Transição defensiva", accent: "#abd600" },
  { key: "q_trans_ofensiva", label: "Transição ofensiva", accent: "#ffb94d" },
  { key: "q_ataque", label: "Ataque", accent: "#c3f400" },
  { key: "q_criacao_de_chances", label: "Criação de chances", accent: "#ff7ad9" },
];

const NEUTRAL_COLOR = "#8e9379";

function fmtZ(z: number): string {
  return `${z >= 0 ? "+" : ""}${z.toFixed(2)}`;
}

function fmtRaw(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v - Math.round(v)) < 1e-9) return Math.round(v).toString();
  return v.toFixed(2);
}

export function Bloco3Body({
  focusSlug,
  dataset,
}: {
  focusSlug: string;
  dataset: MovingAvgDataset;
}) {
  const [activeQuality, setActiveQuality] = useState<QualityKey>("q_defesa");
  const [drillDown, setDrillDown] = useState(false);

  const activeSpec = QUALITIES.find((q) => q.key === activeQuality)!;
  const focusTeam = useMemo(
    () => dataset.teams.find((t) => t.slug === focusSlug) ?? null,
    [dataset.teams, focusSlug],
  );

  // Build series for the active quality.
  const qualitySeries: LineSeries[] = useMemo(() => {
    return dataset.teams.map((t) => ({
      key: t.slug ?? t.clube,
      label: t.displayName,
      values: t.qualities[activeQuality] ?? [],
      color: t.slug === focusSlug ? activeSpec.accent : NEUTRAL_COLOR,
      highlighted: t.slug === focusSlug,
    }));
  }, [dataset.teams, activeQuality, activeSpec.accent, focusSlug]);

  // For drill-down, list metrics composing the active quality.
  const activeMetrics = qualityMetricsMap[activeSpec.label] ?? [];

  return (
    <section className="mt-10">
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
            {" · "}Média móvel 5 jogos · Z-score
          </p>
          <LineChart
            series={qualitySeries}
            maxX={dataset.maxRodada}
            minXWithData={dataset.minRodadaWithMA}
            ariaLabel={`${activeSpec.label}: média móvel de 5 jogos, Z-score por rodada, 20 equipes`}
            tooltipFormatter={(seriesLabel, rodada, value) => {
              const rodadaIdx = rodada - 1;
              // Determine rank at this rodada using all 20 teams.
              const sortedVals = dataset.teams
                .map((t) => t.qualities[activeQuality]?.[rodadaIdx])
                .filter((v): v is number => v !== null && v !== undefined);
              const rank =
                sortedVals.filter((v) => v > value).length + 1;
              const total = sortedVals.length;
              return (
                <>
                  <p
                    className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: activeSpec.accent }}
                  >
                    {seriesLabel}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-[#3b4456] tabular-nums">
                    Rodada {rodada}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[#0b1326] tabular-nums">
                    Z {fmtZ(value)} · rank {rank}/{total}
                  </p>
                </>
              );
            }}
          />
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
                const miniSeries: LineSeries[] = dataset.teams.map((t) => ({
                  key: t.slug ?? t.clube,
                  label: t.displayName,
                  values: t.metricsZ[m.metric] ?? [],
                  rawValues: t.metricsRaw[m.metric] ?? [],
                  color: t.slug === focusSlug ? activeSpec.accent : NEUTRAL_COLOR,
                  highlighted: t.slug === focusSlug,
                }));
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
                      maxX={dataset.maxRodada}
                      minXWithData={dataset.minRodadaWithMA}
                      height={140}
                      compact
                      ariaLabel={`${m.metric}: média móvel de 5 jogos, Z-score por rodada`}
                      tooltipFormatter={(seriesLabel, rodada, value, raw) => (
                        <>
                          <p
                            className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                            style={{ color: activeSpec.accent }}
                          >
                            {seriesLabel}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-[#3b4456] tabular-nums">
                            Rodada {rodada}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-[#0b1326] tabular-nums">
                            Z {fmtZ(value)}
                            {raw !== undefined && Number.isFinite(raw)
                              ? `  ·  raw ${fmtRaw(raw)}`
                              : ""}
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

      {focusTeam === null ? (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#3b4456]">
          Aviso: equipe focalizada não encontrada no dataset — linha de destaque ausente.
        </p>
      ) : null}
    </section>
  );
}
