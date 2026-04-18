// src/components/blocos/line-chart.tsx
"use client";

import { useRef, useState } from "react";
import type React from "react";

export interface LineSeries {
  key: string; // team slug or csvName
  label: string; // e.g. "Flamengo"
  values: Array<number | null>; // indexed by rodada-1; same length for all series
  rawValues?: Array<number | null>; // optional raw metric values, same indexing
  color: string; // hex
  highlighted: boolean;
}

export interface LineChartProps {
  series: LineSeries[];
  maxX: number; // max rodada
  minXWithData: number; // typically 5
  yMin?: number; // default -3
  yMax?: number; // default +3
  height?: number; // default 280
  ariaLabel: string;
  tooltipFormatter?: (
    seriesLabel: string,
    rodada: number,
    value: number,
    raw?: number,
  ) => React.ReactNode;
  compact?: boolean; // if true, smaller spacing for grid of mini-charts
}

function fmtZ(z: number): string {
  return `${z >= 0 ? "+" : ""}${z.toFixed(2)}`;
}

function fmtRaw(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v - Math.round(v)) < 1e-9) return Math.round(v).toString();
  return v.toFixed(2);
}

export function LineChart({
  series,
  maxX,
  minXWithData,
  yMin: yMinProp = -1,
  yMax: yMaxProp = 1,
  height = 280,
  ariaLabel,
  tooltipFormatter,
  compact = false,
}: LineChartProps) {
  // Use a fixed viewBox so the SVG scales responsively.
  const W = 640;
  const H = height;
  const padLeft = compact ? 22 : 36;
  const padRight = compact ? 10 : 16;
  const padTop = compact ? 10 : 16;
  const padBottom = compact ? 20 : 28;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  // Expand the Y range to cover any data outside the default ±2 band.
  // Round outwards to the nearest 0.5 so labels stay tidy.
  let dataMin = Infinity;
  let dataMax = -Infinity;
  for (const s of series) {
    for (const v of s.values) {
      if (v === null || !Number.isFinite(v)) continue;
      if (v < dataMin) dataMin = v;
      if (v > dataMax) dataMax = v;
    }
  }
  const yMin = Number.isFinite(dataMin)
    ? Math.min(yMinProp, Math.floor(dataMin * 2) / 2)
    : yMinProp;
  const yMax = Number.isFinite(dataMax)
    ? Math.max(yMaxProp, Math.ceil(dataMax * 2) / 2)
    : yMaxProp;
  const fmtAxis = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));

  const startX = minXWithData;
  const endX = Math.max(maxX, minXWithData);
  const xSpan = Math.max(1, endX - startX);

  const mapX = (r: number) =>
    padLeft + ((r - startX) / xSpan) * plotW;
  const mapY = (v: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, v));
    const t = (clamped - yMin) / (yMax - yMin);
    return padTop + (1 - t) * plotH;
  };

  const [hoverR, setHoverR] = useState<number | null>(null);
  const [pointerPx, setPointerPx] = useState<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const svgX = (localX / rect.width) * W;
    // Snap to nearest integer rodada within [startX, endX]
    const rRaw = startX + ((svgX - padLeft) / plotW) * xSpan;
    const r = Math.round(rRaw);
    if (r < startX || r > endX) {
      setHoverR(null);
      setPointerPx(null);
      return;
    }
    setHoverR(r);
    setPointerPx({ x: localX, y: localY });
  };

  const onPointerLeave = () => {
    setHoverR(null);
    setPointerPx(null);
  };

  // Tick marks every 2 rounds, plus endpoints.
  const ticks: number[] = [];
  for (let t = startX; t <= endX; t += 2) ticks.push(t);
  if (ticks[ticks.length - 1] !== endX) ticks.push(endX);

  // Build a polyline path for a series (skipping nulls).
  const pathFor = (s: LineSeries): string => {
    let d = "";
    let penUp = true;
    for (let i = 0; i < s.values.length; i++) {
      const v = s.values[i];
      const r = i + 1;
      if (r < startX || r > endX) continue;
      if (v === null || !Number.isFinite(v)) {
        penUp = true;
        continue;
      }
      const x = mapX(r);
      const y = mapY(v);
      d += penUp ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      penUp = false;
    }
    return d;
  };

  // Order: non-highlighted first, highlighted on top.
  const nonHighlighted = series.filter((s) => !s.highlighted);
  const highlighted = series.filter((s) => s.highlighted);

  // Points at hover rodada.
  const hoverIdx = hoverR !== null ? hoverR - 1 : -1;
  const hoverPoints = hoverR !== null
    ? series
        .map((s) => {
          const v = s.values[hoverIdx];
          const raw = s.rawValues ? s.rawValues[hoverIdx] : undefined;
          return v !== null && Number.isFinite(v as number)
            ? { s, v: v as number, raw: raw ?? undefined }
            : null;
        })
        .filter((x): x is { s: LineSeries; v: number; raw: number | undefined } => x !== null)
    : [];

  // Tooltip — show all highlighted-series values at hover rodada, then if no
  // highlighted line intersects, fall back to nearest series.
  const tooltipEntries = hoverPoints
    .slice()
    .sort((a, b) => Number(b.s.highlighted) - Number(a.s.highlighted));
  const primary = tooltipEntries[0];

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ touchAction: "none" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Y grid: top, zero, bottom */}
        <line
          x1={padLeft}
          x2={W - padRight}
          y1={mapY(yMax)}
          y2={mapY(yMax)}
          stroke="#2d3449"
          strokeWidth={1}
        />
        <line
          x1={padLeft}
          x2={W - padRight}
          y1={mapY(0)}
          y2={mapY(0)}
          stroke="#444933"
          strokeDasharray="2 3"
          strokeWidth={1}
        />
        <line
          x1={padLeft}
          x2={W - padRight}
          y1={mapY(yMin)}
          y2={mapY(yMin)}
          stroke="#2d3449"
          strokeWidth={1}
        />

        {/* Y labels */}
        {!compact ? (
          <>
            <text
              x={padLeft - 6}
              y={mapY(yMax) + 3}
              fill="#c4c9ac"
              fontSize={9}
              fontFamily="DM Mono, monospace"
              textAnchor="end"
            >
              +{fmtAxis(yMax)}
            </text>
            <text
              x={padLeft - 6}
              y={mapY(0) + 3}
              fill="#c4c9ac"
              fontSize={9}
              fontFamily="DM Mono, monospace"
              textAnchor="end"
            >
              0
            </text>
            <text
              x={padLeft - 6}
              y={mapY(yMin) + 3}
              fill="#c4c9ac"
              fontSize={9}
              fontFamily="DM Mono, monospace"
              textAnchor="end"
            >
              −{fmtAxis(Math.abs(yMin))}
            </text>
          </>
        ) : (
          <>
            {/* In compact mode, only the zero label is helpful. */}
            <text
              x={padLeft - 4}
              y={mapY(0) + 3}
              fill="#5e5e5e"
              fontSize={7}
              fontFamily="DM Mono, monospace"
              textAnchor="end"
            >
              0
            </text>
          </>
        )}

        {/* X tick marks + labels */}
        {ticks.map((t, i) => {
          const x = mapX(t);
          const isEndpoint = i === 0 || i === ticks.length - 1;
          const showLabel = compact ? isEndpoint : true;
          return (
            <g key={t}>
              <line
                x1={x}
                x2={x}
                y1={H - padBottom}
                y2={H - padBottom + 3}
                stroke="#2d3449"
                strokeWidth={1}
              />
              {showLabel ? (
                <text
                  x={x}
                  y={H - padBottom + (compact ? 11 : 14)}
                  fill="#c4c9ac"
                  fontSize={compact ? 8 : 9}
                  fontFamily="DM Mono, monospace"
                  textAnchor="middle"
                >
                  R{t}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Non-highlighted lines first */}
        {nonHighlighted.map((s) => (
          <path
            key={s.key}
            d={pathFor(s)}
            fill="none"
            stroke={s.color}
            strokeOpacity={0.4}
            strokeWidth={1}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Highlighted lines on top */}
        {highlighted.map((s) => (
          <path
            key={s.key}
            d={pathFor(s)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Hover cursor + dots */}
        {hoverR !== null ? (
          <>
            <line
              x1={mapX(hoverR)}
              x2={mapX(hoverR)}
              y1={padTop}
              y2={H - padBottom}
              stroke="#c4c9ac"
              strokeOpacity={0.35}
              strokeDasharray="2 3"
              strokeWidth={1}
            />
            {hoverPoints.map(({ s, v }) => (
              <circle
                key={s.key}
                cx={mapX(hoverR)}
                cy={mapY(v)}
                r={s.highlighted ? 4 : 2.5}
                fill={s.color}
                stroke="#0b1326"
                strokeWidth={s.highlighted ? 1.5 : 1}
                opacity={s.highlighted ? 1 : 0.85}
              />
            ))}
          </>
        ) : null}
      </svg>

      {/* Tooltip */}
      {hoverR !== null && primary && pointerPx ? (
        <div
          className="pointer-events-none absolute z-20 min-w-[160px] rounded-sm border border-[#2d3449] bg-[#0b1326]/95 px-3 py-2 shadow-lg backdrop-blur"
          style={{
            left: `${Math.max(8, Math.min(pointerPx.x + 12, (wrapperRef.current?.clientWidth ?? 640) - 180))}px`,
            top: `${Math.max(8, pointerPx.y - 8)}px`,
          }}
        >
          {tooltipFormatter ? (
            tooltipFormatter(primary.s.label, hoverR, primary.v, primary.raw)
          ) : (
            <>
              <p
                className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: primary.s.color }}
              >
                {primary.s.label}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-[#c4c9ac] tabular-nums">
                Rodada {hoverR}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#dae2fd] tabular-nums">
                Z {fmtZ(primary.v)}
                {primary.raw !== undefined && Number.isFinite(primary.raw)
                  ? `  ·  raw ${fmtRaw(primary.raw)}`
                  : ""}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
