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
