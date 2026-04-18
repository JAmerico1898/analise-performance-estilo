# design.md — Brasileirão Série A · Análise de Clubes

> Documento de design de UX, jornada e sistema visual do aplicativo web de análise de performance e estilo de jogo dos 20 clubes da Série A do Brasileirão.
>
> Versão: 0.1 — baseline pós-entrevista de requisitos (2026-04-18).

---

## 1. Princípios de UX (os 5 mandamentos)

Todas as decisões de design devem respeitar estes princípios. Em caso de conflito, princípio de numeração menor vence.

1. **Nunca mostrar 63 métricas de uma vez.** A arquitetura parte sempre de 5 qualidades; métricas só aparecem sob drill-down explícito do usuário.
2. **Um clube em foco por sessão de análise.** O app é *club-first*: o usuário escolhe um clube e mergulha nele; rodada, temporada e adversários são recortes secundários.
3. **Cada tela é compartilhável.** URL profundo, botão "Copiar link" e exportação visual (PNG/PDF) são obrigatórios em todo bloco. Dados brutos, nunca.
4. **Dado bruto mora no hover, narrativa mora no corpo.** O gráfico mostra Z-score e posição relativa; o valor nominal aparece no tooltip. O relatório LLM aparece só quando pedido.
5. **Mobile se aproxima do desktop, não o degrada.** Toda visualização tem versão mobile pensada — não uma versão pobre, uma versão adaptada.

---

## 2. Público-alvo

### 2.1 Priorização

| Nível | Persona | Contexto de uso | Necessidades-chave |
|---|---|---|---|
| **P0** | Analista de futebol / comissão técnica | Desktop no CT ou laptop em viagem, sessões de 15-60min | Drill-down rápido, comparação rodada/temporada, exportação de imagens para apresentação |
| **P0** | Jornalista esportivo / scout | Mobile em campo ou desktop na redação, sessões de 3-10min | Relatório LLM pronto para citação, imagens prontas para post, links compartilháveis |
| **P1** | Torcedor sofisticado / apostador | Mobile em qualquer lugar, sessões curtas de 2-5min | Leitura fácil com apoio de tooltip/glossário, narrativa antes de números |

### 2.2 Implicações

- **Sem tutoriais intrusivos.** Analistas (P0) são interrompidos por modais de boas-vindas. Onboarding é passivo (tooltips + ícone `(i)` + glossário no footer).
- **Linguagem pt-BR em toda UI.** Termos técnicos mantidos (PPDA, xG, xT, Field tilt) — são o vocabulário dos P0; tooltips ensinam aos P1.
- **Narrativa LLM como ponte.** O relatório de Bloco 5 e Estilo serve como tradução para jornalistas e torcedores; analistas usam como pré-leitura antes do drill factual.

---

## 3. Arquitetura de informação

### 3.1 Sitemap

```
/                                       Home (grade de clubes + destaques da rodada)
/clube/:slug                            Página do clube — default: Performance › Bloco 2 (Clube na Rodada)
/clube/:slug/performance                Redireciona para /clube/:slug/performance/bloco-2
/clube/:slug/performance/bloco-1        Clube vs Clube (jogo específico)
  ?jogo=:game_id
  &qualidade=:slug (drill-down ativo)
/clube/:slug/performance/bloco-2        Clube na Rodada
  ?rodada=:n
  &qualidade=:slug
/clube/:slug/performance/bloco-3        Clube na Competição (média móvel)
  ?qualidade=:slug
  &metrica=:slug (2º nível de drill)
/clube/:slug/performance/bloco-4        2026 vs 2025
  ?qualidade=:slug
  &metrica=:slug
/clube/:slug/performance/bloco-5        Análise de Performance (LLM)
  ?local=casa|fora
/clube/:slug/estilo                     Redireciona para /clube/:slug/estilo/casa
/clube/:slug/estilo/casa                Análise de Estilo (LLM) — Casa
/clube/:slug/estilo/fora                Análise de Estilo (LLM) — Fora
/glossario                              Glossário completo das 63 métricas + 5 qualidades
/sobre                                  Sobre metodologia, fontes, créditos
/contato                                Formulário de contato (erros, dúvidas, sugestões)
/api/contact                            POST — envia mensagem via Pushover ao autor (server-side)
/api/llm/performance                    POST — chama Gemini para Bloco 5
/api/llm/style                          POST — chama Gemini para análise de estilo
```

Slugs de clube: kebab-case sem acentos (`vasco-da-gama`, `atletico-mg`, `red-bull-bragantino`).
Slugs de qualidade: `defesa`, `transicao-defensiva`, `transicao-ofensiva`, `ataque`, `criacao-de-chances`.

### 3.2 Estado persistente

- **URL**: todos os filtros (rodada, jogo, qualidade aberta, métrica drilled, Casa/Fora do Bloco 5 e Estilo) refletem no query string.
- **localStorage**: último clube visitado + última rota visitada → permite reentrada rápida a partir de qualquer URL raiz.
- **Sem sessão / sem autenticação** nesta versão.

---

## 4. Jornadas-chave

### 4.1 Jornada A — "Como foi o Flamengo contra o Vasco?" (jornalista, mobile)

1. Abre o app → home mostra destaques da rodada, grade de clubes.
2. Toca no card do Flamengo → cai na página do clube, aba Performance › Bloco 2 (Clube na Rodada) com a rodada mais recente pré-selecionada.
3. Troca para Bloco 1 (Clube vs Clube) → dropdown de jogos aparece; seleciona `R12 · Vasco 0×2 Flamengo`.
4. Vê distribution plot das 5 qualidades; Flamengo destacado acima da média em Ataque e Criação de chances.
5. Toca em "Ataque" → drill para as métricas; vê xT e Entradas na área elevadas.
6. Volta para topo da página → clica em "Análise de Performance" (Bloco 5) → seleciona "Casa" → "Gerar análise".
7. LLM devolve relatório em 8s com pontos fortes/fracos.
8. Toca no menu `⋯` → "Baixar relatório (PDF)" → compartilha no grupo da redação.

### 4.2 Jornada B — "Quero entender a queda do Palmeiras" (analista, desktop)

1. Abre o app → busca "Palmeiras" no topo.
2. Cai na página do clube → vai direto ao Bloco 3 (Clube na Competição).
3. Vê line chart com média móvel de 5 jogos — qualidade Defesa caiu nas últimas 3 rodadas.
4. Clica em "Defesa" → drill-down mostra Z-score por métrica ao longo do tempo.
5. Identifica que "Altura defensiva (m)" despencou na rodada 9.
6. Troca para Bloco 4 (2026 vs 2025) → vê que em 2025 a altura era consistente; queda é nova.
7. Vai ao Bloco 1 → dropdown → escolhe o jogo da rodada 9 → confirma anomalia isolada naquele jogo.
8. Usa botão "Copiar link desta análise" → cola no Slack da comissão técnica.
9. Menu `⋯` → "Baixar imagem (PNG)" do line chart do Bloco 3 → anexa no relatório semanal.

### 4.3 Jornada C — "Meu time joga bem ou tá enganando?" (torcedor, mobile casual)

1. Abre o app → toca em "Botafogo" na grade.
2. Cai no Bloco 2; vê Botafogo na média em quase tudo.
3. Não entende "PPDA" → toca no ícone `(i)` ao lado → popover explica.
4. Toca em "Estilo de jogo" → "Casa" → "Gerar análise".
5. Lê o relatório e entende que o time joga direto, não de posse.
6. Fecha o app satisfeito.

---

## 5. Layout global

### 5.1 Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO] Brasileirão Série A · Análise   🔍 Buscar clube…        │  ← Top bar (56px)
├─────────────────────────────────────────────────────────────────┤
│  [escudo] VASCO DA GAMA ▾   ●12º · 14pts     📍 Performance ›…  │  ← Context bar (64px, sticky)
├──────────────────────┬──────────────────────────────────────────┤
│                      │                                           │
│  Performance  Estilo │  [Sub-nav do bloco ativo]                 │
│  ───────────         │                                           │
│  Bloco 1  Clube×Clube│  [Área do conteúdo do bloco]              │
│  Bloco 2  Rodada ●   │                                           │
│  Bloco 3  Competição │                                           │
│  Bloco 4  2026×2025  │                                           │
│  Bloco 5  Análise    │                                           │
│                      │                                           │
│  ─ Estilo ─          │                                           │
│  Casa                │                                           │
│  Fora                │                                           │
└──────────────────────┴──────────────────────────────────────────┘
│                                                                  │
│  Brasileirão Série A · Análise de Clubes                         │
│  por José Américo Antunes                                        │
│                                                                  │
│  Glossário · Metodologia · Sobre                                 │
│                                                                  │
│  Erros, Dúvidas, Sugestões?                                      │
│  Entre em contato →                                              │
│                                                                  │  ← Footer (≈160px)
└─────────────────────────────────────────────────────────────────┘
```

- **Top bar**: logo + busca global. Sempre visível.
- **Context bar**: clube selecionado (clicável → troca clube via dropdown/modal), posição/pontos na tabela, breadcrumb da navegação atual. Sticky.
- **Sidebar esquerda (220px)**: top-level `Performance | Estilo` + sub-nav dos blocos. Sticky. Item ativo em destaque (barra lateral neon + peso 600).
- **Área principal**: scroll interno; bloco ocupa 100% da largura disponível.
- **Footer**: links utilitários, discreto.

### 5.2 Mobile (<1024px)

```
┌───────────────────────────┐
│ ☰  Brasileirão · Análise  │  ← Top bar (48px)
├───────────────────────────┤
│ [escudo] VASCO ▾  12º·14p │  ← Context bar
├───────────────────────────┤
│                           │
│  [Sub-nav horizontal      │
│   scrollable:             │
│   Bloco 1 · Bloco 2 ● ·   │
│   Bloco 3 · Bloco 4 · ··] │
│                           │
│  [Conteúdo do bloco]      │
│                           │
├───────────────────────────┤
│ [Perf] [Estilo] [🔍] [⋯]  │  ← Bottom nav (56px)
└───────────────────────────┘
```

- **Hamburger (☰)**: abre drawer com grade de clubes + busca.
- **Sub-nav horizontal scrollable**: tabs dos blocos deslizam com snap.
- **Bottom nav**: Performance / Estilo / Buscar / Menu (export, compartilhar, glossário).
- Gestos: swipe horizontal na área principal troca de bloco (sub-nav); swipe vertical na viz abre modo pinch-zoom.

### 5.3 Breakpoints

| Nome | Largura | Tratamento |
|---|---|---|
| `mobile` | <640px | Layout empilhado; vizs em 100vw com scroll horizontal interno |
| `tablet` | 640–1023px | Grade 2 colunas para home; sidebar vira bottom drawer |
| `desktop` | 1024–1439px | Layout completo; sidebar 220px |
| `wide` | ≥1440px | Sidebar 260px; conteúdo com `max-width: 1280px` centralizado |

---

## 6. Home (`/`)

### 6.1 Estrutura

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    🔍 Buscar clube ou rodada…                 Rodada 12 ▾        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  📊 DESTAQUES DA RODADA 12                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │ 🛡️ Melhor    │ │ ⚡ Maior xT  │ │ 📉 Queda     │ │ 🎯 Surpresa ││
│  │ defesa      │ │ da rodada   │ │ de forma    │ │ da rodada   ││
│  │ Flamengo    │ │ Palmeiras   │ │ Santos      │ │ Mirassol    ││
│  │ PPDA 6.2    │ │ xT 3.4      │ │ -0.8 σ      │ │ +1.2 σ xG   ││
│  │ → Ver       │ │ → Ver       │ │ → Ver       │ │ → Ver       ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  TABELA · RODADA 12                                              │
│  ┌────┬────┬────┬────┐                                          │
│  │ 1º │ 2º │ 3º │ 4º │   grade 4×5 com escudos + posição + chip │
│  └────┴────┴────┴────┘                                          │
│  ... (20 cards, ordenados por pontos)                            │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Card de clube

```
┌──────────────────┐
│   [escudo 64px]  │
│                  │
│   FLAMENGO       │
│   1º · 28 pts    │
│   ↑ em alta      │   ← chip colorido baseado em Z-score médio
│                  │      dos últimos 5 jogos (verde/amarelo/vermelho)
└──────────────────┘
```

- Hover (desktop): eleva 4px, borda neon.
- Clique: navega para `/clube/:slug`.
- Chip "em alta / estável / em queda" derivado da média dos Z-scores de qualidade dos últimos 5 jogos (verde se >0.3, amarelo se entre -0.3 e 0.3, vermelho se <-0.3).

### 6.3 Destaques da rodada

- 4 cards editoriais pré-calculados server-side por rodada.
- Cada card linka direto para o bloco correspondente (ex: "Melhor defesa" → `/clube/flamengo/performance/bloco-2?rodada=12&qualidade=defesa`).
- Títulos escritos em português direto, sem jargão.
- Em rodadas sem jogos (rodadas futuras), área é substituída por `/* ver estado 11.2 */`.

### 6.4 Busca

- Input grande no topo, placeholder "Buscar clube ou rodada…".
- Dropdown de autocomplete mostra: clubes (com escudo) primeiro, rodadas (R01, R02…) depois.
- Atalho teclado `/` foca o input.

---

## 7. Página do clube — os 7 blocos

### 7.1 Context bar (em todas as páginas de clube)

```
[escudo 32px] VASCO DA GAMA ▾     12º · 14 pts · 3V 5E 4D    Performance › Clube na Rodada › Defesa
                                                                              ⋯
```

- Dropdown do clube: abre um popover com grade miniatura dos 20 clubes + busca.
- Breadcrumb clicável: cada segmento é link (voltar para qualidades, voltar para bloco, etc.).
- Menu `⋯` à direita: "Copiar link", "Baixar imagem (PNG)" ou "Baixar relatório (PDF)" conforme bloco.

### 7.2 Bloco 1 — Clube vs Clube (`/clube/:slug/performance/bloco-1`)

**Propósito:** comparar um jogo específico do clube com os demais jogos do próprio clube na competição.

**Data source:** `performance_team.csv` (Z-score calculado contra os outros jogos do mesmo clube).

**Layout:**

```
┌───────────────────────────────────────────────────────────────┐
│  JOGO SELECIONADO                                              │
│  ← [R12 · 12/04 · Vasco 0×2 Flamengo · Fora ▾] →             │
│    (dropdown com busca + setas navegam rodadas)               │
├───────────────────────────────────────────────────────────────┤
│  [Distribution plot · 5 qualidades lado a lado]               │
│                                                                │
│  Cada qualidade:  ·  ·  ·  ·  ●  · · ·  <- Vasco neste jogo  │
│                   └── distribuição dos demais jogos ──┘       │
│                                                                │
│  Hover: nominal + "este jogo foi o N-ésimo melhor em X"       │
│  Clique: drill-down para métricas da qualidade                │
└───────────────────────────────────────────────────────────────┘
```

**Interações:**
- Dropdown do jogo: busca por "Flamengo", "12/04", "R12". Formato `R{rodada} · {data} · {partida} · {Casa|Fora}`.
- Setas ← → ao lado do dropdown: navega para jogo anterior/próximo na ordem cronológica.
- Clique em qualidade → distribution plot substituído pelas métricas daquela qualidade (ver § 8.1).
- Breadcrumb atualiza: `Performance › Clube vs Clube › Defesa`.

**Exportação:** PNG 1200×675 com header "Vasco · Rodada 12 · vs Flamengo · Performance por qualidade".

### 7.3 Bloco 2 — Clube na Rodada (`/clube/:slug/performance/bloco-2`)

**Propósito:** comparar a performance do clube na rodada X com os outros 19 clubes que jogaram na mesma rodada.

**Data source:** `performance_round.csv` (Z-score calculado vs. todos os jogos da rodada).

**Layout:** idêntico ao Bloco 1, com diferenças:
- Seletor no topo é **rodada** (não jogo individual): dropdown `R01 · R02 · … · R38`, setas ← → navegam rodadas.
- Default: rodada mais recente com jogos registrados.
- Abaixo do dropdown, chip sutil: `Vasco · 12º · Casa · vs Flamengo 0×2` — o jogo do clube naquela rodada.

**Interações:** mesmo padrão de drill-down que o Bloco 1.

### 7.4 Bloco 3 — Clube na Competição (`/clube/:slug/performance/bloco-3`)

**Propósito:** mostrar evolução do clube ao longo da competição vs. os 19 demais, via média móvel de 5 jogos, em gráfico de linha.

**Data source:** `performance_round.csv` agregada por média móvel de 5 jogos, uma linha por clube.

**Layout:**

```
┌───────────────────────────────────────────────────────────────┐
│  EVOLUÇÃO · Média móvel de 5 jogos                             │
│  [Tabs de qualidade: Defesa | Trans.Def | Trans.Of | Ataq |Cri]│
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Z-score                                                       │
│  +2 ┤                                                          │
│     │           ╭──╮      ━━━ Vasco (destacado, 2px, neon)    │
│   0 ┼──────────╯    ╰─╮   ─── outros clubes (cinza, 1px, 40%) │
│     │                  ╰                                       │
│  -2 ┤                                                          │
│     └─R01─R05─R10─R15─R20─R25─R30─R35─R38                    │
│                                                                │
│  Legenda clicável: destaca/esconde clubes individuais          │
└───────────────────────────────────────────────────────────────┘
```

**Interações:**
- Tabs de qualidade acima do chart → troca a série exibida.
- Hover no ponto: tooltip com `Rodada X · valor Z-score · valor nominal · rank na rodada`.
- Clique em uma qualidade ativa → expande um segundo chart abaixo com as **métricas** dessa qualidade (cada métrica vira um mini line chart, 3 por linha).
- Legenda: toque num clube esmaece os demais (isolamento visual).

### 7.5 Bloco 4 — 2026 vs 2025 (`/clube/:slug/performance/bloco-4`)

**Propósito:** comparar temporadas, via média móvel de 5 jogos.

**Data source:** `performance_round.csv` (2026) + `performance_round_2025.csv`, combinadas pelo mesmo clube.

**Layout:** similar ao Bloco 3, mas com **apenas duas linhas**:
- 2026 (linha sólida, neon)
- 2025 (linha tracejada, cinza-claro)

Eixo X: rodada da temporada (R01–R38). Eixo Y: Z-score.

**Estado especial — clube promovido sem 2025:**
- Card de fallback: "Este clube não disputou a Série A em 2025. Ver evolução de 2026 comparada à média da Série A 2025 →" com toggle.
- Se toggle ativado: linha 2025 = média dos 20 clubes da Série A 2025.

**Interações:** drill-down qualidade → métrica idêntico ao Bloco 3.

### 7.6 Bloco 5 — Análise de Performance (LLM) (`/clube/:slug/performance/bloco-5`)

**Propósito:** síntese narrativa dos pontos fortes e fracos do clube, gerada por LLM a partir das 8 melhores e 8 piores variáveis em casa ou fora.

**Data source:** `performance_team.csv` agregado por local (Casa/Fora), selecionando as 8 métricas com maior e as 8 com menor Z-score médio.

**Layout:**

```
┌───────────────────────────────────────────────────────────────┐
│  ANÁLISE DE PERFORMANCE                                        │
│                                                                │
│  [🏠 Casa]  [✈️ Fora]           (toggle local, obrigatório)    │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  (Estado inicial, antes de gerar)                              │
│                                                                │
│  📊 8 variáveis com melhor desempenho em casa:                 │
│  [PPDA] [xT] [Entradas na área] [Duelos vencidos] … (chips)   │
│                                                                │
│  📉 8 variáveis com pior desempenho em casa:                   │
│  [Bola longa %] [Altura da perda] … (chips)                   │
│                                                                │
│  [   Gerar análise   ]  ← botão grande, neon                  │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  (Após geração)                                                │
│                                                                │
│  ▸ Pontos fortes                                               │
│  O Vasco em casa demonstra pressão defensiva intensa…          │
│  (parágrafos, com nomes de métricas destacados como links      │
│   que levam ao Bloco 3/4 correspondente)                       │
│                                                                │
│  ▸ Pontos fracos                                               │
│  …                                                             │
│                                                                │
│  ▸ Síntese                                                     │
│  …                                                             │
│                                                                │
│  [Baixar relatório (PDF)]  [Gerar nova análise]               │
└───────────────────────────────────────────────────────────────┘
```

**Interações:**
- Toggle `Casa | Fora`: um dos dois obrigatoriamente selecionado; troca regenera inputs (chips) mas **não** regenera relatório automaticamente.
- Botão "Gerar análise": loading estado com skeleton text (linhas pulsando) por ~5-15s.
- Chips das variáveis input são clicáveis: levam ao Bloco 3 filtrado pela métrica.
- Relatório: markdown renderizado, tipografia editorial (Fraunces serif).
- Cross-links: nomes de métricas no texto viram links para os blocos factuais correspondentes (feature de engajamento).
- Menu `⋯` → "Baixar relatório (PDF)" gera PDF A4 com:
  - Cabeçalho: escudo + nome do clube + local + timestamp
  - Chips das 16 variáveis input
  - Texto completo formatado
  - Footer: `laboratorio-match-analysis · gerado por Gemini em DD/MM/YYYY HH:mm`

**LLM:**
- Modelo: `gemini-latest` via API server-side (Vercel function). Chave em env da Vercel, nunca exposta.
- Prompt: template em `/prompts/performance_llm.md` (a criar) consumindo chips + contexto de `context.csv`.
- Timeout: 30s; estado de erro (§ 11.4).
- Sem cache: cada clique regenera. Botão desabilitado por 3s após clique para evitar duplo-disparo.

### 7.7 Bloco Estilo — Casa (`/clube/:slug/estilo/casa`) e Fora (`/clube/:slug/estilo/fora`)

**Propósito:** caracterizar o estilo de jogo do clube nos últimos 5 jogos em casa ou fora, via análise LLM pura.

**Data source:** `play_style_metrics.csv` (valores nominais — Z-score **não** usado em estilo) + `play_style2.csv` (catálogo de estilos) + `context_style.csv` (definições de métricas de estilo).

**Layout:**

```
┌───────────────────────────────────────────────────────────────┐
│  ESTILO DE JOGO · CASA                                         │
│                                                                │
│  Base: últimos 5 jogos em casa (R04, R06, R08, R10, R12)      │
│                                                                │
│  Métricas consideradas:                                        │
│  [chips de todas as 26 métricas de estilo com valor nominal]   │
│                                                                │
│  [   Gerar análise   ]                                         │
├───────────────────────────────────────────────────────────────┤
│  (Após geração — texto narrativo)                              │
│                                                                │
│  ▸ Estilo predominante: Jogo de Transições Rápidas             │
│  ▸ Características defensivas…                                 │
│  ▸ Características ofensivas…                                  │
│  ▸ Padrões de construção…                                      │
│                                                                │
│  [Baixar relatório (PDF)]  [Gerar nova análise]               │
└───────────────────────────────────────────────────────────────┘
```

**Interações:** idênticas ao Bloco 5, exceto:
- Toggle Casa/Fora é **navegação** entre duas URLs (`/estilo/casa` e `/estilo/fora`), não filtro local.
- Sub-nav lateral tem dois itens explícitos: `Estilo · Casa` e `Estilo · Fora`.

---

## 8. Padrões de interação

### 8.1 Drill-down qualidade → métrica

Usado em Blocos 1, 2, 3, 4.

**Gesto:** clique na qualidade (barra/curva destacada).

**Transição:**
1. Visualização atual faz fade-out de 150ms.
2. Breadcrumb muda de `… › Qualidades` para `… › {Qualidade}`.
3. Nova visualização (métricas daquela qualidade) faz fade-in de 200ms.
4. Botão "← Voltar para qualidades" aparece próximo ao breadcrumb.

**Nos line charts (Bloco 3, 4):** drill-down de 2 níveis — qualidade → grid de mini line charts de métricas → clique numa métrica → line chart full-size dela isolada. Cada nível tem breadcrumb próprio.

### 8.2 Context bar — troca de clube

**Desktop:** clique no escudo/nome abre popover com:
- Input de busca no topo
- Grade miniatura 4×5 de todos os 20 clubes
- Destaque visual no clube atual

**Mobile:** mesmo popover em bottom sheet, com lista vertical.

### 8.3 Copiar link

Botão dedicado no menu `⋯` de cada bloco. Ao clicar:
- Copia URL atual completo (com todos os query params)
- Exibe toast por 2s: "✓ Link copiado"

### 8.4 Exportação visual

**PNG (Blocos 1–4):**
- Formato 1200×675 (16:9, compatível com redes sociais).
- Header: escudo + nome do clube + contexto ("Rodada 12 · vs Flamengo 0×2") + qualidade/métrica aberta.
- Footer: `laboratorio-match-analysis · Z-score Brasileirão Série A 2026 · DD/MM/YYYY`.
- Fundo: tema dark do app, sem elementos de UI (sem sidebar, sem botões).

**PDF (Bloco 5 e Estilo):**
- A4 retrato, 1 página.
- Cabeçalho colorido com escudo + clube + tipo de análise + local.
- Corpo: chips de inputs + texto formatado.
- Rodapé: data de geração, modelo LLM.

**NUNCA exportar CSV, JSON ou dados estruturados.** Esta é uma constraint absoluta do projeto — ver `memory/feedback_no_data_export.md`.

### 8.5 Tooltip de métrica

- **Passivo (hover/long-press):** nome da métrica no gráfico mostra definição de 1 linha de `context.csv` / `context_style.csv`.
- **Ativo (ícone `(i)`):** popover maior com:
  - Definição técnica completa
  - "Como ler": ex. "Z-score > 0 significa desempenho acima da média da Série A."
  - Link "Ver no glossário →"

### 8.6 Seletor de jogo (Bloco 1)

- Input com autocomplete + dropdown.
- Setas teclado ↑↓ navegam opções; Enter seleciona.
- Bolinha colorida à esquerda de cada opção: 🟢 vitória · 🟡 empate · 🔴 derrota (do clube em foco).
- Setas ← → externas ao input navegam jogos em ordem cronológica (anterior/próximo) sem reabrir dropdown.

---

## 9. Sistema visual

Direção: **editorial esportivo premium**, referência ESPN+ redesign. Dark-first.

### 9.1 Paleta

```css
/* Base neutra (dark editorial) */
--ink:        #0a0c0f   /* fundo principal */
--graphite:   #12161c   /* surfaces (cards, sidebar) */
--steel:      #1e2530   /* borders sutis, elevated surfaces */
--mist:       #8a9bb0   /* texto secundário, labels, chips inativos */
--snow:       #e8edf3   /* texto primário */

/* Acentos por qualidade (usados em chips, destaques, hovers) */
--q-defesa:           #57c8ff  /* azul gelo */
--q-trans-defensiva:  #7d8bff  /* índigo */
--q-trans-ofensiva:   #f5a623  /* âmbar */
--q-ataque:           #b8ff57  /* verde neon */
--q-criacao:          #ff7ad9  /* magenta */

/* Acento global do app (CTAs, cursor focal, destaque do clube no gráfico) */
--neon:       #b8ff57   /* verde neon — mesmo do Ataque */

/* Sinalização */
--success:    #4ade80
--warning:    #f5a623
--danger:     #e63946
```

Contraste texto primário sobre fundo: 14.8:1 (AAA). Acentos sobre fundo: mínimo 4.5:1 (AA).

### 9.2 Tipografia

```css
--font-display: 'Barlow Condensed', sans-serif;   /* títulos, nº, headlines */
--font-serif:   'Fraunces', serif;                /* corpo de relatórios LLM */
--font-mono:    'DM Mono', monospace;             /* tabelas de métricas, Z-scores */
--font-sans:    'Inter', sans-serif;              /* UI chrome, labels, botões */
```

Escala (desktop):
- Display XL (hero): 64px / 1.0 / 800
- Display L (h1 de página): 40px / 1.1 / 800
- Display M (h2 de bloco): 28px / 1.2 / 600
- Body: 16px / 1.5 / 400 (Inter)
- Small: 13px / 1.4 / 400 (Inter)
- Mono tabular: 14px / 1.2 / 400 (DM Mono)

Escala mobile: aplicar `clamp(min, vw, max)` para fluir. Ex: h1 = `clamp(28px, 5vw, 40px)`.

### 9.3 Espaçamento

Sistema 4px-base: `--s-1: 4px` até `--s-12: 96px`. Seções usam `--s-8 (32px)` verticalmente; conteúdo interno `--s-4 (16px)`.

### 9.4 Componentes

- **Cards:** `bg: graphite`, `border: 1px solid steel`, `radius: 8px`, `padding: s-4`.
- **Botões primários:** fundo `neon`, texto `ink`, `radius: 6px`, hover eleva 2px.
- **Botões secundários:** fundo transparente, border `steel`, texto `snow`, hover border `neon`.
- **Chips:** `bg: steel`, texto `mist`; chip ativo usa cor de qualidade.
- **Inputs:** fundo `graphite`, border `steel`, focus ring `neon`.

### 9.5 Visualizações (Vega-Lite / Altair)

- **Distribution plot:** histograma de densidade, clube selecionado como linha vertical `neon` com label. Demais clubes como dots `mist` (40% opacidade).
- **Line chart:** grid `steel` 20% opacidade, eixos `mist`, linha do clube 2px `neon`, demais 1px `mist` 30% opacidade.
- **Tooltip:** fundo `ink` 95% opacidade, border `neon`, tipografia mono para números.
- Sem gradientes decorativos; dados falam.
- Evitar arco-íris: acento por qualidade só no drill-down, nunca 5 cores simultâneas.

### 9.6 Ícones

Lucide ou Phosphor, weight regular. Tamanho 16/20/24 conforme contexto.

### 9.7 Motion

- Transições de drill-down: 150ms out / 200ms in, easing `cubic-bezier(0.2, 0, 0, 1)`.
- Hover em cards: 120ms.
- Sem animações gratuitas. Nada rodando em loop.
- `prefers-reduced-motion`: reduz todas as transições para 0ms exceto fade essencial.

### 9.8 O que **não** reprisar do protótipo antigo

- Cursor customizado (quebra acessibilidade).
- Efeitos de mix-blend-mode decorativos.
- Tipografia Playfair Italic para headlines (muito afetada — Fraunces é mais neutra).

---

## 10. Responsividade — detalhes de adaptação

Princípio: **mobile se aproxima do desktop, não o degrada.** Para cada elemento de alto risco, a adaptação é explícita.

| Elemento | Desktop | Mobile |
|---|---|---|
| Sidebar de blocos | Fixa 220px à esquerda | Sub-nav horizontal scrollable com snap + bottom nav Performance/Estilo |
| Distribution plot de 20 clubes | Full-width, labels em cada ponto notável | Scroll horizontal interno com pinch-zoom; label permanente só no clube selecionado + top/bottom 3; demais sob tap |
| Line chart de 20 clubes | Todas linhas visíveis, legenda lateral | Clube em foco + média do campeonato por default; legenda como chips colapsáveis abaixo; toque em chip adiciona/remove |
| Drill-down qualidade→métrica | Transição inline | Modo fullscreen dedicado na métrica; gesto swipe-down para voltar |
| Dropdown de jogo | Popover ancorado | Bottom sheet com busca |
| Relatório LLM | 720px de largura máxima, centralizado | Full-width com margens de 16px |
| Exportação | Menu `⋯` revela opções | Idem, em bottom sheet |

---

## 11. Estados

### 11.1 Loading

- **Dados da página do clube:** skeleton com shape da viz + placeholders de chips (linhas pulsando a 800ms).
- **LLM (Blocos 5 e Estilo):** após clique em "Gerar análise", substituir botão por progress text animado — "Analisando últimos 5 jogos…" → "Consultando modelo…" → "Formatando resposta…". Cada ~3-5s. Dá sensação de progresso.
- **Busca:** spinner de 12px dentro do input (direita).

### 11.2 Vazios e edge cases

| Caso | Tratamento |
|---|---|
| Rodada futura (Bloco 2, não jogada ainda) | Card: "Rodada X ainda não foi disputada. Ver última rodada com jogos (X-1) → [botão]" |
| Clube promovido sem 2025 (Bloco 4) | Card: "Este clube não disputou a Série A em 2025." + Toggle opcional "Comparar com média da Série A 2025" |
| Menos de 5 jogos na temporada (Blocos 3, 4, 5, Estilo) | Badge "Média móvel dos últimos {N} jogos disponíveis" ao lado do título |
| Pré-rodada 1 (início da temporada) | Home exibe: "Temporada 2026 começa em DD/MM. Enquanto isso, explore os dados de 2025 → [botão]" |
| Clube sem nenhum jogo ainda | Página do clube com card único: "Este clube ainda não jogou em 2026" + link para perfil 2025 |

### 11.3 Erro de dados

- Toast não-modal: "Não foi possível carregar os dados desta rodada. Tentar novamente".
- Bloco afetado mostra card de erro com botão "Recarregar bloco".
- Nunca derrubar a página inteira.

### 11.4 Erro de LLM

- Card em vez do relatório:
  ```
  ⚠️ Não foi possível gerar a análise agora.
  [Motivo técnico abreviado, ex: "Tempo esgotado"]
  [  Tentar novamente  ]   [  Reportar problema  ]
  ```
- Se houver um relatório gerado anteriormente **nesta sessão do browser** (in-memory, sem persistência), oferecer "Ver última análise gerada" — é a única forma de cache permitida.

### 11.5 Offline / rede

- Service worker cacheia shell + `context.csv`/`context_style.csv` para funcionamento básico.
- Banner sutil no topo: "Você está offline. Últimos dados carregados: R12." Gera PDF/PNG continua funcionando (render local).

---

## 12. Acessibilidade

- **Contraste:** texto primário AAA (14.8:1), acentos AA (≥4.5:1).
- **Navegação por teclado:**
  - `Tab` passa por top bar → context bar → sidebar → bloco → footer.
  - `/` foca busca global.
  - `←` `→` navegam rodadas/jogos quando seletor está visível.
  - `Esc` fecha popover/bottom sheet.
  - Sub-nav de blocos: setas `↑↓` navegam itens.
- **Screen readers:**
  - Cada viz tem `<title>` e `<desc>` descritivos ("Distribution plot das 5 qualidades de Vasco na rodada 12…").
  - Alt text dinâmico resume o achado principal: "Vasco está 1.2 σ acima da média em Defesa; 0.8 σ abaixo em Ataque."
  - Chips de métricas com `aria-label` completo.
- **Foco visível:** outline `neon` 2px em todos os elementos focáveis.
- **Reduced motion:** respeitado (§ 9.7).
- **Textos alternativos de escudos:** `alt="Escudo do Vasco da Gama"`.

---

## 13. Micro-copy (pt-BR)

### 13.1 CTAs principais

| Contexto | Texto |
|---|---|
| Home — buscar | "Buscar clube ou rodada…" |
| Bloco 1 — seletor de jogo | "Selecione um jogo…" |
| Bloco 5/Estilo — gerar | "Gerar análise" |
| Bloco 5/Estilo — regenerar | "Gerar nova análise" |
| Copiar link | "Copiar link desta análise" |
| Baixar PNG | "Baixar imagem (PNG)" |
| Baixar PDF | "Baixar relatório (PDF)" |
| Voltar ao drill | "← Voltar para qualidades" |

### 13.2 Tooltips de qualidade (derivados de `context.csv`)

- **Defesa:** "Como o time se organiza taticamente para evitar gols e recuperar a bola."
- **Transição defensiva:** "O que o time faz nos segundos após perder a posse de bola."
- **Transição ofensiva:** "O que o time faz nos segundos após recuperar a posse de bola."
- **Ataque:** "Como o time constrói e progride com a bola em direção ao gol adversário."
- **Criação de chances:** "A qualidade e frequência das oportunidades de gol geradas."

### 13.3 Tooltips de métrica

Usar exatamente a coluna `Definição` de `context.csv` (performance) e `context_style.csv` (estilo). Nomes das métricas seguem estritamente o que está no prompt original (pt-BR).

### 13.4 Estados

- Loading LLM: "Analisando últimos 5 jogos…" → "Consultando modelo…" → "Formatando resposta…"
- Erro LLM: "Não foi possível gerar a análise agora."
- Rodada futura: "Rodada X ainda não foi disputada."
- Sem 2025: "Este clube não disputou a Série A em 2025."

---

## 14. Exportação — escopo estrito

### 14.1 Permitido

- **PNG** de qualquer bloco 1-4 (distribution ou line chart).
- **PDF** de qualquer relatório LLM (Bloco 5, Estilo Casa, Estilo Fora).

### 14.2 PROIBIDO

- CSV de dados, em qualquer forma.
- JSON/clipboard tabular.
- API pública de dados.
- "Copiar tabela" ou "Copiar série".
- Endpoints que devolvam dados brutos paginados.

Esta restrição é **absoluta e não-negociável** para proteger o dataset. Ver `memory/feedback_no_data_export.md`.

---

## 15. Onboarding

Estratégia: **zero tour, camadas passivas.**

1. **Tooltip no hover/long-press** do nome da métrica → definição de 1 linha.
2. **Ícone `(i)`** ao lado do nome → popover com definição completa + "Como ler" + link "Ver no glossário".
3. **Página `/glossario`** acessível via footer → lista completa organizada por qualidade, com filtro e busca.
4. **Primeiro clique em qualidade:** micro-hint textual abaixo da viz ("💡 Clique em uma qualidade para ver as métricas que a compõem") que some no primeiro drill-down. Usa localStorage para lembrar.
5. **Relatórios LLM funcionam como onboarding narrativo:** para o usuário que chega sem referência, ler o relatório do clube favorito antes de mergulhar no Bloco 3 é a melhor forma de ancorar.

Nenhum modal de boas-vindas, nenhum tour guiado, nenhum coach mark intrusivo.

---

## 16. Modelo de dados (alinhamento com CSVs)

Referência rápida para implementação. Fonte: `/public/data/`.

| Arquivo | Uso no app | Colunas-chave |
|---|---|---|
| `performance_round.csv` | Blocos 2, 3 (média móvel), 4 (2026) | Z-scores vs. todos os jogos da rodada — pt-BR |
| `performance_team.csv` | Bloco 1, Bloco 5 (agregação casa/fora) | Z-scores vs. os outros jogos do próprio clube — pt-BR |
| `performance_round_2025.csv` | Bloco 4 (2025) | Mesmo schema que `performance_round.csv`, temporada 2025 |
| `performance_metrics.csv` | Hover/tooltips de Blocos 1-4: valores nominais | Nominais em EN — usar `context.csv` para mapear ao pt-BR |
| `play_style_metrics.csv` | Entrada do LLM em Estilo Casa/Fora | Nominais em EN das 26 métricas de estilo |
| `play_style2.csv` | Contexto de prompt do LLM de Estilo | Catálogo de estilos com definições |
| `context.csv` | Glossário de performance, tooltips, mapeamento pt-BR↔EN | `Atributo, Métrica, Definição` |
| `context_style.csv` | Glossário de estilo, tooltips | `Atributo, Métrica, Definição` |

**Fonte canônica de nomes de qualidades e métricas em pt-BR:** as strings usadas no prompt original (`/prompts/global.md`) são a fonte de verdade para exibição. `context.csv` é usado para mapear esses nomes às colunas EN dos arquivos de valores nominais.

**Z-score > 0 = desempenho acima da média da Série A.** Esta regra é exibida literalmente em todos os popovers `(i)`.

**Z-scores de estilo não existem e não serão calculados.** A análise de estilo usa apenas valores nominais como input direto do LLM.

**Atualização:** arquivos CSV atualizados semanalmente pelo mantenedor do projeto, commitados no repositório. Deploy na Vercel dispara rebuild automático. O app não faz fetch de APIs externas para dados estatísticos.

**LLM:** chamadas feitas via Vercel serverless function (`/api/llm/performance` e `/api/llm/style`) consumindo os CSVs do lado do servidor, com `gemini-latest` e credenciais armazenadas no env da Vercel.

---

## 17. Footer e formulário de contato

### 17.1 Footer global

Presente em todas as rotas. Desktop: 4 colunas; mobile: empilhado em coluna única.

```
┌─ PROJETO ───────────┬─ NAVEGAÇÃO ─┬─ RECURSOS ─┬─ CONTATO ──────────┐
│ Brasileirão         │ Home         │ Glossário   │ Erros, Dúvidas,    │
│ Série A             │ Clubes       │ Metodologia │ Sugestões?         │
│ Análise de Clubes   │ Última rodada│ Sobre       │                    │
│                     │              │             │ [Entre em contato] │
│ por                 │              │             │                    │
│ José Américo        │              │             │                    │
│ Antunes             │              │             │                    │
├─────────────────────┴──────────────┴─────────────┴────────────────────┤
│ © 2026 José Américo Antunes · Dados: Twelve Football / Opta · v0.1    │
│ Temporada 2026 — atualizado semanalmente                              │
└───────────────────────────────────────────────────────────────────────┘
```

- **Assinatura do autor:** "por **José Américo Antunes**" em peso 600, com cor `--snow`; o nome pode linkar para LinkedIn/site pessoal se o autor fornecer (a confirmar).
- **Copyright e crédito de dados** em linha inferior, `--mist`, fonte menor.
- **Versão do app** exibida (ex: `v0.1`) para debug e referência em reportes.

### 17.2 CTA de contato

Texto no footer:

> **Erros, Dúvidas, Sugestões?**
> [Entre em contato →]

- Desktop: abre modal overlay com o formulário (permite manter contexto da página atual).
- Mobile: navega para `/contato` (página dedicada, sem modal em mobile para melhor UX de teclado).
- Link direto `/contato` também funciona se o usuário acessar por URL.

### 17.3 Formulário de contato

Seguir o **padrão já implementado** em `D:\jose_americo\laboratorio-derivativos\src\components\landing\contact-form.tsx` (copiar estrutura, adaptar textos e tema para este app).

**Campos:**

| Campo | Tipo | Obrigatório | Placeholder |
|---|---|---|---|
| Nome | text | Não | "Seu nome (opcional)" |
| E-mail | email | Não | "seu@email.com (opcional — para resposta)" |
| Mensagem | textarea (5 linhas) | **Sim** | "Descreva o erro, dúvida ou sugestão…" |

**Estados do formulário** (igual ao laboratorio-derivativos):

- `idle`: mostra form.
- `sending`: botão desabilitado, texto "Enviando…".
- `sent`: substitui form por card verde "✓ Mensagem enviada. Obrigado pelo retorno!".
- `error`: card vermelho acima do botão "Não foi possível enviar. Tente novamente." (mantém form preenchido).

**Visual:** adapta o tema light do `laboratorio-derivativos` para o tema dark deste projeto:
- Inputs: `bg: graphite`, border `steel`, focus `neon`.
- Botão primário: `bg: neon`, `color: ink`, hover eleva 2px.
- Confirmação "sent": fundo translúcido verde-neon, border neon, ícone ✓.
- Erro: fundo translúcido scarlet, border scarlet.

**Modal desktop:** 560px de largura, centralizado, backdrop escuro 80%, fecha com X, Esc, ou clique no backdrop. Animação fade-in 150ms.

### 17.4 API route `/api/contact`

Implementação server-side (Next.js route handler), seguindo **exatamente** o padrão de `D:\jose_americo\laboratorio-derivativos\src\app\api\contact\route.ts`:

- `POST /api/contact` recebendo `{ name, email, message }`.
- Valida que `message` não é vazia (retorna 400 caso contrário).
- Lê `PUSHOVER_TOKEN` e `PUSHOVER_USER` de `process.env` (configurados no env da Vercel).
- Se credenciais ausentes → 500 com `"Serviço indisponível"`.
- Monta corpo da mensagem:
  ```
  Contato — Match Analysis Lab
  Nome: {name}
  Email: {email}

  {message}
  ```
  (omitindo linhas `Nome:` e `Email:` se vazias).
- Envia via `POST` para `https://api.pushover.net/1/messages.json` com:
  - `token`
  - `user`
  - `title: "Match Analysis Lab — Contato"`
  - `message: <corpo acima>`
- Retorna `{ ok: true }` em sucesso, `{ error: "Falha ao enviar mensagem." }` em 502 se Pushover falhar.

**Variáveis de ambiente** (a configurar no Vercel project):
- `PUSHOVER_TOKEN` — token da app Pushover do autor.
- `PUSHOVER_USER` — user key do autor.

**Segurança:**
- Sem captcha nesta versão (volume esperado baixo).
- Rate limiting via Vercel (100 req/min por IP) é suficiente como primeira defesa.
- Validação server-side: `message.trim().length > 0 && < 5000`.
- Sanitização: não interpolar HTML — a mensagem vai como texto puro para Pushover.
- Se abuso aparecer, adicionar hCaptcha ou Cloudflare Turnstile em iteração futura.

---

## 18. Ativos visuais dos clubes

### 18.1 Escudos

Localização: `D:\jose_americo\laboratorio-match-analysis\public\clubs\` → servidos em `/clubs/{filename}`.

Arquivos presentes (21 escudos + 1 capa):

```
Athletico.png         Atlético.png           Bahia.png           Botafogo.png
Brasileirão.jpg       chapecoense.png        Corinthians.png     coritiba.png
Cruzeiro.png          Flamengo.png           Fluminense.png      Grêmio.png
Internacional.png     Mirassol.png           Palmeiras.png       Red Bull Bragantino.png
remo.png              Santos.png             São Paulo.png       Vasco.png
Vitória.png
```

### 18.2 Observações e gaps

**Inconsistências de naming:**
- Uso misto de acentos (`Grêmio.png`, `São Paulo.png`, `Vitória.png`) e caixa (`chapecoense.png`, `coritiba.png`, `remo.png` em minúsculas).
- Espaços em `Red Bull Bragantino.png`.
- `Athletico.png` (sem acento) ≠ `Atlético.png` (com acento) — o primeiro é o Athletico Paranaense (que não está na Série A 2026); o segundo é o Atlético Mineiro.

**Ausências confirmadas** (clubes da Série A 2026 sem escudo no repositório):
- Ceará
- Fortaleza
- Juventude
- Sport

**Extras que não estão na Série A 2026** (provavelmente legado de temporadas anteriores):
- `Athletico.png`, `chapecoense.png`, `coritiba.png`, `remo.png`.

**Capa/banner:** O app deve ter uma landing page appealing com uma hero section que misture futebol e Analytics (um chute de um jogador mostrando a bola em direção ao gol e números e métricas matemáticas como XG e XT aparecendo ao redor da bola, por exemplo) e opening pages para cada bloco seguinte. Utile a skill HyperFrames para criar o vídeo da hero.

### 18.3 Solução proposta

Criar um **manifesto de mapeamento** canônico em `src/lib/clubs.ts` (ou equivalente) que cruza:

```typescript
{
  slug: "atletico-mg",
  displayName: "Atlético MG",
  fullName: "Clube Atlético Mineiro",
  badge: "/clubs/Atlético.png",
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
  dataTeamId: 1228,     // ← team_id dos CSVs
  dataTeamName: "Atletico MG", // ← string exata usada em team_name/clube dos CSVs
}
```

Isso centraliza:
- Correspondência entre nomes amigáveis (UI) e nomes nos CSVs (sem acento).
- Path do escudo (resolve inconsistências de filename).
- Cores primárias opcionais para destaque visual por clube (mantendo acento neon global como padrão).
- Fallback (placeholder SVG com iniciais) para os 4 clubes sem escudo até que sejam fornecidos.

### 18.4 Ação de produto

- Solicitar ao autor os 4 escudos ausentes (Ceará, Fortaleza, Juventude, Sport) em PNG transparente, idealmente 512×512.
- Padronizar filenames em kebab-case sem acentos (`atletico-mg.png`, `sao-paulo.png`) como parte de um PR de limpeza — opcional, pois o manifesto resolve o problema em código.

---

## 19. Próximos passos

1. **Validar este design.md** com stakeholder.
2. **Criar `/specs/data-schema.md`** detalhando cada coluna de cada CSV.
3. **Criar `/prompts/performance_llm.md`** e `/prompts/style_llm.md` com templates do Gemini.
4. **Escolher stack**: provável Next.js (app router) + Vega-Lite/Observable Plot + Tailwind no Vercel. Confirmar.
5. **Construir design tokens** em `tokens.json` / `tailwind.config.ts`.
6. **Prototipar Home + página do clube + Bloco 2** como vertical slice antes de replicar nos demais blocos.
7. **HyperFrames landing page** — fora do escopo deste documento, virá depois da página do app estar funcional, como entrada promocional em `/landing` ou domínio raiz.

---

## 20. Referências cruzadas

- Prompt original com qualidades/métricas: `/prompts/global.md`
- Sketch do diagrama conceitual: `/prompts/sketch.jpeg`
- Glossário pt-BR (fonte para tooltips): `/public/data/context.csv`, `/public/data/context_style.csv`
- Catálogo de estilos de jogo (input de LLM): `/public/data/play_style2.csv`
- Escudos dos clubes: `/public/clubs/*.png`
- Padrão de implementação do formulário de contato e rota Pushover: `D:\jose_americo\laboratorio-derivativos\src\components\landing\contact-form.tsx` e `D:\jose_americo\laboratorio-derivativos\src\app\api\contact\route.ts`
- Constraint de dados: `memory/feedback_no_data_export.md` (nunca exportar CSV)
