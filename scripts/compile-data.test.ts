import { describe, it, expect } from "vitest";
import {
  computeLlmInputs,
  computeStandings,
  computeStyleDistribution,
  computeStyleInputs,
  parseContextMetrics,
  parseContextStyleMetrics,
  parsePerformanceRound,
  parsePerformanceTeam,
  parsePlayStyleMetrics,
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

describe("computeStyleInputs", () => {
  it("emits 20 clubs × 2 locals, each local with up to 26 style metrics", () => {
    const playStylePath = path.join(process.cwd(), "public/data/play_style_metrics.csv");
    const styleCtxPath = path.join(process.cwd(), "public/data/context_style.csv");
    const playStyleCsv = readFileSync(playStylePath, "utf8");
    const styleCtxCsv = readFileSync(styleCtxPath, "utf8");
    const rows = parsePlayStyleMetrics(playStyleCsv);
    // Build metric-name list from the Portuguese labels that appear in the rows.
    const metricSet = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r.metrics)) metricSet.add(k);
    const metricNames = [...metricSet];
    expect(metricNames.length).toBe(26);

    const { metricsByAtributo } = parseContextStyleMetrics(styleCtxCsv, metricSet);
    const flatFromContext: string[] = [];
    for (const [, ms] of Object.entries(metricsByAtributo)) {
      for (const m of ms) flatFromContext.push(m.metric);
    }
    // context_style should cover every CSV metric.
    expect(flatFromContext.length).toBe(26);

    const inputs = computeStyleInputs(rows, flatFromContext);
    expect(Object.keys(inputs).length).toBe(20);

    for (const slug of Object.keys(inputs)) {
      for (const place of ["casa", "fora"] as const) {
        const li = inputs[slug][place];
        if (!li) continue;
        expect(li.jogos).toBeGreaterThan(0);
        expect(li.jogos).toBeLessThanOrEqual(5);
        expect(li.metrics.length).toBeLessThanOrEqual(26);
        for (const m of li.metrics) {
          expect(Number.isFinite(m.value)).toBe(true);
        }
      }
    }

    // Spot-check a known club (Flamengo) — must have both locals with 26 metrics.
    const fla = inputs["flamengo"];
    expect(fla).toBeDefined();
    expect(fla.casa?.metrics.length ?? 0).toBe(26);
    expect(fla.fora?.metrics.length ?? 0).toBe(26);
  });

  it("emits melhores[8] + piores[8] per club/local with z + rank", () => {
    const playStylePath = path.join(process.cwd(), "public/data/play_style_metrics.csv");
    const styleCtxPath = path.join(process.cwd(), "public/data/context_style.csv");
    const playStyleCsv = readFileSync(playStylePath, "utf8");
    const styleCtxCsv = readFileSync(styleCtxPath, "utf8");
    const rows = parsePlayStyleMetrics(playStyleCsv);
    const metricSet = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r.metrics)) metricSet.add(k);
    const { metricsByAtributo } = parseContextStyleMetrics(styleCtxCsv, metricSet);
    const flat: string[] = [];
    for (const [, ms] of Object.entries(metricsByAtributo)) for (const m of ms) flat.push(m.metric);
    const inputs = computeStyleInputs(rows, flat);
    const fla = inputs["flamengo"];
    expect(fla.casa?.melhores.length).toBe(8);
    expect(fla.casa?.piores.length).toBe(8);
    expect(fla.fora?.melhores.length).toBe(8);
    expect(fla.fora?.piores.length).toBe(8);
    const mel = fla.casa!.melhores;
    for (let i = 1; i < mel.length; i++) {
      expect(mel[i - 1].z).toBeGreaterThanOrEqual(mel[i].z);
    }
    const pio = fla.casa!.piores;
    for (let i = 1; i < pio.length; i++) {
      expect(pio[i - 1].z).toBeLessThanOrEqual(pio[i].z);
    }
    for (const h of [...mel, ...pio]) {
      expect(h.rank).toBeGreaterThanOrEqual(1);
      expect(h.rank).toBeLessThanOrEqual(20);
      expect(Number.isFinite(h.z)).toBe(true);
    }
  });

  it("computeStyleDistribution emits 26 metrics each with casa + fora arrays", () => {
    const playStyleCsv = readFileSync(
      path.join(process.cwd(), "public/data/play_style_metrics.csv"),
      "utf8",
    );
    const rows = parsePlayStyleMetrics(playStyleCsv);
    const metricSet = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r.metrics)) metricSet.add(k);
    const metricNames = [...metricSet];
    const dist = computeStyleDistribution(rows, metricNames);
    expect(Object.keys(dist).length).toBe(26);
    for (const label of metricNames) {
      expect(Array.isArray(dist[label].casa)).toBe(true);
      expect(Array.isArray(dist[label].fora)).toBe(true);
      // Each array has at most 20 entries (one per manifest club).
      expect(dist[label].casa.length).toBeLessThanOrEqual(20);
      expect(dist[label].fora.length).toBeLessThanOrEqual(20);
    }
  });

});
