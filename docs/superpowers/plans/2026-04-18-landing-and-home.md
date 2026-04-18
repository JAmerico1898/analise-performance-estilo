# Landing + Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public-facing shell of laboratorio-match-analysis: a promotional landing page at `/landing` (HyperFrames hero video), a functional Home at `/` (search + curated highlights + 20-club grid with real data for one round), a placeholder club page, a Pushover-backed contact form, and a first Vercel deployment. Big-bang launch; placeholders only where blocks 1–5 and style-analysis live.

**Architecture:** Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui primitives. Dark-first theme following design.md §9 (neon green accent on ink base). CSVs in `/public/data` are precompiled to typed JSON at `prebuild` time — no runtime CSV parsing. Contact form reuses the exact route and component shape from `D:\jose_americo\laboratorio-derivativos`, re-themed to the dark palette. Hero video is a `<video>` element with a static poster image as placeholder until HyperFrames render lands in `/public/videos/hero.mp4`. Deploy on Vercel with `PUSHOVER_TOKEN` / `PUSHOVER_USER` shared with `laboratorio-derivativos`.

**Tech Stack:** Next.js 15 (App Router, TS, Turbopack), Tailwind 4, shadcn/ui, Vega-Lite (loaded lazily; not used in this plan), HyperFrames (video render), Vercel (deploy), Pushover (contact delivery).

**Design reference:** `specs/design.md` sections 1, 2, 3.1, 5, 6, 9, 13, 17, 18.

**Spec corrections captured (from grill-me 2026-04-18):**
- Home `/` has **no round selector** — only a club search. Round-level filters live only inside Bloco 2 (not in scope here).
- Landing lives at `/landing`. `/` is the Home described in design.md §6.
- Loop on hero video is permitted (§9.7 "nada rodando em loop" applies to the analytics app motion, not the marketing page).

---

## File Structure

```
laboratorio-match-analysis/
├── package.json                          (NEW)
├── tsconfig.json                         (NEW — Next.js defaults)
├── next.config.ts                        (NEW)
├── tailwind.config.ts                    (NEW — palette from §9.1)
├── postcss.config.mjs                    (NEW)
├── .env.local.example                    (NEW — PUSHOVER_TOKEN, PUSHOVER_USER)
├── .gitignore                            (NEW)
├── vercel.json                           (NEW — optional; clean URLs defaults)
├── scripts/
│   └── compile-data.ts                   (NEW — CSV → JSON precompile)
├── src/
│   ├── app/
│   │   ├── layout.tsx                    (NEW — root layout, fonts, theme)
│   │   ├── globals.css                   (NEW — CSS vars from §9.1, tailwind base)
│   │   ├── page.tsx                      (NEW — Home / at "/")
│   │   ├── landing/
│   │   │   └── page.tsx                  (NEW — /landing)
│   │   ├── clube/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              (NEW — placeholder club page)
│   │   ├── contato/
│   │   │   └── page.tsx                  (NEW — /contato page)
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts              (NEW — Pushover bridge)
│   ├── components/
│   │   ├── site/
│   │   │   ├── top-bar.tsx               (NEW — global top bar, §5.1)
│   │   │   ├── footer.tsx                (NEW — §17.1)
│   │   │   └── contact-form.tsx          (NEW — adapted from laboratorio-derivativos)
│   │   ├── landing/
│   │   │   ├── hero.tsx                  (NEW — video + overlay)
│   │   │   ├── what-you-find.tsx         (NEW — "O que você vai encontrar")
│   │   │   ├── who-analyzes.tsx          (NEW — "Quem analisa")
│   │   │   └── how-to-use.tsx            (NEW — 3 jornadas)
│   │   ├── home/
│   │   │   ├── club-search.tsx           (NEW — autocomplete club-only)
│   │   │   ├── highlights.tsx            (NEW — 4 destaques)
│   │   │   ├── club-grid.tsx             (NEW — grade 4x5)
│   │   │   └── club-card.tsx             (NEW — card de clube §6.2)
│   │   └── ui/                           (NEW — shadcn primitives as added)
│   ├── lib/
│   │   ├── clubs.ts                      (NEW — club manifest §18.3)
│   │   ├── format.ts                     (NEW — number / z-score helpers)
│   │   └── strings.ts                    (NEW — pt-BR copy / microtexts)
│   ├── data/
│   │   └── compiled/                     (GENERATED — gitignored output of compile-data)
│   │       ├── standings.json
│   │       ├── clubs.json
│   │       ├── performance-team.json
│   │       └── highlights.json           (hand-curated for the active round)
│   └── types/
│       └── data.ts                       (NEW — shared TS types for compiled JSON)
├── public/
│   ├── data/                             (EXISTS — 8 CSVs)
│   ├── clubs/                            (EXISTS — 21 badges)
│   ├── clubs_backdrop/                   (EXISTS — 24 backdrops)
│   └── videos/
│       ├── hero.mp4                      (NEW in Phase 9 — HyperFrames render output)
│       └── hero-poster.jpg               (NEW in Phase 4 — static placeholder frame)
├── hyperframes/
│   └── hero/
│       ├── index.html                    (NEW — HyperFrames composition)
│       └── hyperframes.json              (NEW — project manifest)
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-04-18-landing-and-home.md    (THIS FILE)
```

**Out of scope for this plan (tracked elsewhere):**
- Blocos 1–5 (`/clube/:slug/performance/*`)
- Análise de Estilo Casa/Fora (`/clube/:slug/estilo/*`)
- Glossário (`/glossario`), Sobre (`/sobre`)
- LLM routes (`/api/llm/*`)
- Round selector (lives only inside Bloco 2)
- Mobile bottom nav and sidebar nav of club pages (appear only on `/clube/:slug/*`)

---

## Phase 1 — Scaffold Next.js + Tailwind + theme

### Task 1.1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [ ] **Step 1.1.1: Scaffold with `create-next-app`**

Run from repo root:

```bash
npx --yes create-next-app@latest . --ts --tailwind --app --src-dir --turbopack --eslint --import-alias "@/*" --no-git
```

When prompted to overwrite existing files, keep existing `specs/`, `public/`, `docs/`, `prompts/`. The scaffold adds `src/app/`, `package.json`, configs, and `public/next.svg` etc. It will not touch `specs/` / `docs/` / `prompts/`.

- [ ] **Step 1.1.2: Remove scaffold noise**

Delete the default landing assets:

```bash
rm -f public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
```

- [ ] **Step 1.1.3: Confirm dev server boots**

```bash
npm run dev
```

Expected: server on `http://localhost:3000` renders the default Next.js home page. Stop with Ctrl+C.

- [ ] **Step 1.1.4: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold next.js 15 app router + tailwind + ts"
```

### Task 1.2: Set up design.md §9.1 palette in Tailwind

**Files:**
- Modify: `src/app/globals.css`
- Create: `tailwind.config.ts` (if not created by scaffold)

- [ ] **Step 1.2.1: Replace `globals.css` with the palette**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0a0c0f;
  --color-graphite: #12161c;
  --color-steel: #1e2530;
  --color-mist: #8a9bb0;
  --color-snow: #e8edf3;
  --color-neon: #b8ff57;

  --color-q-defesa: #57c8ff;
  --color-q-trans-def: #7d8bff;
  --color-q-trans-of: #f5a623;
  --color-q-ataque: #b8ff57;
  --color-q-criacao: #ff7ad9;

  --color-success: #4ade80;
  --color-warning: #f5a623;
  --color-danger: #e63946;

  --font-display: "Barlow Condensed", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Fraunces", ui-serif, Georgia, serif;
  --font-mono: "DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

:root {
  color-scheme: dark;
}

html, body {
  background: var(--color-ink);
  color: var(--color-snow);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 1.2.2: Load Google Fonts in the root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Barlow_Condensed, Fraunces, DM_Mono, Inter } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-display" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-serif" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Brasileirão Série A · Análise de Clubes",
  description: "Análise honesta, editorial e direta do Brasileirão Série A 2026. Por José Américo Antunes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${fraunces.variable} ${dmMono.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 1.2.3: Reset `src/app/page.tsx` to a single-line sentinel**

```tsx
export default function RootRedirect() {
  return <div className="p-8 text-snow">Home em construção — ver Phase 6.</div>;
}
```

- [ ] **Step 1.2.4: Verify dev boots with new theme**

```bash
npm run dev
```

Expected: page renders on ink background with snow-white sentinel text using Inter.

- [ ] **Step 1.2.5: Commit**

```bash
git add .
git commit -m "feat(theme): palette + fonts from design.md §9.1–9.2"
```

### Task 1.3: Install shadcn/ui base primitives

**Files:**
- Create: `components.json`, `src/components/ui/*` (generated)

- [ ] **Step 1.3.1: Run shadcn init**

```bash
npx --yes shadcn@latest init -d --base-color neutral
```

Accept defaults. If it asks for CSS path, use `src/app/globals.css`. If it asks for alias, confirm `@/components`.

- [ ] **Step 1.3.2: Add the primitives we need up-front**

```bash
npx --yes shadcn@latest add button input label textarea dialog sheet
```

- [ ] **Step 1.3.3: Commit**

```bash
git add .
git commit -m "chore(ui): add shadcn/ui primitives (button, input, label, textarea, dialog, sheet)"
```

---

## Phase 2 — Data pipeline (CSV → JSON)

### Task 2.1: Write the types for compiled data

**Files:**
- Create: `src/types/data.ts`

- [ ] **Step 2.1.1: Define the compiled types**

```ts
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
```

- [ ] **Step 2.1.2: Commit**

```bash
git add src/types/data.ts
git commit -m "feat(types): shared types for compiled data"
```

### Task 2.2: Write the compile-data script with a failing test

**Files:**
- Create: `scripts/compile-data.ts`, `scripts/compile-data.test.ts`, add dev deps

- [ ] **Step 2.2.1: Add dev deps**

```bash
npm i -D tsx vitest papaparse @types/papaparse
```

- [ ] **Step 2.2.2: Wire `vitest` and `prebuild` in `package.json`**

Add to `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest",
"compile:data": "tsx scripts/compile-data.ts",
"prebuild": "npm run compile:data",
"predev": "npm run compile:data"
```

- [ ] **Step 2.2.3: Write the failing test**

Create `scripts/compile-data.test.ts`:

```ts
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
```

- [ ] **Step 2.2.4: Run the test — expect fail**

```bash
npm test
```

Expected: fails with "Cannot find module './compile-data'".

- [ ] **Step 2.2.5: Implement `scripts/compile-data.ts`**

```ts
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
```

- [ ] **Step 2.2.6: Run tests — expect pass**

```bash
npm test
```

Expected: both tests pass.

- [ ] **Step 2.2.7: Run the compiler end-to-end**

```bash
npm run compile:data
```

Expected: `src/data/compiled/standings.json` exists with 20 rows.

- [ ] **Step 2.2.8: Gitignore compiled output**

Add to `.gitignore`:

```
src/data/compiled/
```

- [ ] **Step 2.2.9: Commit**

```bash
git add scripts/ src/types/ package.json package-lock.json .gitignore
git commit -m "feat(data): CSV → JSON compile pipeline with standings + form Z-score"
```

### Task 2.3: Build the club manifest

**Files:**
- Create: `src/lib/clubs.ts`

- [ ] **Step 2.3.1: Write the manifest**

Keys are the UTF-8 names as they appear in `performance_team.csv` `clube` column (verified via data pipeline test — if a name in this manifest doesn't appear in the CSV, Task 2.4 fails). Badge paths reference actual files in `public/clubs/`.

```ts
// src/lib/clubs.ts
export interface Club {
  slug: string;
  csvName: string;         // exact match with performance_team.csv `clube`
  displayName: string;
  badge: string;           // URL path starting with /
  backdrop: string | null; // URL path or null
}

export const CLUBS: Club[] = [
  { slug: "atletico-mg",          csvName: "Atletico MG",        displayName: "Atlético MG",          badge: "/clubs/Atlético.png",              backdrop: "/clubs_backdrop/atletico_backdrop.jpg" },
  { slug: "bahia",                csvName: "Bahia",              displayName: "Bahia",                badge: "/clubs/Bahia.png",                  backdrop: "/clubs_backdrop/bahia_backdrop.jpg" },
  { slug: "botafogo",             csvName: "Botafogo",           displayName: "Botafogo",             badge: "/clubs/Botafogo.png",               backdrop: "/clubs_backdrop/botafogo_backdrop.jpg" },
  { slug: "ceara",                csvName: "Ceara",              displayName: "Ceará",                badge: null as unknown as string,           backdrop: "/clubs_backdrop/ceara_backdrop.jpg" },
  { slug: "corinthians",          csvName: "Corinthians",        displayName: "Corinthians",          badge: "/clubs/Corinthians.png",            backdrop: "/clubs_backdrop/corinthians_backdrop.jpg" },
  { slug: "cruzeiro",             csvName: "Cruzeiro",           displayName: "Cruzeiro",             badge: "/clubs/Cruzeiro.png",               backdrop: "/clubs_backdrop/cruzeiro_backdrop.jpg" },
  { slug: "flamengo",             csvName: "Flamengo",           displayName: "Flamengo",             badge: "/clubs/Flamengo.png",               backdrop: "/clubs_backdrop/flamengo_backdrop.jpg" },
  { slug: "fluminense",           csvName: "Fluminense",         displayName: "Fluminense",           badge: "/clubs/Fluminense.png",             backdrop: "/clubs_backdrop/fluminense_backdrop.jpg" },
  { slug: "fortaleza",            csvName: "Fortaleza",          displayName: "Fortaleza",            badge: null as unknown as string,           backdrop: "/clubs_backdrop/fortaleza_backdrop.jpg" },
  { slug: "gremio",               csvName: "Gremio",             displayName: "Grêmio",               badge: "/clubs/Grêmio.png",                 backdrop: "/clubs_backdrop/gremio_backdrop.jpg" },
  { slug: "internacional",        csvName: "Internacional",      displayName: "Internacional",        badge: "/clubs/Internacional.png",          backdrop: "/clubs_backdrop/internacional_backdrop.jpg" },
  { slug: "juventude",            csvName: "Juventude",          displayName: "Juventude",            badge: null as unknown as string,           backdrop: "/clubs_backdrop/juventude_backdrop.jpg" },
  { slug: "mirassol",             csvName: "Mirassol",           displayName: "Mirassol",             badge: "/clubs/Mirassol.png",               backdrop: "/clubs_backdrop/mirassol_backdrop.jpg" },
  { slug: "palmeiras",            csvName: "Palmeiras",          displayName: "Palmeiras",            badge: "/clubs/Palmeiras.png",              backdrop: "/clubs_backdrop/palmeiras_backdrop.jpg" },
  { slug: "red-bull-bragantino",  csvName: "Red Bull Bragantino",displayName: "RB Bragantino",        badge: "/clubs/Red Bull Bragantino.png",    backdrop: "/clubs_backdrop/red_bull_bragantino_backdrop.jpg" },
  { slug: "santos",               csvName: "Santos",             displayName: "Santos",               badge: "/clubs/Santos.png",                 backdrop: "/clubs_backdrop/santos_backdrop.jpg" },
  { slug: "sao-paulo",            csvName: "Sao Paulo",          displayName: "São Paulo",            badge: "/clubs/São Paulo.png",              backdrop: "/clubs_backdrop/sao_paulo_backdrop.jpg" },
  { slug: "sport",                csvName: "Sport",              displayName: "Sport",                badge: null as unknown as string,           backdrop: "/clubs_backdrop/sport_backdrop.jpg" },
  { slug: "vasco-da-gama",        csvName: "Vasco",              displayName: "Vasco da Gama",        badge: "/clubs/Vasco.png",                  backdrop: "/clubs_backdrop/vasco_backdrop.jpg" },
  { slug: "vitoria",              csvName: "Vitoria",            displayName: "Vitória",              badge: "/clubs/Vitória.png",                backdrop: "/clubs_backdrop/vitoria_backdrop.jpg" },
];

export function bySlug(slug: string): Club | undefined {
  return CLUBS.find((c) => c.slug === slug);
}
export function byCsvName(name: string): Club | undefined {
  return CLUBS.find((c) => c.csvName === name);
}
```

**Note:** Any club with `badge: null as unknown as string` renders an initials placeholder in `club-card.tsx` (Task 6.4). The four missing badges (Ceará, Fortaleza, Juventude, Sport) are tracked in design.md §18.2.

- [ ] **Step 2.3.2: Commit**

```bash
git add src/lib/clubs.ts
git commit -m "feat(clubs): manifest mapping slug ↔ csvName ↔ badge"
```

### Task 2.4: Validate CSV names match the manifest

**Files:**
- Modify: `scripts/compile-data.test.ts`

- [ ] **Step 2.4.1: Add the validation test**

Append to `scripts/compile-data.test.ts`:

```ts
import { CLUBS, byCsvName } from "../src/lib/clubs";

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
```

- [ ] **Step 2.4.2: Run tests**

```bash
npm test
```

Expected: passes. If it fails, the failing test prints the unmapped names — adjust `csvName` fields in `clubs.ts` accordingly (e.g., accents).

- [ ] **Step 2.4.3: Commit (if changes to clubs.ts were needed)**

```bash
git add -A
git commit -m "test: validate CSV club names against manifest"
```

### Task 2.5: Curated highlights JSON (manual)

**Files:**
- Create: `src/data/highlights.json` (hand-authored, not gitignored — this is content)

- [ ] **Step 2.5.1: Author 4 highlight cards**

Pick 4 real standouts from the latest rodada in the CSVs. The data source for picking is `npm run compile:data`'s log + a quick scan of `standings.json`.

```json
[
  {
    "kind": "defesa",
    "icon": "shield",
    "title": "Melhor defesa da rodada",
    "club_slug": "flamengo",
    "metric_label": "Z-defesa +1.2",
    "deep_link": "/clube/flamengo/performance/bloco-2"
  },
  {
    "kind": "ataque",
    "icon": "zap",
    "title": "Maior xT da rodada",
    "club_slug": "palmeiras",
    "metric_label": "xT +1.0",
    "deep_link": "/clube/palmeiras/performance/bloco-2"
  },
  {
    "kind": "queda",
    "icon": "trending-down",
    "title": "Queda de forma",
    "club_slug": "santos",
    "metric_label": "Z-médio -0.8",
    "deep_link": "/clube/santos/performance/bloco-2"
  },
  {
    "kind": "surpresa",
    "icon": "sparkles",
    "title": "Surpresa da rodada",
    "club_slug": "mirassol",
    "metric_label": "xG +1.1",
    "deep_link": "/clube/mirassol/performance/bloco-2"
  }
]
```

Replace the club slugs and metric labels with the actual top 4 from the data. These are content — the next update cycle rewrites this file.

- [ ] **Step 2.5.2: Commit**

```bash
git add src/data/highlights.json
git commit -m "content: curated highlights for active round"
```

---

## Phase 3 — Layout primitives (Top bar + Footer)

### Task 3.1: Build the global Top bar

**Files:**
- Create: `src/components/site/top-bar.tsx`

- [ ] **Step 3.1.1: Write the top bar**

```tsx
// src/components/site/top-bar.tsx
import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-steel/80 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1280px] items-center gap-6 px-4">
        <Link href="/" className="font-display text-xl font-extrabold tracking-wide text-snow">
          Brasileirão <span className="text-neon">Série A</span> · Análise
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm text-mist">
          <Link href="/" className="hover:text-snow">Home</Link>
          <Link href="/contato" className="hover:text-snow">Contato</Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3.1.2: Commit**

```bash
git add src/components/site/top-bar.tsx
git commit -m "feat(site): top bar"
```

### Task 3.2: Build the global Footer per §17.1

**Files:**
- Create: `src/components/site/footer.tsx`

- [ ] **Step 3.2.1: Write the footer**

```tsx
// src/components/site/footer.tsx
import Link from "next/link";

const VERSION = "v0.1";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-steel/80 bg-graphite">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-display text-xl font-bold text-snow">Brasileirão Série A</p>
          <p className="font-display text-lg text-snow">Análise de Clubes</p>
          <p className="mt-4 text-sm text-mist">
            por <span className="font-semibold text-snow">José Américo Antunes</span>
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mist">Navegação</p>
          <ul className="space-y-2 text-sm text-snow">
            <li><Link href="/" className="hover:text-neon">Home</Link></li>
            <li><Link href="/landing" className="hover:text-neon">Apresentação</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mist">Recursos</p>
          <ul className="space-y-2 text-sm text-snow">
            <li><span className="text-mist">Glossário (em breve)</span></li>
            <li><span className="text-mist">Metodologia (em breve)</span></li>
            <li><span className="text-mist">Sobre (em breve)</span></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mist">Contato</p>
          <p className="text-sm text-snow">Erros, Dúvidas, Sugestões?</p>
          <Link
            href="/contato"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-neon px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Entre em contato →
          </Link>
        </div>
      </div>

      <div className="border-t border-steel/60">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-4 py-4 text-xs text-mist md:flex-row md:justify-between">
          <p>© 2026 José Américo Antunes · Dados: Twelve Football / Opta · {VERSION}</p>
          <p>Temporada 2026 — atualizado semanalmente</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3.2.2: Commit**

```bash
git add src/components/site/footer.tsx
git commit -m "feat(site): global footer per §17.1"
```

---

## Phase 4 — Landing page (`/landing`)

### Task 4.1: Hero with placeholder video

**Files:**
- Create: `src/components/landing/hero.tsx`, `public/videos/hero-poster.jpg` (manually provided — see note), placeholder `public/videos/hero.mp4` (empty file is OK, see note)

- [ ] **Step 4.1.1: Create a static poster image**

If HyperFrames render is not yet available, create a placeholder `public/videos/hero-poster.jpg` by saving a 1920×1080 jpg with a solid `#0a0c0f` fill + the word "Brasileirão" in neon green as a quick asset. Any image editor works. Alternatively, reuse an existing image (e.g., `public/clubs_backdrop/flamengo_backdrop.jpg` for visual placeholder during dev).

If no asset is available yet, the `<video>` falls back to its background color.

- [ ] **Step 4.1.2: Write the hero**

```tsx
// src/components/landing/hero.tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-24 md:pb-32">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-neon">Brasileirão · Série A · 2026</p>
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-snow md:text-[72px]">
          Análise honesta,<br />
          <span className="text-neon">direto da matemática</span> do jogo.
        </h1>
        <p className="mt-6 max-w-xl font-serif text-lg text-mist md:text-xl">
          Defesa, transições, ataque e criação de chances dos 20 clubes da Série A — medidos, contextualizados e explicados em português direto.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-neon px-6 py-3 font-sans text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Explorar análises →
          </Link>
          <a
            href="#como-funciona"
            className="rounded-md border border-mist/50 px-6 py-3 font-sans text-sm font-semibold text-snow hover:border-neon hover:text-neon"
          >
            Como funciona
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.1.3: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat(landing): hero with placeholder video + CTAs"
```

### Task 4.2: "O que você vai encontrar" section

**Files:**
- Create: `src/components/landing/what-you-find.tsx`

- [ ] **Step 4.2.1: Write the section**

```tsx
// src/components/landing/what-you-find.tsx
const ITEMS = [
  {
    quality: "Defesa",
    color: "text-q-defesa",
    text: "Como o time se organiza sem a bola: compactação, altura defensiva, pressão.",
  },
  {
    quality: "Transições",
    color: "text-q-trans-of",
    text: "O que acontece nos 10 segundos após ganhar ou perder a bola.",
  },
  {
    quality: "Ataque",
    color: "text-q-ataque",
    text: "Finalizações, xG, grandes oportunidades. O ataque que mais fabrica chances.",
  },
  {
    quality: "Criação de chances",
    color: "text-q-criacao",
    text: "Passes decisivos, xT (ameaça esperada), toques na área.",
  },
];

export function WhatYouFind() {
  return (
    <section id="como-funciona" className="bg-ink py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">O que você vai encontrar</p>
        <h2 className="max-w-3xl font-display text-4xl font-bold text-snow md:text-5xl">
          Cinco qualidades do jogo, medidas rodada a rodada.
        </h2>
        <p className="mt-4 max-w-2xl font-serif text-lg text-mist">
          Cada jogo do Brasileirão é decomposto em cinco qualidades. Cada qualidade é explicada em métricas comparáveis — com Z-score para você ver o que é normal e o que é desvio.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {ITEMS.map((item) => (
            <div key={item.quality} className="rounded-lg border border-steel bg-graphite p-6">
              <p className={`font-display text-2xl font-bold ${item.color}`}>{item.quality}</p>
              <p className="mt-2 font-serif text-base text-snow">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.2.2: Commit**

```bash
git add src/components/landing/what-you-find.tsx
git commit -m "feat(landing): 'O que você vai encontrar' section"
```

### Task 4.3: "Quem analisa" section

**Files:**
- Create: `src/components/landing/who-analyzes.tsx`

- [ ] **Step 4.3.1: Write the section**

```tsx
// src/components/landing/who-analyzes.tsx
export function WhoAnalyzes() {
  return (
    <section className="bg-graphite py-24">
      <div className="mx-auto max-w-[900px] px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">Quem analisa</p>
        <h2 className="font-display text-4xl font-bold text-snow md:text-5xl">José Américo Antunes</h2>
        <p className="mt-6 font-serif text-lg leading-relaxed text-snow">
          Projeto editorial independente sobre o Brasileirão Série A, baseado em dados oficiais da Opta / Twelve Football. O objetivo é descrever o que acontece em campo sem jargão, sem métrica pela métrica, sem ranking por ranking.
        </p>
        <p className="mt-4 font-serif text-lg leading-relaxed text-mist">
          Cada análise é assinada e responde a uma pergunta concreta: como foi a defesa? o time caiu de rendimento? a surpresa da rodada tem lastro?
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.3.2: Commit**

```bash
git add src/components/landing/who-analyzes.tsx
git commit -m "feat(landing): 'Quem analisa' section"
```

### Task 4.4: "Como usar" with 3 journeys

**Files:**
- Create: `src/components/landing/how-to-use.tsx`

- [ ] **Step 4.4.1: Write the section (journeys from design.md §4)**

```tsx
// src/components/landing/how-to-use.tsx
const JOURNEYS = [
  {
    persona: "Jornalista",
    question: "Como foi o Flamengo contra o Vasco?",
    flow: "Bloco 1 — Clube vs Clube. Comparação direta por qualidade no jogo específico.",
  },
  {
    persona: "Analista",
    question: "Por que o Palmeiras caiu de rendimento?",
    flow: "Bloco 3 — Clube na Competição. Média móvel rodada a rodada, drill-down por métrica.",
  },
  {
    persona: "Torcedor",
    question: "Meu time joga bem ou tá enganando?",
    flow: "Bloco 2 — Clube na Rodada. A última partida em contexto, com análise em texto.",
  },
];

export function HowToUse() {
  return (
    <section className="bg-ink py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">Como usar</p>
        <h2 className="font-display text-4xl font-bold text-snow md:text-5xl">Três jeitos de entrar.</h2>

        <div className="mt-12 space-y-4">
          {JOURNEYS.map((j) => (
            <div key={j.persona} className="rounded-lg border border-steel bg-graphite p-6 md:flex md:items-center md:gap-8">
              <div className="md:w-48">
                <p className="font-mono text-xs uppercase tracking-widest text-mist">{j.persona}</p>
                <p className="font-display text-xl font-semibold text-neon">"{j.question}"</p>
              </div>
              <p className="mt-3 font-serif text-base text-snow md:mt-0 md:flex-1">{j.flow}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.4.2: Commit**

```bash
git add src/components/landing/how-to-use.tsx
git commit -m "feat(landing): 'Como usar' — 3 jornadas"
```

### Task 4.5: Assemble `/landing` page

**Files:**
- Create: `src/app/landing/page.tsx`

- [ ] **Step 4.5.1: Compose sections**

```tsx
// src/app/landing/page.tsx
import { Hero } from "@/components/landing/hero";
import { WhatYouFind } from "@/components/landing/what-you-find";
import { WhoAnalyzes } from "@/components/landing/who-analyzes";
import { HowToUse } from "@/components/landing/how-to-use";
import { Footer } from "@/components/site/footer";

export const metadata = {
  title: "Brasileirão Série A · Análise de Clubes",
  description: "Análise editorial honesta dos 20 clubes da Série A 2026.",
};

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <WhatYouFind />
      <WhoAnalyzes />
      <HowToUse />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4.5.2: Verify landing renders**

```bash
npm run dev
```

Open `http://localhost:3000/landing`. Expected: hero visible (dark, neon accent), 3 content sections scroll, footer at bottom. Video tag is present but src 404s (or plays the placeholder if present).

- [ ] **Step 4.5.3: Commit**

```bash
git add src/app/landing/
git commit -m "feat(landing): compose /landing page with hero + 3 sections + footer"
```

---

## Phase 5 — Contact form + API route (Pushover)

### Task 5.1: API route with test

**Files:**
- Create: `src/app/api/contact/route.ts`, `src/app/api/contact/route.test.ts`, `.env.local.example`

- [ ] **Step 5.1.1: Document env vars**

Create `.env.local.example`:

```
PUSHOVER_TOKEN=your_pushover_app_token
PUSHOVER_USER=your_pushover_user_key
```

- [ ] **Step 5.1.2: Write the failing test**

```ts
// src/app/api/contact/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

function req(body: unknown): Request {
  return new Request("http://test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty message with 400", async () => {
    const res = await POST(req({ message: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 when credentials missing", async () => {
    const prevT = process.env.PUSHOVER_TOKEN;
    const prevU = process.env.PUSHOVER_USER;
    delete process.env.PUSHOVER_TOKEN;
    delete process.env.PUSHOVER_USER;
    const res = await POST(req({ message: "hello" }));
    expect(res.status).toBe(500);
    if (prevT) process.env.PUSHOVER_TOKEN = prevT;
    if (prevU) process.env.PUSHOVER_USER = prevU;
  });

  it("posts to Pushover when credentials exist", async () => {
    process.env.PUSHOVER_TOKEN = "tok";
    process.env.PUSHOVER_USER = "usr";
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ status: 1 }), { status: 200 }));
    const res = await POST(req({ name: "jose", email: "j@a.com", message: "oi" }));
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(
      "https://api.pushover.net/1/messages.json",
      expect.objectContaining({ method: "POST" })
    );
  });
});
```

- [ ] **Step 5.1.3: Run test — expect fail**

```bash
npm test -- route
```

Expected: cannot import `./route`.

- [ ] **Step 5.1.4: Write the route (copy of laboratorio-derivativos with title change)**

```ts
// src/app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Mensagem é obrigatória." }, { status: 400 });
  }
  if (message.trim().length > 5000) {
    return NextResponse.json({ error: "Mensagem muito longa." }, { status: 400 });
  }

  const token = process.env.PUSHOVER_TOKEN;
  const user = process.env.PUSHOVER_USER;

  if (!token || !user) {
    return NextResponse.json(
      { error: "Serviço indisponível.", detail: "credentials missing" },
      { status: 500 }
    );
  }

  const lines = [
    "Contato — Match Analysis Lab",
    name ? `Nome: ${name}` : null,
    email ? `Email: ${email}` : null,
    "",
    message.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const body = new URLSearchParams();
  body.append("token", token);
  body.append("user", user);
  body.append("title", "Match Analysis Lab — Contato");
  body.append("message", lines);

  const res = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao enviar mensagem." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5.1.5: Run tests — expect pass**

```bash
npm test
```

Expected: all 3 route tests pass.

- [ ] **Step 5.1.6: Commit**

```bash
git add src/app/api/contact/ .env.local.example
git commit -m "feat(api): /api/contact — Pushover bridge with validation"
```

### Task 5.2: Contact form component (dark theme)

**Files:**
- Create: `src/components/site/contact-form.tsx`

- [ ] **Step 5.2.1: Write the form**

Reuses the exact state machine from `laboratorio-derivativos/src/components/landing/contact-form.tsx`, re-themed to the dark palette per design.md §17.3.

```tsx
// src/components/site/contact-form.tsx
"use client";

import { useState } from "react";

export function ContactForm({ onSent }: { onSent?: () => void } = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message }),
      });
      if (res.ok) {
        setStatus("sent");
        setName(""); setEmail(""); setMessage("");
        onSent?.();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-neon/40 bg-neon/10 p-6 text-center">
        <p className="text-lg font-bold text-neon">Mensagem enviada. Obrigado pelo retorno!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mist">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (opcional)"
          className="w-full rounded-md border border-steel bg-graphite px-4 py-3 text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mist">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com (opcional — para resposta)"
          className="w-full rounded-md border border-steel bg-graphite px-4 py-3 text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mist">
          Mensagem <span className="text-danger">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descreva o erro, dúvida ou sugestão…"
          className="w-full resize-y rounded-md border border-steel bg-graphite px-4 py-3 text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        />
      </div>

      {status === "error" && (
        <div className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          Não foi possível enviar. Tente novamente.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-neon px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5.2.2: Commit**

```bash
git add src/components/site/contact-form.tsx
git commit -m "feat(site): contact form adapted to dark theme"
```

### Task 5.3: `/contato` page

**Files:**
- Create: `src/app/contato/page.tsx`

- [ ] **Step 5.3.1: Write the page**

```tsx
// src/app/contato/page.tsx
import Link from "next/link";
import { ContactForm } from "@/components/site/contact-form";
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";

export const metadata = { title: "Contato · Brasileirão Série A" };

export default function ContatoPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-xl px-6 pb-20 pt-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-neon hover:opacity-80">
          ← Voltar
        </Link>
        <h1 className="font-display text-4xl font-extrabold text-snow">Entre em contato</h1>
        <p className="mt-2 mb-8 font-serif text-lg text-mist">
          Erros, dúvidas ou sugestões? Escreva abaixo. Respondo pelo e-mail informado.
        </p>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5.3.2: Verify page loads**

```bash
npm run dev
```

Visit `/contato`. Expected: form renders in dark theme. Submit without filling message → stays with error state (server returns 400). With message, gets 500 locally if no PUSHOVER env vars — confirms that's what the error card shows.

- [ ] **Step 5.3.3: Commit**

```bash
git add src/app/contato/
git commit -m "feat(contato): dedicated /contato page"
```

---

## Phase 6 — Home (`/`)

### Task 6.1: Club search (autocomplete, no round selector)

**Files:**
- Create: `src/components/home/club-search.tsx`

- [ ] **Step 6.1.1: Write the search**

```tsx
// src/components/home/club-search.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CLUBS } from "@/lib/clubs";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function ClubSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const n = normalize(q);
    return CLUBS.filter((c) => normalize(c.displayName).includes(n)).slice(0, 8);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        (ref.current?.querySelector("input") as HTMLInputElement | null)?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar clube…  (tecle /)"
        className="w-full rounded-md border border-steel bg-graphite px-5 py-4 font-display text-xl text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-steel bg-graphite shadow-xl">
          {results.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/clube/${c.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-steel"
              >
                {c.badge ? (
                  <Image src={c.badge} alt="" width={28} height={28} />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-steel text-xs font-bold text-mist">
                    {c.displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="text-snow">{c.displayName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 6.1.2: Allow Next Image to load the badge paths**

In `next.config.ts`:

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: { unoptimized: true },
};
export default nextConfig;
```

(The badge filenames contain spaces and accents; `unoptimized` is the simplest path. Revisit later if needed.)

- [ ] **Step 6.1.3: Commit**

```bash
git add src/components/home/club-search.tsx next.config.ts
git commit -m "feat(home): club search with keyboard shortcut"
```

### Task 6.2: Highlights (4 cards from JSON)

**Files:**
- Create: `src/components/home/highlights.tsx`

- [ ] **Step 6.2.1: Write the highlights**

```tsx
// src/components/home/highlights.tsx
import Link from "next/link";
import { Shield, Zap, TrendingDown, Sparkles } from "lucide-react";
import highlights from "@/data/highlights.json";
import { bySlug } from "@/lib/clubs";

const ICON: Record<string, typeof Shield> = {
  shield: Shield,
  zap: Zap,
  "trending-down": TrendingDown,
  sparkles: Sparkles,
};

export function Highlights() {
  return (
    <section className="py-10">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-mist">Destaques da rodada</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => {
          const club = bySlug(h.club_slug);
          const Icon = ICON[h.icon] ?? Shield;
          return (
            <Link
              key={h.kind}
              href={h.deep_link}
              className="group rounded-lg border border-steel bg-graphite p-5 transition-colors hover:border-neon"
            >
              <Icon className="h-5 w-5 text-neon" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-mist">{h.title}</p>
              <p className="mt-1 font-display text-2xl font-bold text-snow">{club?.displayName ?? h.club_slug}</p>
              <p className="mt-1 font-mono text-sm text-neon">{h.metric_label}</p>
              <p className="mt-4 text-xs text-mist group-hover:text-neon">→ Ver</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 6.2.2: Commit**

```bash
git add src/components/home/highlights.tsx
git commit -m "feat(home): destaques da rodada from curated JSON"
```

### Task 6.3: Club card

**Files:**
- Create: `src/components/home/club-card.tsx`

- [ ] **Step 6.3.1: Write the card**

```tsx
// src/components/home/club-card.tsx
import Link from "next/link";
import Image from "next/image";
import type { Club } from "@/lib/clubs";
import type { StandingsRow } from "@/types/data";

function formChip(z: number): { label: string; className: string } {
  if (z > 0.3) return { label: "↑ em alta", className: "bg-success/15 text-success" };
  if (z < -0.3) return { label: "↓ em queda", className: "bg-danger/15 text-danger" };
  return { label: "→ estável", className: "bg-steel text-mist" };
}

export function ClubCard({ club, row }: { club: Club; row: StandingsRow | undefined }) {
  const form = formChip(row?.forma_z_media_ultimos_5 ?? 0);
  return (
    <Link
      href={`/clube/${club.slug}`}
      className="group flex flex-col items-center gap-2 rounded-lg border border-steel bg-graphite p-5 text-center transition-all hover:-translate-y-1 hover:border-neon"
    >
      <div className="flex h-16 w-16 items-center justify-center">
        {club.badge ? (
          <Image src={club.badge} alt={club.displayName} width={64} height={64} />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded bg-steel font-display text-lg font-bold text-snow">
            {club.displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <p className="font-display text-lg font-bold text-snow">{club.displayName}</p>
      <p className="font-mono text-xs text-mist">
        {row ? `${row.posicao}º · ${row.pontos} pts` : "—"}
      </p>
      <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${form.className}`}>{form.label}</span>
    </Link>
  );
}
```

- [ ] **Step 6.3.2: Commit**

```bash
git add src/components/home/club-card.tsx
git commit -m "feat(home): club card with form chip"
```

### Task 6.4: Club grid

**Files:**
- Create: `src/components/home/club-grid.tsx`

- [ ] **Step 6.4.1: Write the grid**

```tsx
// src/components/home/club-grid.tsx
import { CLUBS, byCsvName } from "@/lib/clubs";
import type { StandingsRow } from "@/types/data";
import { ClubCard } from "./club-card";

export function ClubGrid({ standings }: { standings: StandingsRow[] }) {
  const byTeam = new Map<string, StandingsRow>(standings.map((s) => [s.clube, s]));
  const ordered = [...standings].sort((a, b) => a.posicao - b.posicao);

  return (
    <section className="py-10">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-mist">Tabela · Brasileirão Série A</p>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {ordered.map((row) => {
          const club = byCsvName(row.clube);
          if (!club) return null;
          return <ClubCard key={club.slug} club={club} row={row} />;
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 6.4.2: Commit**

```bash
git add src/components/home/club-grid.tsx
git commit -m "feat(home): 4×5 (desktop) club grid ordered by standings"
```

### Task 6.5: Assemble Home `/`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 6.5.1: Replace with real Home**

```tsx
// src/app/page.tsx
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { ClubSearch } from "@/components/home/club-search";
import { Highlights } from "@/components/home/highlights";
import { ClubGrid } from "@/components/home/club-grid";
import standings from "@/data/compiled/standings.json";
import type { StandingsRow } from "@/types/data";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1280px] px-4 pt-10">
        <ClubSearch />
        <Highlights />
        <ClubGrid standings={standings as StandingsRow[]} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6.5.2: Ensure compiled data exists**

```bash
npm run compile:data
```

Expected: `src/data/compiled/standings.json` present.

- [ ] **Step 6.5.3: Verify Home**

```bash
npm run dev
```

Visit `/`. Expected:
- Top bar sticky
- Search input (typing "fla" shows Flamengo; pressing `/` focuses input)
- 4 highlight cards
- 20-club grid ordered by points (Flamengo first, etc.)
- Hovering a card lifts it; clicking goes to `/clube/:slug`
- Footer with author credit and contact CTA

- [ ] **Step 6.5.4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): assemble / with search + highlights + club grid"
```

---

## Phase 7 — Placeholder club page (`/clube/[slug]`)

### Task 7.1: Write placeholder page

**Files:**
- Create: `src/app/clube/[slug]/page.tsx`

- [ ] **Step 7.1.1: Write the page**

```tsx
// src/app/clube/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { ContactForm } from "@/components/site/contact-form";
import { bySlug, CLUBS } from "@/lib/clubs";

export function generateStaticParams() {
  return CLUBS.map((c) => ({ slug: c.slug }));
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = bySlug(slug);
  if (!club) notFound();

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[900px] px-6 pt-16">
        <Link href="/" className="text-sm text-neon hover:opacity-80">← Voltar para a tabela</Link>

        <div className="mt-8 flex items-center gap-6">
          {club.badge ? (
            <Image src={club.badge} alt="" width={96} height={96} />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded bg-steel font-display text-2xl font-bold text-snow">
              {club.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-mist">Brasileirão Série A · 2026</p>
            <h1 className="font-display text-5xl font-extrabold text-snow">{club.displayName}</h1>
          </div>
        </div>

        <div className="mt-14 rounded-lg border border-steel bg-graphite p-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neon">Em construção</p>
          <h2 className="font-display text-3xl font-bold text-snow">A análise completa deste clube está sendo preparada.</h2>
          <p className="mt-4 font-serif text-lg text-mist">
            Em breve: Clube × Clube (Bloco 1), Clube na Rodada (Bloco 2), Clube na Competição (Bloco 3), 2026 × 2025 (Bloco 4), Análise de Performance por LLM (Bloco 5), e Análise de Estilo Casa / Fora.
          </p>
          <p className="mt-4 font-serif text-lg text-mist">
            Deixe seu e-mail abaixo para ser avisado quando este clube entrar no ar.
          </p>

          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 7.1.2: Verify**

```bash
npm run dev
```

Click any club from `/`. Expected: placeholder page with badge + name + contact form. Invalid slug → 404.

- [ ] **Step 7.1.3: Commit**

```bash
git add src/app/clube/
git commit -m "feat(clube): placeholder page with contact form"
```

---

## Phase 8 — Vercel deploy

### Task 8.1: Deploy to Vercel

**Files:**
- Create: (optional) `vercel.json`

- [ ] **Step 8.1.1: Install Vercel CLI and link project**

```bash
npm i -g vercel@latest
vercel link
```

Follow prompts. When asked for project name, use `laboratorio-match-analysis`. Accept defaults for framework detection.

- [ ] **Step 8.1.2: Set env vars in Vercel**

```bash
vercel env add PUSHOVER_TOKEN production
vercel env add PUSHOVER_USER production
vercel env add PUSHOVER_TOKEN preview
vercel env add PUSHOVER_USER preview
```

When prompted, paste the same token/user used by `laboratorio-derivativos`.

- [ ] **Step 8.1.3: Deploy a preview**

```bash
vercel
```

Expected: Vercel builds, runs `prebuild` → `compile:data` → `build`. Preview URL prints at the end. Open it; exercise `/`, `/landing`, `/clube/flamengo`, `/contato`. Submit the contact form with any message — verify Pushover notification lands on the author's device.

- [ ] **Step 8.1.4: Promote to production (optional now, required for launch)**

```bash
vercel --prod
```

- [ ] **Step 8.1.5: Commit link metadata**

```bash
git add .vercel/ -f 2>/dev/null || true
git add .
git commit --allow-empty -m "deploy: first Vercel preview"
```

(The `.vercel/` directory is typically gitignored; skip if not needed.)

---

## Phase 9 — HyperFrames hero video

### Task 9.1: Scaffold HyperFrames project

**Files:**
- Create: `hyperframes/hero/index.html`, `hyperframes/hero/hyperframes.json`

- [ ] **Step 9.1.1: Init HyperFrames project**

```bash
cd hyperframes
npx --yes hyperframes init hero
cd hero
```

Choose defaults when prompted. Verify `hyperframes.json` and `index.html` created.

- [ ] **Step 9.1.2: Author the composition (10s loop)**

Per design.md §18.2: "chute de um jogador … bola em direção ao gol … xG, xT aparecem ao redor da bola". Style decided in grill-me: illustrated authorial, neon palette.

Edit `index.html` with a 1920×1080 composition:

- Background: dark `#0a0c0f` with subtle noise.
- Schematic top-down pitch outline in `#1e2530`, 30% opacity.
- Silhouette of a player (SVG) at left third.
- Ball (circle, radial gradient from `#b8ff57` to `#e8edf3`) starts at player's foot, animates along a parabolic trajectory to the goal at right.
- Near the ball's trajectory, numeric chips appear in sequence:
  - `xG 0.38` (frame 60, fades in and tracks the ball)
  - `xT 0.19`
  - `PPDA 6.2`
- Title "Brasileirão Série A — Análise de Clubes" is NOT drawn inside the composition (HTML overlay in `hero.tsx` handles it).
- Duration: 10s. Loop: set `loop: true` in composition settings.

Full GSAP timeline example — extend as needed:

```html
<!-- hyperframes/hero/index.html (excerpt — inside <script> after DOMContentLoaded) -->
const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });
tl.set(".ball", { x: 380, y: 540, scale: 1, opacity: 0 });
tl.to(".ball", { opacity: 1, duration: 0.3 });
tl.to(".ball", { x: 1520, y: 520, duration: 2.6, ease: "power2.out",
  motionPath: { path: [{ x: 380, y: 540 }, { x: 950, y: 280 }, { x: 1520, y: 520 }] } });
tl.from(".chip-xg", { opacity: 0, y: 20, duration: 0.4 }, "-=2.2");
tl.from(".chip-xt", { opacity: 0, y: 20, duration: 0.4 }, "-=1.4");
tl.from(".chip-ppda", { opacity: 0, y: 20, duration: 0.4 }, "-=0.6");
tl.to([".ball", ".chip-xg", ".chip-xt", ".chip-ppda"], { opacity: 0, duration: 0.6 }, "+=0.8");
```

- [ ] **Step 9.1.3: Preview**

```bash
npx hyperframes preview
```

Iterate until the 10s loop feels right (field + player + ball + 3 chips).

- [ ] **Step 9.1.4: Render to MP4**

```bash
npx hyperframes render --output ../../public/videos/hero.mp4 --duration 10 --width 1920 --height 1080 --fps 30
```

Expected: `public/videos/hero.mp4` exists (roughly 2–4 MB for 10s at these settings).

- [ ] **Step 9.1.5: Extract a poster frame**

```bash
cd ../..
npx --yes ffmpeg -i public/videos/hero.mp4 -ss 00:00:04 -frames:v 1 public/videos/hero-poster.jpg -y
```

- [ ] **Step 9.1.6: Verify in the landing**

```bash
npm run dev
```

Open `/landing`. Expected: hero plays in loop at 60% opacity behind the HTML overlay.

- [ ] **Step 9.1.7: Commit**

```bash
git add hyperframes/ public/videos/
git commit -m "feat(landing): HyperFrames hero video (10s loop) + poster"
```

---

## Phase 10 — Final polish + launch

### Task 10.1: Accessibility + responsive pass

- [ ] **Step 10.1.1: Add `prefers-reduced-motion` guard on hero video**

Modify `src/components/landing/hero.tsx` — wrap the `<video>` so that users with reduced-motion preference only see the poster:

```tsx
// Replace the <video> block with:
<video
  className="absolute inset-0 h-full w-full object-cover opacity-60 motion-reduce:hidden"
  autoPlay muted loop playsInline
  poster="/videos/hero-poster.jpg"
>
  <source src="/videos/hero.mp4" type="video/mp4" />
</video>
<img
  src="/videos/hero-poster.jpg"
  alt=""
  aria-hidden
  className="absolute inset-0 h-full w-full object-cover opacity-60 hidden motion-reduce:block"
/>
```

- [ ] **Step 10.1.2: Mobile smoke test**

With `npm run dev` running, open DevTools device toolbar and check at 375px and 768px: Home grid collapses to 2 columns; landing hero text wraps; footer stacks. Fix any overflow.

- [ ] **Step 10.1.3: Lighthouse on the preview URL**

Run Lighthouse in Chrome DevTools against the Vercel preview URL on `/`, `/landing`, `/clube/flamengo`, `/contato`. Target: Performance ≥ 85, Accessibility ≥ 95. Fix any low-hanging issues (missing alt text, contrast warnings, etc.).

- [ ] **Step 10.1.4: Commit any polish**

```bash
git add -A
git commit -m "fix(a11y): reduced-motion poster fallback + responsive tweaks"
```

### Task 10.2: Production deploy

- [ ] **Step 10.2.1: Promote to production**

```bash
vercel --prod
```

- [ ] **Step 10.2.2: Smoke test production**

Open the production URL. Exercise the full flow: landing → CTA → home → click club → placeholder → contact → submit → Pushover ping received.

- [ ] **Step 10.2.3: Tag the release**

```bash
git tag v0.1.0
git push --tags 2>/dev/null || true
```

---

## Spec alignment notes

- Design.md §6.1 shows a round selector ("Rodada 12 ▾") on Home. **Removed per user correction** — round selection is scoped to Bloco 2 only.
- Design.md §17.2 specifies a modal for desktop contact + `/contato` on mobile. This plan ships `/contato` only; modal is trivial to add later with `shadcn/dialog` and wrapping `<ContactForm />`.
- Design.md §18.2 notes 4 missing badges (Ceará, Fortaleza, Juventude, Sport). Manifest handles this with initials placeholder.
- HyperFrames landing explicitly moved from "after app is done" (§19 item 7) to this milestone by user decision.

## Out-of-scope reminder

Nothing in this plan touches: Blocos 1–5, Estilo Casa/Fora, Glossário, Sobre, LLM routes, round selector, mobile bottom nav of club pages. Those live in future plans.
