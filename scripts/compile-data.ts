import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import type {
  Dashboard,
  LlmInputsMap,
  LlmLocalInputs,
  LlmStat,
  MovingAvgDataset,
  MovingAvgTeamSeries,
  PerformanceTeamRow,
  QualityLeader,
  QualityMetricsMap,
  QualitySlug,
  StandingsRow,
  StyleCatalogEntry,
  StyleDistributionMap,
  StyleInputsMap,
  StyleLocalInputs,
  StyleMetricValue,
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
      rawMetrics: {},
    };
  });
}

// Alias for parsing performance_round.csv: the schema is identical to
// performance_team.csv (same columns, same structural fields), but the Z-scores
// in the quality/metric columns are normalized within each rodada across the
// 20 team-rows of that round, rather than within each team across its own games.
// Consumers that want round-scoped Z distributions should use this entry point.
export const parsePerformanceRound = parsePerformanceTeam;

// Maps English column names in performance_metrics.csv to the Portuguese metric
// names used in performance_team.csv / context.csv. Only columns that correspond
// to a quality-composing metric are listed here.
const METRIC_EN_TO_PT: Record<string, string> = {
  PPDA: "PPDA",
  defensive_intensity: "Intensidade defensiva",
  "defensive_duels_won_%": "Duelos defensivos vencidos (%)",
  defensive_height: "Altura defensiva (m)",
  opposition_pass_tempo: "Velocidade do passe adversário",
  opposition_progression_percentage: "Entradas do adversário no último terço (%)",
  "opp_final_third_to_box_%": "Entradas do adversário na área (%)",
  Opposition_xT: "xT adversário",
  high_turnovers: "Perdas de posse na linha baixa",
  turnover_line_height: "Altura da perda de posse (m)",
  "recoveries_within_5s_%": "Recuperações de posse em 5s (%)",
  avg_time_to_defensive_action: "Tempo médio ação defensiva (s)",
  opposition_final_third_entries_10s: "Entradas do adversário no último terço em 10s da recuperação da posse",
  opposition_box_entries_10s: "Entradas do adversário na área em 10s da recuperação da posse",
  opposition_xG_10s: "xG do adversário em 10s da recuperação da posse",
  recoveries: "Recuperações de posse",
  recovery_height: "Altura da recuperação de posse (m)",
  retained_possessions_5s: "Posse mantida em 5s",
  "retained_possessions_5s_%": "Posse mantida em 5s (%)",
  final_third_entries_10s: "Entradas no último terço em 10s",
  box_entries_10s: "Entradas na área em 10s",
  xG_10s: "xG em 10s da recuperação da posse",
  xT_10s: "xT em 10s da recuperação da posse",
  "field_tilt_%": "Field tilt (%)",
  "long_ball_%": "Bola longa (%)",
  pass_tempo: "Velocidade do passe",
  "final_third_entries_%": "Entradas no último terço (%)",
  "final_third_to_box_entries_%": "Entradas na área (%)",
  xT: "xT (Ameaça esperada)",
  penalty_area_touches: "Toques na área",
  "box_entries_to_shot_%": "Finalizações (pEntrada na área, %)",
  np_shots: "Finalizações (exceto pênaltis)",
  high_opportunity_shots: "Grandes oportunidades",
  np_xg: "xG (exceto pênaltis)",
  np_goals: "Gols (exceto pênaltis)",
  xg_per_shot: "xG (pFinalização)",
  total_xg: "xG (Total)",
};

/**
 * Parse performance_metrics.csv (raw, non-Z-scored values) into a map keyed by
 * `${game_id}:${team_id}` → { ptMetricName: rawValue }.
 */
export function parsePerformanceMetrics(csv: string): Map<string, Record<string, number>> {
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const out = new Map<string, Record<string, number>>();
  for (const r of parsed.data) {
    const gameId = num(r["game_id"]);
    const teamId = num(r["team_id"]);
    if (!gameId || !teamId) continue;
    const raw: Record<string, number> = {};
    for (const [en, pt] of Object.entries(METRIC_EN_TO_PT)) {
      if (r[en] !== undefined) raw[pt] = num(r[en]);
    }
    out.set(`${gameId}:${teamId}`, raw);
  }
  return out;
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

const QUALITY_KEYS: Array<keyof PerformanceTeamRow> = [
  "q_defesa",
  "q_trans_defensiva",
  "q_trans_ofensiva",
  "q_ataque",
  "q_criacao_de_chances",
];

/**
 * Compute a 5-game moving average per team for each quality, metric Z, and raw
 * metric value. For each rodada R, the MA uses the 5 most recent games the
 * team has with rodada ≤ R. If fewer than 5 exist, the entry is null.
 *
 * Arrays are indexed by `rodada - 1` (length = global maxRodada).
 */
export function computeMovingAverages(rounds: PerformanceTeamRow[]): MovingAvgDataset {
  if (rounds.length === 0) {
    return { maxRodada: 0, minRodadaWithMA: 0, teams: [] };
  }
  const maxRodada = rounds.reduce((m, r) => (r.rodada > m ? r.rodada : m), 0);

  // Group by team_id
  const byTeam = new Map<number, PerformanceTeamRow[]>();
  for (const r of rounds) {
    const arr = byTeam.get(r.team_id) ?? [];
    arr.push(r);
    byTeam.set(r.team_id, arr);
  }

  // Collect the union of all metric keys / raw keys across the dataset.
  const metricKeys = new Set<string>();
  const rawKeys = new Set<string>();
  for (const r of rounds) {
    for (const k of Object.keys(r.metrics)) metricKeys.add(k);
    for (const k of Object.keys(r.rawMetrics)) rawKeys.add(k);
  }

  const teams: MovingAvgTeamSeries[] = [];
  let minRodadaWithMA = Number.POSITIVE_INFINITY;

  for (const [, teamRows] of byTeam) {
    const sorted = [...teamRows].sort((a, b) => a.rodada - b.rodada);
    const csv = sorted[0].clube;
    const club = byCsvName(csv);

    const qualities: Record<string, Array<number | null>> = {};
    for (const qk of QUALITY_KEYS) {
      qualities[qk as string] = Array.from({ length: maxRodada }, () => null);
    }
    const metricsZ: Record<string, Array<number | null>> = {};
    for (const k of metricKeys) {
      metricsZ[k] = Array.from({ length: maxRodada }, () => null);
    }
    const metricsRaw: Record<string, Array<number | null>> = {};
    for (const k of rawKeys) {
      metricsRaw[k] = Array.from({ length: maxRodada }, () => null);
    }

    // For each rodada R in [1..maxRodada], compute the MA using the 5 most
    // recent games the team has with rodada ≤ R.
    for (let R = 1; R <= maxRodada; R++) {
      const eligible = sorted.filter((g) => g.rodada <= R);
      if (eligible.length < 5) continue;
      const window = eligible.slice(-5); // 5 most recent (sorted ascending)
      const idx = R - 1;

      for (const qk of QUALITY_KEYS) {
        let sum = 0;
        for (const g of window) sum += g[qk] as number;
        qualities[qk as string][idx] = sum / window.length;
      }
      for (const mk of metricKeys) {
        let sum = 0;
        let n = 0;
        for (const g of window) {
          const v = g.metrics[mk];
          if (typeof v === "number" && Number.isFinite(v)) {
            sum += v;
            n += 1;
          }
        }
        metricsZ[mk][idx] = n > 0 ? sum / n : null;
      }
      for (const rk of rawKeys) {
        let sum = 0;
        let n = 0;
        for (const g of window) {
          const v = g.rawMetrics[rk];
          if (typeof v === "number" && Number.isFinite(v)) {
            sum += v;
            n += 1;
          }
        }
        metricsRaw[rk][idx] = n > 0 ? sum / n : null;
      }

      if (R < minRodadaWithMA) minRodadaWithMA = R;
    }

    teams.push({
      slug: club?.slug ?? null,
      displayName: club?.displayName ?? csv,
      clube: csv,
      qualities,
      metricsZ,
      metricsRaw,
    });
  }

  return {
    maxRodada,
    minRodadaWithMA: Number.isFinite(minRodadaWithMA) ? minRodadaWithMA : 0,
    teams,
  };
}

// Bloco 5 — last-5-games inputs for the LLM narrative.
//
// For each club and each place ("Casa" | "Fora"):
//   - pick the 5 most recent rows (by rodada desc) matching that place
//   - compute per-quality mean Z over those games → attributes (sorted desc)
//   - compute per-metric mean Z over those games, restricted to metrics that
//     compose any quality (per quality-metrics.json) → two sorted lists:
//        melhores: top 6 desc
//        piores:   bottom 6 asc
// Clubs with zero games in a given modality emit `null` for that place.

const QUALITY_LABEL_BY_KEY: Record<string, string> = {
  q_defesa: "Defesa",
  q_trans_defensiva: "Transição defensiva",
  q_trans_ofensiva: "Transição ofensiva",
  q_ataque: "Ataque",
  q_criacao_de_chances: "Criação de chances",
};

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  let s = 0;
  for (const n of nums) s += n;
  return s / nums.length;
}

function computeLocalInputs(
  games: PerformanceTeamRow[],
  componentMetrics: Set<string>,
): LlmLocalInputs | null {
  if (games.length === 0) return null;

  // Per-quality mean Z across the window
  const attributes: LlmStat[] = Object.entries(QUALITY_LABEL_BY_KEY).map(
    ([key, label]) => {
      const vals = games.map((g) => g[key as keyof PerformanceTeamRow] as number);
      return { label, z: mean(vals) };
    },
  );
  attributes.sort((a, b) => b.z - a.z);

  // Per-metric mean Z across the window — ONLY component metrics
  const metricSums = new Map<string, { sum: number; n: number }>();
  for (const g of games) {
    for (const [mk, mv] of Object.entries(g.metrics)) {
      if (!componentMetrics.has(mk)) continue;
      if (typeof mv !== "number" || !Number.isFinite(mv)) continue;
      const cur = metricSums.get(mk) ?? { sum: 0, n: 0 };
      cur.sum += mv;
      cur.n += 1;
      metricSums.set(mk, cur);
    }
  }
  const metricStats: LlmStat[] = [];
  for (const [mk, { sum, n }] of metricSums) {
    if (n === 0) continue;
    metricStats.push({ label: mk, z: sum / n });
  }
  const melhores = [...metricStats].sort((a, b) => b.z - a.z).slice(0, 6);
  const piores = [...metricStats].sort((a, b) => a.z - b.z).slice(0, 6);

  return {
    jogos: games.length,
    attributes,
    melhores,
    piores,
  };
}

export function computeLlmInputs(
  perfRound: PerformanceTeamRow[],
  qualityMetrics: QualityMetricsMap,
): LlmInputsMap {
  // Union of all component metric names across the 5 qualities.
  const componentMetrics = new Set<string>();
  for (const metrics of Object.values(qualityMetrics)) {
    for (const m of metrics) componentMetrics.add(m.metric);
  }

  // Group rows by csv club name.
  const byClub = new Map<string, PerformanceTeamRow[]>();
  for (const r of perfRound) {
    const arr = byClub.get(r.clube) ?? [];
    arr.push(r);
    byClub.set(r.clube, arr);
  }

  const out: LlmInputsMap = {};
  for (const [csvName, rows] of byClub) {
    const club = byCsvName(csvName);
    if (!club) continue; // unmapped clubs are skipped

    const pick = (place: "Casa" | "Fora"): LlmLocalInputs | null => {
      const games = rows
        .filter((r) => r.place === place)
        .sort((a, b) => b.rodada - a.rodada)
        .slice(0, 5);
      return computeLocalInputs(games, componentMetrics);
    };

    out[club.slug] = {
      casa: pick("Casa"),
      fora: pick("Fora"),
    };
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilo (Análise de Estilo) — play_style_metrics.csv → per-club last-5-games
// averages (nominal, non-Z), per-metric cross-club distributions, and the
// 21-style catalog from play_style2.csv. context_style.csv drives the
// Atributo → [metric] grouping for the UI's collapsible distribution strips.
// ─────────────────────────────────────────────────────────────────────────────

// Map from play_style_metrics.csv English column name → Portuguese Métrica
// label from context_style.csv. Order preserved so emitted metric lists are
// stable. Columns that are not style metrics (identity + possession) are not
// listed here.
const STYLE_EN_TO_PT: Record<string, string> = {
  defensive_height: "Altura defensiva (m)",
  "high_recoveries_%": "Recuperações de posse no último terço (%)",
  PPDA: "PPDA",
  "fouls_in_attacking_half_%": "Faltas no campo de ataque (%)",
  defensive_intensity: "Intensidade defensiva",
  avg_time_to_defensive_action: "Tempo médio ação defensiva (s)",
  "counter_press_Success_Rate_%": "Sucesso da pressão pós perda (5s) (%)",
  transition_vulnerability_index: "Índice de Vulnerabilidade na Transição",
  opposition_final_third_entries_10s: "Entradas do adversário no último terço em 10s",
  opposition_box_entries_10s: "Entradas do adversário na área em 10s",
  time_to_progression_seconds: "Tempo para progressão (s)",
  first_pass_forward_pct: "Primeiro passe à frente (%)",
  final_third_entries_10s_pct: "Entradas no último terço em 10s",
  box_entries_10s_pct: "Entradas na área em 10s",
  retained_possessions_5s_pct: "Posse mantida em 5s (%)",
  "long_ball_%": "Bola longa (%)",
  "buildup_%": "Buildup do goleiro (%)",
  "progressive_passes_%": "Passes progressivos do terço médio (%)",
  crosses_per_final_third_entry: "Entradas no último terço por Cruzamentos (%)",
  dribbles_per_final_third_entry: "Entradas no último terço por Dribles (%)",
  box_entries_from_crosses: "Entradas na área por Cruzamentos (%)",
  box_entries_from_carries: "Entradas na área por Conduções (%)",
  sustained_attacks: "Finalizações em ataque sustentado (%)",
  direct_attack: "Finalizações em ataque direto (%)",
  shots_per_final_third_pass: "Finalizações por passe no último terço (%)",
  shots_outside_box: "Finalizações de fora da área (%)",
};

export interface PlayStyleRow {
  game_id: number;
  team_id: number;
  team_name: string;
  rodada: number;
  place: "Casa" | "Fora";
  metrics: Record<string, number>; // keyed by Portuguese Métrica label
}

export function parsePlayStyleMetrics(csv: string): PlayStyleRow[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  const out: PlayStyleRow[] = [];
  for (const r of parsed.data) {
    const game_id = num(r["game_id"]);
    const team_id = num(r["team_id"]);
    const team_name = (r["team_name"] ?? "").trim();
    if (!game_id || !team_id || !team_name) continue;
    const metrics: Record<string, number> = {};
    for (const [en, pt] of Object.entries(STYLE_EN_TO_PT)) {
      const raw = r[en];
      if (raw === undefined || raw === null || raw === "") continue;
      const n = typeof raw === "number" ? raw : parseFloat(raw);
      if (Number.isFinite(n)) metrics[pt] = n;
    }
    out.push({
      game_id,
      team_id,
      team_name,
      rodada: num(r["round"]),
      place: (r["place"] as "Casa" | "Fora") ?? "Casa",
      metrics,
    });
  }
  return out;
}

export function parsePlayStyleCatalog(csv: string): StyleCatalogEntry[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  const out: StyleCatalogEntry[] = [];
  for (const r of parsed.data) {
    const estilo = (r["estilo de jogo"] ?? "").trim();
    const definicao = (r["definição"] ?? "").trim();
    if (!estilo) continue;
    out.push({ estilo, definicao });
  }
  return out;
}

// Same shape / logic as parseContextMetrics but does NOT restrict to the
// performance-quality labels. All Atributo values present in the CSV are kept,
// and metrics are optionally filtered against a header set.
export function parseContextStyleMetrics(
  csv: string,
  headers?: Set<string>,
  onSkip?: (atributo: string, metric: string) => void,
): {
  metricsByAtributo: Record<string, Array<{ metric: string; definition: string }>>;
  atributoDefinitions: Record<string, string>;
} {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  const metricsByAtributo: Record<
    string,
    Array<{ metric: string; definition: string }>
  > = {};
  const atributoDefinitions: Record<string, string> = {};
  // First pass: discover Atributo keys in order of first appearance.
  const order: string[] = [];
  for (const row of parsed.data) {
    const atributo = (row["Atributo"] ?? "").trim();
    if (!atributo) continue;
    if (!(atributo in metricsByAtributo)) {
      metricsByAtributo[atributo] = [];
      order.push(atributo);
    }
  }
  for (const row of parsed.data) {
    const atributo = (row["Atributo"] ?? "").trim();
    const metric = (row["Métrica"] ?? "").trim();
    const definition = (row["Definição"] ?? "").trim();
    if (!atributo) continue;
    if (!metric) {
      atributoDefinitions[atributo] = definition;
      continue;
    }
    if (headers && !headers.has(metric)) {
      onSkip?.(atributo, metric);
      continue;
    }
    metricsByAtributo[atributo].push({ metric, definition });
  }
  // Drop atributos that ended up empty after filtering.
  for (const a of order) {
    if (metricsByAtributo[a].length === 0) {
      delete metricsByAtributo[a];
    }
  }
  return { metricsByAtributo, atributoDefinitions };
}

/**
 * For each club and each place ∈ {Casa, Fora}: take the 5 most recent rows
 * (by rodada desc), compute the mean of each metric across those games
 * (ignoring missing / non-finite values). Metrics are emitted in the order
 * given by `metricNames`. Clubs with zero games in a modality get `null` for
 * that place.
 */
export function computeStyleInputs(
  rows: PlayStyleRow[],
  metricNames: string[],
): StyleInputsMap {
  const byCsv = new Map<string, PlayStyleRow[]>();
  for (const r of rows) {
    const arr = byCsv.get(r.team_name) ?? [];
    arr.push(r);
    byCsv.set(r.team_name, arr);
  }

  function pick(games: PlayStyleRow[], place: "Casa" | "Fora"): StyleLocalInputs | null {
    const picked = games
      .filter((g) => g.place === place)
      .sort((a, b) => b.rodada - a.rodada)
      .slice(0, 5);
    if (picked.length === 0) return null;
    const metrics: StyleMetricValue[] = [];
    for (const label of metricNames) {
      let sum = 0;
      let n = 0;
      for (const g of picked) {
        const v = g.metrics[label];
        if (typeof v === "number" && Number.isFinite(v)) {
          sum += v;
          n += 1;
        }
      }
      if (n === 0) continue;
      metrics.push({ label, value: sum / n });
    }
    return { jogos: picked.length, metrics };
  }

  const out: StyleInputsMap = {};
  for (const [csvName, games] of byCsv) {
    const club = byCsvName(csvName);
    if (!club) continue;
    out[club.slug] = { casa: pick(games, "Casa"), fora: pick(games, "Fora") };
  }
  return out;
}

/**
 * For each metric, for each place, build an array of {slug, displayName,
 * value} across the 20 manifest-matched clubs — value is the 5-game mean in
 * that modality. Clubs with no games in a modality are omitted from that
 * array.
 */
export function computeStyleDistribution(
  rows: PlayStyleRow[],
  metricNames: string[],
): StyleDistributionMap {
  const byCsv = new Map<string, PlayStyleRow[]>();
  for (const r of rows) {
    const arr = byCsv.get(r.team_name) ?? [];
    arr.push(r);
    byCsv.set(r.team_name, arr);
  }

  const out: StyleDistributionMap = {};
  for (const label of metricNames) {
    out[label] = { casa: [], fora: [] };
  }

  for (const [csvName, games] of byCsv) {
    const club = byCsvName(csvName);
    if (!club) continue;
    for (const place of ["Casa", "Fora"] as const) {
      const picked = games
        .filter((g) => g.place === place)
        .sort((a, b) => b.rodada - a.rodada)
        .slice(0, 5);
      if (picked.length === 0) continue;
      for (const label of metricNames) {
        let sum = 0;
        let n = 0;
        for (const g of picked) {
          const v = g.metrics[label];
          if (typeof v === "number" && Number.isFinite(v)) {
            sum += v;
            n += 1;
          }
        }
        if (n === 0) continue;
        const key = place === "Casa" ? "casa" : "fora";
        out[label][key].push({
          slug: club.slug,
          displayName: club.displayName,
          value: sum / n,
        });
      }
    }
  }
  return out;
}

function run() {
  mkdirSync(OUT_DIR, { recursive: true });
  const perfCsv = readFileSync(path.join(DATA_IN, "performance_team.csv"), "utf8");
  const perf = parsePerformanceTeam(perfCsv);

  // Join raw (non-Z-scored) metric values from performance_metrics.csv
  const rawCsv = readFileSync(path.join(DATA_IN, "performance_metrics.csv"), "utf8");
  const rawByGame = parsePerformanceMetrics(rawCsv);
  let rawHits = 0;
  for (const row of perf) {
    const key = `${row.game_id}:${row.team_id}`;
    const raw = rawByGame.get(key);
    if (raw) {
      row.rawMetrics = raw;
      rawHits += 1;
    }
  }

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

  // Bloco 2 — round-scoped Z-scores. Same schema as performance_team.csv but
  // Z-scores are normalized within each rodada across all 20 team-rows.
  // Raw metric values are facts about the match and are the same regardless of
  // which normalization was applied, so we reuse the same rawByGame map.
  const roundCsv = readFileSync(path.join(DATA_IN, "performance_round.csv"), "utf8");
  const perfRound = parsePerformanceRound(roundCsv);
  let roundRawHits = 0;
  for (const row of perfRound) {
    const key = `${row.game_id}:${row.team_id}`;
    const raw = rawByGame.get(key);
    if (raw) {
      row.rawMetrics = raw;
      roundRawHits += 1;
    }
  }

  // Bloco 3 — 5-game moving averages per team, computed from round-scoped Z-scores.
  const movingAvg = computeMovingAverages(perfRound);

  // Bloco 4 — 5-game moving averages for the 2025 season. Same schema as
  // the 2026 file (performance-moving-avg.json) so Bloco 4 can join both
  // datasets by CSV club name. Note: the 2025 roster differs from 2026 —
  // promoted clubs (in 2026 but not 2025) will have no team-series here,
  // and relegated clubs (in 2025 but not 2026) will be present but have
  // slug === null since they're absent from the Club manifest.
  const round2025Csv = readFileSync(path.join(DATA_IN, "performance_round_2025.csv"), "utf8");
  const perfRound2025 = parsePerformanceRound(round2025Csv);
  // No raw-metrics join for 2025: performance_metrics.csv is 2026-only.
  const movingAvg2025 = computeMovingAverages(perfRound2025);

  // Bloco 5 — last-5-games inputs per (club, place) for the LLM analysis.
  const llmInputs = computeLlmInputs(perfRound, metricsByQuality);
  let llmEmitted = 0;
  for (const inputs of Object.values(llmInputs)) {
    if (inputs.casa) llmEmitted += 1;
    if (inputs.fora) llmEmitted += 1;
  }

  // Estilo — style inputs + distribution + metrics map + catalog
  const playStyleCsv = readFileSync(path.join(DATA_IN, "play_style_metrics.csv"), "utf8");
  const styleRows = parsePlayStyleMetrics(playStyleCsv);
  const styleHeaders = new Set<string>(Object.values(STYLE_EN_TO_PT));
  const styleContextCsv = readFileSync(path.join(DATA_IN, "context_style.csv"), "utf8");
  const styleSkipped: Array<{ atributo: string; metric: string }> = [];
  const { metricsByAtributo } = parseContextStyleMetrics(
    styleContextCsv,
    styleHeaders,
    (a, m) => styleSkipped.push({ atributo: a, metric: m }),
  );
  // Flatten in atributo order — this is the canonical metric sequence used by
  // both the inputs JSON and the distribution JSON.
  const styleMetricNames: string[] = [];
  for (const [, ms] of Object.entries(metricsByAtributo)) {
    for (const m of ms) styleMetricNames.push(m.metric);
  }
  const styleInputs = computeStyleInputs(styleRows, styleMetricNames);
  const styleDistribution = computeStyleDistribution(styleRows, styleMetricNames);
  const styleCatalogCsv = readFileSync(path.join(DATA_IN, "play_style2.csv"), "utf8");
  const styleCatalog = parsePlayStyleCatalog(styleCatalogCsv);

  let styleCombos = 0;
  for (const inputs of Object.values(styleInputs)) {
    if (inputs.casa) styleCombos += 1;
    if (inputs.fora) styleCombos += 1;
  }

  writeFileSync(path.join(OUT_DIR, "style-inputs.json"), JSON.stringify(styleInputs, null, 2));
  writeFileSync(
    path.join(OUT_DIR, "style-distribution.json"),
    JSON.stringify(styleDistribution),
  );
  writeFileSync(
    path.join(OUT_DIR, "style-metrics-map.json"),
    JSON.stringify(metricsByAtributo, null, 2),
  );
  writeFileSync(path.join(OUT_DIR, "style-catalog.json"), JSON.stringify(styleCatalog, null, 2));

  console.log(
    `style-inputs: ${Object.keys(styleInputs).length} clubs, ${styleCombos} combos`,
  );
  console.log(
    `style-distribution: ${Object.keys(styleDistribution).length} metrics, style-catalog: ${styleCatalog.length} styles`,
  );
  if (styleSkipped.length > 0) {
    console.log(
      `skipped ${styleSkipped.length} context_style.csv metric(s) not present in play_style_metrics.csv:`,
    );
    for (const { atributo, metric } of styleSkipped) {
      console.log(`  - [${atributo}] ${metric}`);
    }
  }

  writeFileSync(path.join(OUT_DIR, "performance-team.json"), JSON.stringify(perf));
  writeFileSync(path.join(OUT_DIR, "performance-round.json"), JSON.stringify(perfRound));
  writeFileSync(
    path.join(OUT_DIR, "performance-llm-inputs.json"),
    JSON.stringify(llmInputs, null, 2),
  );
  writeFileSync(path.join(OUT_DIR, "performance-moving-avg.json"), JSON.stringify(movingAvg));
  writeFileSync(
    path.join(OUT_DIR, "performance-moving-avg-2025.json"),
    JSON.stringify(movingAvg2025),
  );
  writeFileSync(path.join(OUT_DIR, "standings.json"), JSON.stringify(standings, null, 2));
  writeFileSync(path.join(OUT_DIR, "dashboard.json"), JSON.stringify(dashboard, null, 2));
  writeFileSync(
    path.join(OUT_DIR, "quality-metrics.json"),
    JSON.stringify(metricsByQuality, null, 2),
  );

  console.log(
    `compiled ${perf.length} performance rows (${rawHits} with raw metrics), ${standings.length} standings rows, dashboard rodada=${dashboard.rodada}`,
  );
  console.log(
    `compiled ${perfRound.length} round-scoped performance rows (${roundRawHits} with raw metrics)`,
  );
  console.log(
    `compiled moving-avg 2026: ${movingAvg.teams.length} team-series, maxRodada=${movingAvg.maxRodada}, minRodadaWithMA=${movingAvg.minRodadaWithMA}`,
  );
  console.log(
    `compiled moving-avg 2025: ${movingAvg2025.teams.length} team-series, maxRodada=${movingAvg2025.maxRodada}, minRodadaWithMA=${movingAvg2025.minRodadaWithMA} (from ${perfRound2025.length} rows)`,
  );
  const summary = Object.entries(metricsByQuality)
    .map(([q, ms]) => `${q}=${ms.length}`)
    .join(", ");
  console.log(`quality-metrics: ${summary}`);
  console.log(
    `compiled LLM inputs: ${Object.keys(llmInputs).length} clubs, ${llmEmitted} (slug, place) combos emitted`,
  );
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
