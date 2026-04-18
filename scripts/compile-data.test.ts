import { describe, it, expect } from "vitest";
import { computeStandings, parsePerformanceTeam } from "./compile-data";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixturePath = path.join(process.cwd(), "public/data/performance_team.csv");

describe("compile-data", () => {
  it("parsePerformanceTeam returns one row per (game_id, team_id) with 20 distinct clubs", () => {
    const csv = readFileSync(fixturePath, "utf8");
    const rows = parsePerformanceTeam(csv);
    expect(rows.length).toBeGreaterThan(0);
    const clubs = new Set(rows.map((r) => r.clube));
    expect(clubs.size).toBe(20);
  });

  it("computeStandings derives 20 rows, sorted by points desc then saldo desc", () => {
    const csv = readFileSync(fixturePath, "utf8");
    const rows = parsePerformanceTeam(csv);
    const table = computeStandings(rows);
    expect(table.length).toBe(20);
    for (let i = 1; i < table.length; i++) {
      const a = table[i - 1];
      const b = table[i];
      const pointsOrdered = a.pontos > b.pontos || (a.pontos === b.pontos && a.saldo >= b.saldo);
      expect(pointsOrdered).toBe(true);
    }
  });
});
