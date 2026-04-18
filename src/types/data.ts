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
}

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
  forma_z_media_ultimos_5: number; // média das 5 qualidades nos últimos 5 jogos
}

export interface HighlightCard {
  kind: "defesa" | "ataque" | "queda" | "surpresa";
  icon: string; // lucide icon name
  title: string;
  club_slug: string;
  metric_label: string; // "PPDA 6.2"
  deep_link: string;   // "/clube/flamengo/performance/bloco-2?rodada=12&qualidade=defesa"
}
