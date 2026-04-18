import { describe, it, expect } from "vitest";
import { computeStandings, parseContextMetrics, parsePerformanceTeam } from "./compile-data";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixturePath = path.join(process.cwd(), "public/data/performance_team.csv");
const contextPath = path.join(process.cwd(), "public/data/context.csv");

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

import { CLUBS, byCsvName } from "../src/lib/clubs";

describe("parseContextMetrics", () => {
  it("returns exactly 5 quality keys with plausible metric counts, all matching CSV columns", () => {
    const contextCsv = readFileSync(contextPath, "utf8");
    const perfCsv = readFileSync(fixturePath, "utf8");
    const perfHeaders = new Set(Object.keys(parsePerformanceTeam(perfCsv)[0].metrics));
    // First, assert the raw parse (without filtering) yields the 5 expected quality labels.
    const { metricsByQuality } = parseContextMetrics(contextCsv);
    const keys = Object.keys(metricsByQuality).sort();
    expect(keys).toEqual(
      [
        "Ataque",
        "Criação de chances",
        "Defesa",
        "Transição defensiva",
        "Transição ofensiva",
      ].sort(),
    );

    // Sanity: Defesa typically has 5–12 component metrics.
    const defesa = metricsByQuality["Defesa"];
    expect(defesa.length).toBeGreaterThanOrEqual(5);
    expect(defesa.length).toBeLessThanOrEqual(12);

    // Every metric listed for Defesa must correspond to a column in performance_team.csv.
    for (const m of defesa) {
      expect(perfHeaders.has(m.metric)).toBe(true);
    }

    // With the filter applied, skipped metrics must not appear.
    const filtered = parseContextMetrics(contextCsv, perfHeaders).metricsByQuality;
    for (const [, metrics] of Object.entries(filtered)) {
      for (const m of metrics) {
        expect(perfHeaders.has(m.metric)).toBe(true);
      }
    }
  });
});

describe("clubs manifest", () => {
  it("every CSV `clube` value maps to a manifest entry", () => {
    const csv = readFileSync(fixturePath, "utf8");
    const rows = parsePerformanceTeam(csv);
    const csvClubs = new Set(rows.map((r) => r.clube));
    const unmapped: string[] = [];
    for (const name of csvClubs) {
      if (!byCsvName(name)) unmapped.push(name);
    }
    expect(unmapped).toEqual([]);
    expect(CLUBS.length).toBe(20);
  });
});
