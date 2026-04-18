import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import type {
  Dashboard,
  PerformanceTeamRow,
  QualityLeader,
  QualityMetricsMap,
  QualitySlug,
  StandingsRow,
} from "../src/types/data";
import { byCsvName } from "../src/lib/clubs";

const DATA_IN = path.join(process.cwd(), "public/data");
const OUT_DIR = path.join(process.cwd(), "src/data/compiled");

function num(v: string | number | undefined): number {
  if (v === undefined || v === "" || v === null) return 0;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// Columns that are mapped to structural top-level fields (identity / context /
// the five quality Z-scores) and therefore should NOT be copied into the
// `metrics` bag. Columns that have a top-level alias but are ALSO potential
// component metrics of a quality (e.g. "xG (exceto pênaltis)", "xT (Ameaça
// esperada)") ARE kept in `metrics` so the drill-down UI can reach them by
// their raw CSV name.
const TOP_LEVEL_COLUMNS = new Set<string>([
  "Temporada",
  "rodada",
  "game_id",
  "data",
  "partida",
  "team_id",
  "clube",
  "possession",
  "opponent_possession",
  "place",
  "Defesa",
  "Transição defensiva",
  "Transição ofensiva",
  "Ataque",
  "Criação de chances",
  "Gols marcados",
  "Gols sofridos",
  "Diferença de gols",
]);

export function parsePerformanceTeam(csv: string): PerformanceTeamRow[] {
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  return parsed.data.map((r) => {
    const metrics: Record<string, number> = {};
    for (const key of Object.keys(r)) {
      if (TOP_LEVEL_COLUMNS.has(key)) continue;
      metrics[key] = num(r[key]);
    }
    return {
      temporada: num(r["Temporada"]),
      rodada: num(r["rodada"]),
      game_id: num(r["game_id"]),
      data: r["data"],
      partida: r["partida"],
      team_id: num(r["team_id"]),
      clube: r["clube"],
      place: (r["place"] as "Casa" | "Fora") ?? "Casa",
      possession: num(r["possession"]),
      opponent_possession: num(r["opponent_possession"]),
      gols_marcados: num(r["Gols marcados"]),
      gols_sofridos: num(r["Gols sofridos"]),
      diferenca_gols: num(r["Diferença de gols"]),
      q_defesa: num(r["Defesa"]),
      q_trans_defensiva: num(r["Transição defensiva"]),
      q_trans_ofensiva: num(r["Transição ofensiva"]),
      q_ataque: num(r["Ataque"]),
      q_criacao_de_chances: num(r["Criação de chances"]),
      xg_total: num(r["xG (Total)"]),
      xg_sem_pen: num(r["xG (exceto pênaltis)"]),
      xt: num(r["xT (Ameaça esperada)"]),
      metrics,
    };
  });
}

const QUALITY_LABELS = [
  "Defesa",
  "Transição defensiva",
  "Transição ofensiva",
  "Ataque",
  "Criação de chances",
] as const;

export interface ParseContextResult {
  metricsByQuality: QualityMetricsMap;
  qualityDefinitions: Record<string, string>;
}

/**
 * Parses `public/data/context.csv` into a per-quality list of metrics.
 *
 * @param csv               raw context.csv text
 * @param performanceHeaders optional set of valid column names from performance_team.csv.
 *                          When provided, metrics not present in this set are filtered out
 *                          and reported via `onSkip(quality, metric)`.
 */
export function parseContextMetrics(
  csv: string,
  performanceHeaders?: Set<string>,
  onSkip?: (quality: string, metric: string) => void,
): ParseContextResult {
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const metricsByQuality: QualityMetricsMap = {};
  const qualityDefinitions: Record<string, string> = {};
  for (const label of QUALITY_LABELS) {
    metricsByQuality[label] = [];
  }
  for (const row of parsed.data) {
    const quality = (row["Atributo"] ?? "").trim();
    const metric = (row["Métrica"] ?? "").trim();
    const definition = (row["Definição"] ?? "").trim();
    if (!quality) continue;
    if (!(quality in metricsByQuality)) continue; // unknown quality label -> ignore
    if (!metric) {
      // Quality-level definition row (no Métrica value).
      qualityDefinitions[quality] = definition;
      continue;
    }
    if (performanceHeaders && !performanceHeaders.has(metric)) {
      onSkip?.(quality, metric);
      continue;
    }
    metricsByQuality[quality].push({ metric, definition });
  }
  return { metricsByQuality, qualityDefinitions };
}

export function computeStandings(rows: PerformanceTeamRow[]): StandingsRow[] {
  const byTeam = new Map<number, StandingsRow>();
  // Group by team_id
  for (const r of rows) {
    const cur =
      byTeam.get(r.team_id) ??
      {
        team_id: r.team_id,
        clube: r.clube,
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        gols_pro: 0,
        gols_contra: 0,
        saldo: 0,
        pontos: 0,
        posicao: 0,
        forma_z_media_ultimos_5: 0,
      };
    cur.jogos += 1;
    cur.gols_pro += r.gols_marcados;
    cur.gols_contra += r.gols_sofridos;
    if (r.diferenca_gols > 0) { cur.vitorias += 1; cur.pontos += 3; }
    else if (r.diferenca_gols === 0) { cur.empates += 1; cur.pontos += 1; }
    else { cur.derrotas += 1; }
    byTeam.set(r.team_id, cur);
  }
  // Form: mean of (avg of 5 qualities) across last 5 games (by rodada desc)
  for (const [team_id, s] of byTeam) {
    const games = rows
      .filter((r) => r.team_id === team_id)
      .sort((a, b) => b.rodada - a.rodada)
      .slice(0, 5);
    if (games.length > 0) {
      const perGame = games.map(
        (g) => (g.q_defesa + g.q_trans_defensiva + g.q_trans_ofensiva + g.q_ataque + g.q_criacao_de_chances) / 5
      );
      s.forma_z_media_ultimos_5 = perGame.reduce((a, b) => a + b, 0) / perGame.length;
    }
  }
  // Saldo + sort + posicao
  const table = [...byTeam.values()].map((s) => ({ ...s, saldo: s.gols_pro - s.gols_contra }));
  table.sort((a, b) => (b.pontos - a.pontos) || (b.saldo - a.saldo) || (b.gols_pro - a.gols_pro));
  table.forEach((s, i) => (s.posicao = i + 1));
  return table;
}

const QUALITY_SPECS: Array<{
  quality: QualitySlug;
  label: string;
  pick: (r: PerformanceTeamRow) => number;
}> = [
  { quality: "trans_defensiva", label: "Melhor transição defensiva", pick: (r) => r.q_trans_defensiva },
  { quality: "trans_ofensiva", label: "Melhor transição ofensiva", pick: (r) => r.q_trans_ofensiva },
  { quality: "ataque", label: "Melhor ataque", pick: (r) => r.q_ataque },
  { quality: "criacao_de_chances", label: "Melhor criação de chances", pick: (r) => r.q_criacao_de_chances },
];

export function computeDashboard(rows: PerformanceTeamRow[]): Dashboard {
  if (rows.length === 0) {
    return { rodada: 0, leaders: [] };
  }

  const latestRodada = rows.reduce((m, r) => (r.rodada > m ? r.rodada : m), 0);
  const latestRows = rows.filter((r) => r.rodada === latestRodada);

  const leaders: QualityLeader[] = QUALITY_SPECS.map(({ quality, label, pick }) => {
    let top = latestRows[0];
    for (const r of latestRows) {
      if (pick(r) > pick(top)) top = r;
    }
    const club = byCsvName(top.clube);
    return {
      quality,
      label,
      clube: top.clube,
      displayName: club?.displayName ?? top.clube,
      slug: club?.slug ?? null,
      z: pick(top),
    };
  });

  return { rodada: latestRodada, leaders };
}

function run() {
  mkdirSync(OUT_DIR, { recursive: true });
  const perfCsv = readFileSync(path.join(DATA_IN, "performance_team.csv"), "utf8");
  const perf = parsePerformanceTeam(perfCsv);
  const standings = computeStandings(perf);
  const dashboard = computeDashboard(perf);

  const contextCsv = readFileSync(path.join(DATA_IN, "context.csv"), "utf8");
  const performanceHeaders = new Set<string>(
    perf.length > 0 ? Object.keys(perf[0].metrics) : [],
  );
  const skipped: Array<{ quality: string; metric: string }> = [];
  const { metricsByQuality } = parseContextMetrics(contextCsv, performanceHeaders, (q, m) =>
    skipped.push({ quality: q, metric: m }),
  );

  writeFileSync(path.join(OUT_DIR, "performance-team.json"), JSON.stringify(perf));
  writeFileSync(path.join(OUT_DIR, "standings.json"), JSON.stringify(standings, null, 2));
  writeFileSync(path.join(OUT_DIR, "dashboard.json"), JSON.stringify(dashboard, null, 2));
  writeFileSync(
    path.join(OUT_DIR, "quality-metrics.json"),
    JSON.stringify(metricsByQuality, null, 2),
  );

  console.log(
    `compiled ${perf.length} performance rows, ${standings.length} standings rows, dashboard rodada=${dashboard.rodada}`,
  );
  const summary = Object.entries(metricsByQuality)
    .map(([q, ms]) => `${q}=${ms.length}`)
    .join(", ");
  console.log(`quality-metrics: ${summary}`);
  if (skipped.length > 0) {
    console.log(
      `skipped ${skipped.length} context.csv metric(s) not present in performance_team.csv:`,
    );
    for (const { quality, metric } of skipped) {
      console.log(`  - [${quality}] ${metric}`);
    }
  }
}

// Auto-run when invoked as a script (tsx or node)
if (process.argv[1] && process.argv[1].endsWith("compile-data.ts")) {
  run();
}
