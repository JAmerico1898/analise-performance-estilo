import { describe, it, expect } from "vitest";
import {
  computeLlmInputs,
  computeStandings,
  parseContextMetrics,
  parsePerformanceRound,
  parsePerformanceTeam,
} from "./compile-data";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixturePath = path.join(process.cwd(), "public/data/performance_team.csv");
const contextPath = path.join(process.cwd(), "public/data/context.csv");
const roundPath = path.join(process.cwd(), "public/data/performance_round.csv");

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

describe("parsePerformanceRound", () => {
  it("exists and returns rows from performance_round.csv", () => {
    expect(typeof parsePerformanceRound).toBe("function");
    const csv = readFileSync(roundPath, "utf8");
    const rows = parsePerformanceRound(csv);
    expect(rows.length).toBeGreaterThan(0);
    // Same structural schema as performance_team rows.
    const first = rows[0];
    expect(typeof first.rodada).toBe("number");
    expect(typeof first.game_id).toBe("number");
    expect(typeof first.clube).toBe("string");
  });
});

describe("computeLlmInputs", () => {
  it("produces attributes (5 sorted desc) and melhores/piores (6 each) for every mapped club with games", () => {
    const roundCsv = readFileSync(roundPath, "utf8");
    const contextCsv = readFileSync(contextPath, "utf8");
    const perfCsv = readFileSync(fixturePath, "utf8");
    const rows = parsePerformanceRound(roundCsv);
    const perfHeaders = new Set(Object.keys(parsePerformanceTeam(perfCsv)[0].metrics));
    const { metricsByQuality } = parseContextMetrics(contextCsv, perfHeaders);

    const inputs = computeLlmInputs(rows, metricsByQuality);
    const slugs = Object.keys(inputs);
    expect(slugs.length).toBeGreaterThan(0);

    for (const slug of slugs) {
      for (const place of ["casa", "fora"] as const) {
        const li = inputs[slug][place];
        if (!li) continue;
        expect(li.attributes.length).toBe(5);
        // sorted desc by z
        for (let i = 1; i < li.attributes.length; i++) {
          expect(li.attributes[i - 1].z).toBeGreaterThanOrEqual(li.attributes[i].z);
        }
        expect(li.melhores.length).toBe(6);
        expect(li.piores.length).toBe(6);
        // melhores sorted desc, piores sorted asc
        for (let i = 1; i < li.melhores.length; i++) {
          expect(li.melhores[i - 1].z).toBeGreaterThanOrEqual(li.melhores[i].z);
        }
        for (let i = 1; i < li.piores.length; i++) {
          expect(li.piores[i - 1].z).toBeLessThanOrEqual(li.piores[i].z);
        }
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
