// src/types/data.ts
export interface PerformanceTeamRow {
  temporada: number;
  rodada: number;
  game_id: number;
  data: string;
  partida: string;
  team_id: number;
  clube: string;
  place: "Casa" | "Fora";
  possession: number;
  opponent_possession: number;
  gols_marcados: number;
  gols_sofridos: number;
  diferenca_gols: number;
  // Qualidades (Z-score)
  q_defesa: number;
  q_trans_defensiva: number;
  q_trans_ofensiva: number;
  q_ataque: number;
  q_criacao_de_chances: number;
  // xG / xT
  xg_total: number;
  xg_sem_pen: number;
  xt: number;
  // All remaining performance-team.csv columns, Z-scored, keyed by raw CSV column name.
  metrics: Record<string, number>;
  // Raw (non-Z-scored) values for the same metrics, joined from performance_metrics.csv.
  // Keyed by the SAME Portuguese metric names used in `metrics`. Missing entries mean
  // no raw column could be mapped for that metric.
  rawMetrics: Record<string, number>;
}

export interface QualityMetric {
  metric: string; // exact name, e.g., "PPDA"
  definition: string;
}

// Keys are the Portuguese quality labels exactly as in context.csv:
// "Defesa" | "Transição defensiva" | "Transição ofensiva" | "Ataque" | "Criação de chances"
export type QualityMetricsMap = Record<string, QualityMetric[]>;

export interface StandingsRow {
  team_id: number;
  clube: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo: number;
  pontos: number;
  posicao: number;
  forma_z_media_ultimos_5: number;
}

export interface HighlightCard {
  kind: "defesa" | "ataque" | "queda" | "surpresa";
  icon: string;
  title: string;
  club_slug: string;
  metric_label: string;
  deep_link: string;
}

export type QualitySlug =
  | "trans_defensiva"
  | "trans_ofensiva"
  | "ataque"
  | "criacao_de_chances";

export interface QualityLeader {
  quality: QualitySlug;
  label: string;           // e.g., "Melhor transição defensiva"
  clube: string;           // CSV name
  displayName: string;     // manifest displayName (fallback to clube)
  slug: string | null;     // manifest slug (null if unmapped)
  z: number;               // Z-score
}

export interface Dashboard {
  rodada: number;
  leaders: QualityLeader[];
}

// Bloco 3 — moving averages (5-game) per team. Arrays are indexed by
// `rodada - 1`. A null entry means the MA was not computable (typically
// rodada < 5, or the team had fewer than 5 games up to that rodada).
export interface MovingAvgTeamSeries {
  slug: string | null;                              // manifest slug; null if unmapped
  displayName: string;
  clube: string;                                    // CSV name
  qualities: Record<string, Array<number | null>>;  // keys: q_defesa, q_trans_defensiva, ...
  metricsZ: Record<string, Array<number | null>>;   // per-metric Z-scores, same indexing
  metricsRaw: Record<string, Array<number | null>>; // per-metric raw values, same indexing
}

export interface MovingAvgDataset {
  maxRodada: number;
  minRodadaWithMA: number; // lowest rodada index with at least one defined MA (expected 5)
  teams: MovingAvgTeamSeries[];
}

// Bloco 5 — inputs submitted to the LLM for the "Análise de Desempenho" narrative.
// For each club and each place (Casa/Fora), we precompute the sorted lists of
// attributes and metric highlights based on the last 5 games in that modality.
// Null when the club has zero games in that modality.
export interface LlmStat {
  label: string;
  z: number;
}

export interface LlmLocalInputs {
  jogos: number;
  attributes: LlmStat[];
  melhores: LlmStat[];
  piores: LlmStat[];
}

export interface LlmInputs {
  casa: LlmLocalInputs | null;
  fora: LlmLocalInputs | null;
}

export type LlmInputsMap = Record<string, LlmInputs>;

// Estilo — style-analysis inputs per (club, place).
export interface StyleMetricValue {
  label: string;
  value: number;
}

export interface StyleHighlight {
  label: string;
  value: number;
  z: number;
  rank: number;
}

export interface StyleLocalInputs {
  jogos: number;
  metrics: StyleMetricValue[];
  melhores: StyleHighlight[];
  piores: StyleHighlight[];
}

export interface StyleInputs {
  casa: StyleLocalInputs | null;
  fora: StyleLocalInputs | null;
}

export type StyleInputsMap = Record<string, StyleInputs>;

export interface StyleDistributionEntry {
  slug: string;
  displayName: string;
  value: number;
}

export type StyleDistributionMap = Record<
  string,
  { casa: StyleDistributionEntry[]; fora: StyleDistributionEntry[] }
>;

