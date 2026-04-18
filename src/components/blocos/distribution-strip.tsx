// src/components/blocos/distribution-strip.tsx
"use client";

import type { PerformanceTeamRow } from "@/types/data";

export const AXIS_MIN = -3;
export const AXIS_MAX = 3;
export const STRIP_WIDTH = 520;
export const STRIP_HEIGHT = 64;
export const MARGIN = 16;

export function mapZtoX(z: number) {
  const clamped = Math.max(AXIS_MIN, Math.min(AXIS_MAX, z));
  const t = (clamped - AXIS_MIN) / (AXIS_MAX - AXIS_MIN);
  return MARGIN + t * (STRIP_WIDTH - 2 * MARGIN);
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

export type StripProps = {
  label: string;
  accent: string;
  zSelected: number;
  rawSelected?: number;
  rank: number;
  total: number;
  selectedGameId: number;
  selectedDescribe: string;
  points: Array<{ gameId: number; rodada: number; partida: string; z: number; raw?: number }>;
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
  const interactive = Boolean(onClick);
  const Wrapper: "button" | "div" = interactive ? "button" : "div";
  return (
    <Wrapper
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={
        "group flex w-full flex-col gap-3 rounded-sm border-l-2 bg-[#131b2e] p-4 text-left md:flex-row md:items-center md:gap-6" +
        (interactive
          ? " cursor-pointer transition-colors hover:bg-[#17203a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1326]"
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
          className="font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: accent }}
        >
          {label}
        </p>
        {hasRaw ? (
          <>
            <p className="mt-1 font-mono tabular text-lg font-black text-[#dae2fd]">
              {fmtRaw(rawSelected!)}
            </p>
            <p className="mt-0.5 font-mono tabular text-[11px] text-[#c4c9ac]">
              Z {fmtZ(zSelected)}
            </p>
          </>
        ) : (
          <p className="mt-1 font-mono tabular text-lg font-black text-[#dae2fd]">
            {fmtZ(zSelected)}
          </p>
        )}
        <p className="mt-1 text-[11px] text-[#c4c9ac]">
          {rank}º de {total} {totalUnit}
        </p>
        {sublabel ? (
          <p className="mt-1 text-[10px] leading-snug text-[#8e9379]">{sublabel}</p>
        ) : null}
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
          className="w-full max-w-[640px]"
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
          {points.map((p) => {
            if (p.gameId === selectedGameId) return null;
            const cx = mapZtoX(p.z);
            return (
              <circle
                key={p.gameId}
                cx={cx}
                cy={STRIP_HEIGHT / 2}
                r={4}
                fill="#8e9379"
                fillOpacity={0.5}
              >
                <title>
                  {p.raw !== undefined
                    ? `R${p.rodada} · ${sanitizePartida(p.partida)} · ${label}: ${fmtRaw(p.raw)} (Z ${fmtZ(p.z)})`
                    : `R${p.rodada} · ${sanitizePartida(p.partida)} · ${label}: ${fmtZ(p.z)}`}
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
          >
            <title>
              {hasRaw
                ? `${selectedDescribe} · ${label}: ${fmtRaw(rawSelected!)} (Z ${fmtZ(zSelected)})`
                : `${selectedDescribe} · ${label}: ${fmtZ(zSelected)}`}
            </title>
          </circle>
        </svg>
      </div>
    </Wrapper>
  );
}
