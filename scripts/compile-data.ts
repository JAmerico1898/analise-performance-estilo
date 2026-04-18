import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import type { PerformanceTeamRow, StandingsRow } from "../src/types/data";

const DATA_IN = path.join(process.cwd(), "public/data");
const OUT_DIR = path.join(process.cwd(), "src/data/compiled");

function num(v: string | number | undefined): number {
  if (v === undefined || v === "" || v === null) return 0;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function parsePerformanceTeam(csv: string): PerformanceTeamRow[] {
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  return parsed.data.map((r) => ({
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
  }));
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

function run() {
  mkdirSync(OUT_DIR, { recursive: true });
  const perfCsv = readFileSync(path.join(DATA_IN, "performance_team.csv"), "utf8");
  const perf = parsePerformanceTeam(perfCsv);
  const standings = computeStandings(perf);
  writeFileSync(path.join(OUT_DIR, "performance-team.json"), JSON.stringify(perf));
  writeFileSync(path.join(OUT_DIR, "standings.json"), JSON.stringify(standings, null, 2));
  console.log(`compiled ${perf.length} performance rows, ${standings.length} standings rows`);
}

// Auto-run when invoked as a script (tsx or node)
if (process.argv[1] && process.argv[1].endsWith("compile-data.ts")) {
  run();
}
