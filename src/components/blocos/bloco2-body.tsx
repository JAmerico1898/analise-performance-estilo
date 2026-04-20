// src/components/blocos/bloco2-body.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PerformanceTeamRow, QualityMetricsMap } from "@/types/data";
import qualityMetricsJson from "@/data/compiled/quality-metrics.json";
import type { Club } from "@/lib/clubs";
import { byCsvName } from "@/lib/clubs";
import { Strip, describeGame, sanitizePartida } from "./distribution-strip";

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

const QUALITY_BY_KEY: Record<QualityKey, QualitySpec> = Object.fromEntries(
  QUALITIES.map((q) => [q.key, q]),
) as Record<QualityKey, QualitySpec>;

function rankByQuality(
  peers: PerformanceTeamRow[],
  selected: PerformanceTeamRow,
  key: QualityKey,
): number {
  const sorted = [...peers].sort((a, b) => b[key] - a[key]);
  // Match by (game_id, team_id) since different team-rows in the same rodada
  // can share a game_id.
  return (
    sorted.findIndex(
      (g) => g.game_id === selected.game_id && g.team_id === selected.team_id,
    ) + 1
  );
}

function rankByMetric(
  peers: PerformanceTeamRow[],
  selected: PerformanceTeamRow,
  metric: string,
): number {
  const valueOf = (g: PerformanceTeamRow) => g.metrics?.[metric] ?? 0;
  const sorted = [...peers].sort((a, b) => valueOf(b) - valueOf(a));
  return (
    sorted.findIndex(
      (g) => g.game_id === selected.game_id && g.team_id === selected.team_id,
    ) + 1
  );
}

/**
 * Parse a "partida" string like "Bahia 1.0 x 0.0 Vitoria" and return the
 * opponent's display name (falling back to their raw CSV name) plus a tidy
 * scoreline like "1x0". Returns null fields if parsing fails.
 */
function parseOpponent(
  partida: string,
  clubCsvName: string,
): { opponent: string; scoreline: string } | null {
  // Expected format: "<Home> <H>.0 x <A>.0 <Away>"
  const match = partida.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s+(.+)$/);
  if (!match) return null;
  const [, homeRaw, homeScoreStr, awayScoreStr, awayRaw] = match;
  const home = homeRaw.trim();
  const away = awayRaw.trim();
  const homeScore = Math.round(parseFloat(homeScoreStr));
  const awayScore = Math.round(parseFloat(awayScoreStr));
  const isHome = home === clubCsvName;
  const isAway = away === clubCsvName;
  if (!isHome && !isAway) return null;
  const opponentCsv = isHome ? away : home;
  const opponentClub = byCsvName(opponentCsv);
  const opponent = opponentClub?.displayName ?? opponentCsv;
  // Scoreline is always shown from the selected club's perspective:
  // "<own> x <opp>".
  const own = isHome ? homeScore : awayScore;
  const opp = isHome ? awayScore : homeScore;
  return { opponent, scoreline: `${own}x${opp}` };
}

export function Bloco2Body({
  games,
  allRoundRows,
  club,
}: {
  games: PerformanceTeamRow[];
  allRoundRows: PerformanceTeamRow[];
  club: Club;
}) {
  const [selectedIdx, setSelectedIdx] = useState(games.length - 1);
  const [openQuality, setOpenQuality] = useState<QualityKey | null>(null);
  const selected = games[selectedIdx];
  const totalGames = games.length;

  const goPrev = () => setSelectedIdx((i) => Math.max(0, i - 1));
  const goNext = () => setSelectedIdx((i) => Math.min(totalGames - 1, i + 1));

  const options = useMemo(
    () => games.map((g, i) => ({ i, label: describeGame(g) })),
    [games],
  );

  // The 20 peer team-rows for the currently-selected rodada (including the
  // selected club's own row).
  const peers = useMemo(
    () => allRoundRows.filter((r) => r.rodada === selected.rodada),
    [allRoundRows, selected.rodada],
  );
  const peersCount = peers.length;

  const openSpec = openQuality ? QUALITY_BY_KEY[openQuality] : null;
  const openMetrics = openSpec ? qualityMetricsMap[openSpec.label] ?? [] : [];

  const opponentInfo = parseOpponent(selected.partida, club.csvName);
  const chipText = opponentInfo
    ? `${club.displayName} · ${selected.place} · vs ${opponentInfo.opponent} ${opponentInfo.scoreline}`
    : `${club.displayName} · ${selected.place} · ${sanitizePartida(selected.partida)}`;

  return (
    <section className="mt-10">
      {/* Game selector */}
      <div className="flex flex-col gap-3 rounded-sm border border-[#e5e7eb] bg-white p-4 md:flex-row md:items-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3b4456] md:w-40">
          Jogo selecionado
        </p>
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={selectedIdx === 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f3f4f6] text-[#556b00] transition-colors hover:border-[#c3f400] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#e5e7eb]"
            aria-label="Jogo anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <select
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(parseInt(e.target.value, 10))}
            className="flex-1 rounded-sm border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 font-mono text-sm text-[#0b1326] focus:border-[#c3f400] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
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
            disabled={selectedIdx === totalGames - 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f3f4f6] text-[#556b00] transition-colors hover:border-[#c3f400] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#e5e7eb]"
            aria-label="Próximo jogo"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Context chip */}
      <p className="mt-3 font-mono text-[11px] tracking-wide text-[#3b4456]">
        {chipText}
      </p>

      {openSpec ? (
        <>
          {/* Drill-down header: back button + breadcrumb */}
          <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => setOpenQuality(null)}
              className="inline-flex w-fit items-center gap-2 rounded-sm border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#556b00] transition-colors hover:border-[#c3f400] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <ChevronLeft className="size-4" />
              Voltar para qualidades
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3b4456]">
              Clube na Rodada{" "}
              <span className="text-[#3b4456]">·</span>{" "}
              <span style={{ color: openSpec.accent }}>{openSpec.label}</span>
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#3b4456]">
            O gráfico abaixo apresenta o desempenho da equipe nas métricas que compõem a qualidade{" "}
            <span style={{ color: openSpec.accent }}>{openSpec.label}</span>, comparado com as outras {Math.max(0, peersCount - 1)} equipes da rodada. O jogo selecionado está destacado. Os valores nominais são apresentados; Z-scores são normalizados dentro da rodada.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {openMetrics.length === 0 ? (
              <p className="text-sm text-[#3b4456]">Sem métricas cadastradas para esta qualidade.</p>
            ) : (
              openMetrics.map((m) => {
                const zSel = selected.metrics?.[m.metric] ?? 0;
                const rawSel = selected.rawMetrics?.[m.metric];
                const rank = rankByMetric(peers, selected, m.metric);
                const points = peers.map((g) => ({
                  // Use a composite key so React/Strip can distinguish the two
                  // team-rows that share a game_id within a rodada.
                  gameId: g.game_id * 100 + g.team_id,
                  rodada: g.rodada,
                  partida: g.partida,
                  z: g.metrics?.[m.metric] ?? 0,
                  raw: g.rawMetrics?.[m.metric],
                  team: byCsvName(g.clube)?.displayName ?? g.clube,
                }));
                return (
                  <Strip
                    key={m.metric}
                    label={m.metric}
                    accent={openSpec.accent}
                    zSelected={zSel}
                    rawSelected={rawSel}
                    rank={rank}
                    total={peersCount}
                    totalUnit="equipes"
                    selectedGameId={selected.game_id * 100 + selected.team_id}
                    selectedDescribe={describeGame(selected)}
                    selectedTeam={club.displayName}
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
          <p className="mt-4 text-xs leading-relaxed text-[#3b4456]">
            Cada faixa mostra as {peersCount} equipes que jogaram na rodada {selected.rodada}. O marcador em destaque é a equipe selecionada. Cada partida aparece duas vezes — uma para cada equipe. Z positivo = desempenho acima da média da rodada; Z negativo = abaixo. Clique em uma qualidade para ver as métricas que a compõem.
          </p>

          {/* Quality strips */}
          <div className="mt-6 grid grid-cols-1 gap-3">
            {QUALITIES.map((q) => {
              const zSel = selected[q.key];
              const rank = rankByQuality(peers, selected, q.key);
              const points = peers.map((g) => ({
                gameId: g.game_id * 100 + g.team_id,
                rodada: g.rodada,
                partida: g.partida,
                z: g[q.key],
                team: byCsvName(g.clube)?.displayName ?? g.clube,
              }));
              return (
                <Strip
                  key={q.key}
                  label={q.label}
                  accent={q.accent}
                  zSelected={zSel}
                  rank={rank}
                  total={peersCount}
                  totalUnit="equipes"
                  selectedGameId={selected.game_id * 100 + selected.team_id}
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
