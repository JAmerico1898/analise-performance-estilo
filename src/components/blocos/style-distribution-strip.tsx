// src/components/blocos/style-distribution-strip.tsx
"use client";

import { useState } from "react";
import type { StyleDistributionEntry } from "@/types/data";

const STRIP_WIDTH = 520;
const STRIP_HEIGHT = 64;
const MARGIN = 16;

export function fmtNominal(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v - Math.round(v)) < 1e-9) return Math.round(v).toString();
  return v.toFixed(2);
}

export function inferUnit(label: string): string {
  if (/\(%\)/.test(label) || /_%/.test(label)) return "%";
  if (/\(m\)/.test(label)) return "m";
  if (/\(s\)/.test(label)) return "s";
  return "";
}

export function formatStyleValue(label: string, v: number): string {
  return `${fmtNominal(v)}${inferUnit(label)}`;
}

function rangePad(min: number, max: number): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const pad = Math.max(Math.abs(min) * 0.05, 1);
    return [min - pad, max + pad];
  }
  const pad = (max - min) * 0.05;
  return [min - pad, max + pad];
}

export type StyleDistributionStripProps = {
  label: string;
  value: number;
  distribution: StyleDistributionEntry[];
  selectedSlug: string;
  accent: string;
};

export function StyleDistributionStrip({
  label,
  value,
  distribution,
  selectedSlug,
  accent,
}: StyleDistributionStripProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const values = distribution.map((d) => d.value).filter((v) => Number.isFinite(v));
  const rawMin = values.length > 0 ? Math.min(...values) : 0;
  const rawMax = values.length > 0 ? Math.max(...values) : 1;
  const [axisMin, axisMax] = rangePad(rawMin, rawMax);
  const axisSpan = axisMax - axisMin || 1;

  const sorted = [...values].sort((a, b) => a - b);
  const median =
    sorted.length === 0
      ? 0
      : sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  function mapX(v: number): number {
    const t = (v - axisMin) / axisSpan;
    const clamped = Math.max(0, Math.min(1, t));
    return MARGIN + clamped * (STRIP_WIDTH - 2 * MARGIN);
  }

  const hovered = hoveredSlug
    ? distribution.find((d) => d.slug === hoveredSlug)
    : null;
  const unit = inferUnit(label);

  return (
    <div className="flex w-full flex-col gap-3 rounded-sm border-l-2 bg-[#131b2e] p-4 text-left md:flex-row md:items-center md:gap-6"
      style={{ borderLeftColor: accent }}
    >
      <div className="md:w-60 md:shrink-0">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: accent }}
        >
          {label}
        </p>
        <p className="mt-1 font-mono tabular text-lg font-black text-[#dae2fd]">
          {formatStyleValue(label, value)}
        </p>
        <p className="mt-1 text-[10px] text-[#8e9379]">Média dos últimos 5 jogos</p>
      </div>

      <div
        className="relative w-full max-w-[640px]"
        onPointerLeave={() => setHoveredSlug(null)}
      >
        <svg
          viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
          className="block w-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Distribuição ${label}: ${formatStyleValue(label, value)} para o clube selecionado`}
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
          {/* Median line */}
          <line
            x1={mapX(median)}
            x2={mapX(median)}
            y1={12}
            y2={STRIP_HEIGHT - 12}
            stroke="#444933"
            strokeDasharray="2 3"
            strokeWidth={1}
          />
          {/* Axis labels */}
          <text x={MARGIN} y={STRIP_HEIGHT - 2} fill="#5e5e5e" fontSize={9} fontFamily="DM Mono, monospace">
            {fmtNominal(rawMin)}
            {unit}
          </text>
          <text
            x={mapX(median) - 12}
            y={STRIP_HEIGHT - 2}
            fill="#5e5e5e"
            fontSize={9}
            fontFamily="DM Mono, monospace"
          >
            {fmtNominal(median)}
            {unit}
          </text>
          <text
            x={STRIP_WIDTH - MARGIN - 28}
            y={STRIP_HEIGHT - 2}
            fill="#5e5e5e"
            fontSize={9}
            fontFamily="DM Mono, monospace"
          >
            {fmtNominal(rawMax)}
            {unit}
          </text>

          {/* Other clubs */}
          {distribution.map((d) => {
            if (d.slug === selectedSlug) return null;
            const cx = mapX(d.value);
            const isHover = hoveredSlug === d.slug;
            return (
              <circle
                key={d.slug}
                cx={cx}
                cy={STRIP_HEIGHT / 2}
                r={isHover ? 6 : 4}
                fill="#8e9379"
                fillOpacity={isHover ? 1 : 0.5}
                style={{ cursor: "pointer" }}
                onPointerEnter={() => setHoveredSlug(d.slug)}
              >
                <title>
                  {d.displayName} · {label}: {formatStyleValue(label, d.value)}
                </title>
              </circle>
            );
          })}

          {/* Selected club highlight */}
          {(() => {
            const sel = distribution.find((d) => d.slug === selectedSlug);
            if (!sel) return null;
            return (
              <circle
                cx={mapX(sel.value)}
                cy={STRIP_HEIGHT / 2}
                r={8}
                fill={accent}
                stroke="#0b1326"
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onPointerEnter={() => setHoveredSlug(sel.slug)}
              >
                <title>
                  {sel.displayName} · {label}: {formatStyleValue(label, sel.value)}
                </title>
              </circle>
            );
          })()}
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute z-20 min-w-[180px] -translate-x-1/2 rounded-sm border border-[#2d3449] bg-[#0b1326]/95 px-3 py-2 shadow-lg backdrop-blur"
            style={{
              left: `${(mapX(hovered.value) / STRIP_WIDTH) * 100}%`,
              top: "50%",
              transform: "translate(-50%, calc(-100% - 14px))",
            }}
          >
            <p
              className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
              style={{ color: accent }}
            >
              {hovered.displayName}
            </p>
            <p className="mt-1 font-mono tabular text-[11px] text-[#dae2fd]">
              {label}: {formatStyleValue(label, hovered.value)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
