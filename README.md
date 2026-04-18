# analise-performance-estilo

Brasileirão Série A — Análise de Clubes. Plataforma editorial de análise de performance e estilo dos 20 clubes da Série A 2026, baseada em dados de Opta / Twelve Football.

Por José Américo Antunes.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Vega-Lite (em Bloco futuro) · Vercel.

## Desenvolvimento

```bash
npm install
npm run compile:data   # CSVs em public/data → JSON em src/data/compiled
npm run dev
```

Variáveis de ambiente em `.env.local` (ver `.env.local.example`):

- `PUSHOVER_TOKEN` — token da app Pushover usada pelo formulário de contato
- `PUSHOVER_USER` — user key do destinatário

## Especificação

Design completo em `specs/design.md`. Plano de implementação em `docs/superpowers/plans/`.
