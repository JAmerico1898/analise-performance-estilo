// src/components/blocos/distribution-strip.tsx
"use client";

import { useState } from "react";
import type { PerformanceTeamRow } from "@/types/data";

export const STRIP_WIDTH = 520;
export const STRIP_HEIGHT = 64;
export const MARGIN = 16;
const DEFAULT_BOUND = 2;

export function computeBound(zs: number[]): number {
  let max = DEFAULT_BOUND;
  for (const z of zs) {
    if (!Number.isFinite(z)) continue;
    const a = Math.abs(z);
    if (a > max) max = a;
  }
  return Math.ceil(max);
}

export function makeMapZtoX(bound: number) {
  return (z: number) => {
    const clamped = Math.max(-bound, Math.min(bound, z));
    const t = (clamped - -bound) / (bound - -bound);
    return MARGIN + t * (STRIP_WIDTH - 2 * MARGIN);
  };
}

export function fmtZ(z: number): string {
  return `${z >= 0 ? "+" : ""}${z.toFixed(2)}`;
}

export function fmtRaw(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v - Math.round(v)) < 1e-9) return Math.round(v).toString();
  return v.toFixed(2);
}

export function sanitizePartida(partida: string): string {
  // "Fluminense 1.0 x 2.0 Flamengo" → "Fluminense 1 x 2 Flamengo"
  return partida.replace(/\.0\b/g, "");
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  if (!m || !d) return iso;
  return `${d}/${m}`;
}

export function describeGame(g: PerformanceTeamRow): string {
  return `R${g.rodada} · ${formatDate(g.data)} · ${sanitizePartida(g.partida)} · ${g.place}`;
}

export type StripPoint = {
  gameId: number;
  rodada: number;
  partida: string;
  z: number;
  raw?: number;
  team?: string;
};

export type StripProps = {
  label: string;
  accent: string;
  zSelected: number;
  rawSelected?: number;
  selectedTeam?: string;
  rank: number;
  total: number;
  selectedGameId: number;
  selectedDescribe: string;
  points: StripPoint[];
  onClick?: () => void;
  ariaRole?: "button" | "img";
  sublabel?: string;
  totalUnit?: string;
};

export function Strip({
  label,
  accent,
  zSelected,
  rawSelected,
  selectedTeam,
  rank,
  total,
  selectedGameId,
  selectedDescribe,
  points,
  onClick,
  ariaRole,
  sublabel,
  totalUnit = "jogos",
}: StripProps) {
  const hasRaw = rawSelected !== undefined;
  const [hoveredKey, setHoveredKey] = useState<number | "selected" | null>(null);
  let hovered:
    | { team?: string; rodada: number; partida: string; z: number; raw?: number; isSelected: boolean }
    | null = null;
  if (hoveredKey === "selected") {
    hovered = {
      team: selectedTeam,
      rodada: 0,
      partida: "",
      z: zSelected,
      raw: rawSelected,
      isSelected: true,
    };
  } else if (hoveredKey !== null) {
    const p = points.find((pt) => pt.gameId === hoveredKey);
    if (p) hovered = { ...p, isSelected: false };
  }
  const hoveredZ = hovered ? hovered.z : 0;
  const bound = computeBound([zSelected, ...points.map((p) => p.z)]);
  const mapZtoX = makeMapZtoX(bound);
  const interactive = Boolean(onClick);
  const Wrapper: "button" | "div" = interactive ? "button" : "div";
  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={
        "group flex w-full flex-col gap-3 rounded-sm border-l-4 bg-white p-4 text-left opacity-100 md:flex-row md:items-center md:gap-6" +
        (interactive
          ? " cursor-pointer transition-colors hover:bg-[#f3f4f6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          : "")
      }
      style={{ borderLeftColor: accent }}
      aria-label={
        interactive
          ? `Abrir métricas de ${label}: Z ${fmtZ(zSelected)}, ${rank} de ${total}`
          : undefined
      }
    >
      <div className="md:w-48 md:shrink-0">
        <p
          className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-100"
          style={{ color: accent }}
        >
          {label}
        </p>
        {hasRaw ? (
          <>
            <p className="mt-1 font-mono tabular text-lg font-black text-[#0b1326]">
              {fmtRaw(rawSelected!)}
            </p>
            <p className="mt-0.5 font-mono tabular text-[11px] text-[#3b4456]">
              Z {fmtZ(zSelected)}
            </p>
          </>
        ) : (
          <p className="mt-1 font-mono tabular text-lg font-black text-[#0b1326]">
            {fmtZ(zSelected)}
          </p>
        )}
        <p className="mt-1 text-[11px] text-[#3b4456]">
          {rank}º de {total} {totalUnit}
        </p>
        {sublabel ? (
          <p className="mt-1 text-[10px] leading-snug text-[#3b4456]">{sublabel}</p>
        ) : null}
      </div>

      <div
        className="relative w-full max-w-[640px]"
        onPointerLeave={() => setHoveredKey(null)}
      >
        <svg
          viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
          className="block w-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          role={ariaRole ?? "img"}
          aria-label={`Distribuição ${label}: ${fmtZ(zSelected)} no jogo selecionado, ${rank} de ${total}`}
        >
          {/* Axis baseline */}
          <line
            x1={MARGIN}
            x2={STRIP_WIDTH - MARGIN}
            y1={STRIP_HEIGHT / 2}
            y2={STRIP_HEIGHT / 2}
            stroke="#e5e7eb"
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
            −{bound}
          </text>
          <text x={mapZtoX(0) - 3} y={STRIP_HEIGHT - 2} fill="#5e5e5e" fontSize={9} fontFamily="DM Mono, monospace">
            0
          </text>
          <text x={STRIP_WIDTH - MARGIN - 10} y={STRIP_HEIGHT - 2} fill="#5e5e5e" fontSize={9} fontFamily="DM Mono, monospace">
            +{bound}
          </text>
          {/* Other games */}
          {points.map((p) => {
            if (p.gameId === selectedGameId) return null;
            const cx = mapZtoX(p.z);
            const isHover = hoveredKey === p.gameId;
            return (
              <circle
                key={p.gameId}
                cx={cx}
                cy={STRIP_HEIGHT / 2}
                r={isHover ? 6 : 4}
                fill="#8e9379"
                fillOpacity={isHover ? 1 : 0.5}
                style={{ cursor: "pointer" }}
                onPointerEnter={() => setHoveredKey(p.gameId)}
              >
                <title>
                  {[
                    p.team,
                    `R${p.rodada} · ${sanitizePartida(p.partida)}`,
                    p.raw !== undefined
                      ? `${label}: ${fmtRaw(p.raw)} (Z ${fmtZ(p.z)})`
                      : `${label}: ${fmtZ(p.z)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </title>
              </circle>
            );
          })}
          {/* Selected game highlight */}
          <circle
            cx={mapZtoX(zSelected)}
            cy={STRIP_HEIGHT / 2}
            r={8}
            fill={accent}
            stroke="#0b1326"
            strokeWidth={2}
            style={{ cursor: "pointer" }}
            onPointerEnter={() => setHoveredKey("selected")}
          >
            <title>
              {hasRaw
                ? `${selectedDescribe} · ${label}: ${fmtRaw(rawSelected!)} (Z ${fmtZ(zSelected)})`
                : `${selectedDescribe} · ${label}: ${fmtZ(zSelected)}`}
            </title>
          </circle>
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute z-20 min-w-[180px] -translate-x-1/2 rounded-sm border border-[#e5e7eb] bg-white/95 px-3 py-2 shadow-lg backdrop-blur"
            style={{
              left: `${(mapZtoX(hoveredZ) / STRIP_WIDTH) * 100}%`,
              top: "50%",
              transform: "translate(-50%, calc(-100% - 14px))",
            }}
          >
            {hovered.team ? (
              <p
                className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: accent }}
              >
                {hovered.team}
              </p>
            ) : null}
            {hovered.isSelected ? (
              <p className="mt-0.5 text-[10px] text-[#3b4456]">{selectedDescribe}</p>
            ) : (
              <p className="mt-0.5 text-[10px] text-[#3b4456]">
                R{hovered.rodada} · {sanitizePartida(hovered.partida)}
              </p>
            )}
            <p className="mt-1 font-mono tabular text-[11px] text-[#0b1326]">
              {label}:{" "}
              {hovered.raw !== undefined
                ? `${fmtRaw(hovered.raw)} (Z ${fmtZ(hovered.z)})`
                : `Z ${fmtZ(hovered.z)}`}
            </p>
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}
