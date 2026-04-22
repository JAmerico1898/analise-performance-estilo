// src/app/api/llm/performance/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { bySlug } from "@/lib/clubs";
import { getClientIp, logLlmOrigin, rateLimit } from "@/lib/llm-protect";
import llmInputsJson from "@/data/compiled/performance-llm-inputs.json";
import qualityMetricsJson from "@/data/compiled/quality-metrics.json";
import type {
  LlmInputsMap,
  LlmLocalInputs,
  LlmStat,
  QualityMetricsMap,
} from "@/types/data";

const llmInputs = llmInputsJson as LlmInputsMap;
const qualityMetrics = qualityMetricsJson as QualityMetricsMap;

// Ordered list of the five qualities (matches the prompt's expected layout).
const QUALITY_LABELS = [
  "Defesa",
  "Transição defensiva",
  "Transição ofensiva",
  "Ataque",
  "Criação de chances",
];

/**
 * Emulates pandas `pd.Series(arr).to_string()` default formatting:
 *
 *   0  Defesa
 *   1  Transição ofensiva
 *   2  Ataque
 *   ...
 *
 * The integer index is left-padded with spaces to the width of the largest
 * index in the series (so rows align vertically), then followed by TWO spaces,
 * then the value.
 */
function seriesToString(items: string[]): string {
  if (items.length === 0) return "Series([], dtype: object)";
  const maxIdxWidth = String(items.length - 1).length;
  return items
    .map((label, i) => `${String(i).padStart(maxIdxWidth, " ")}  ${label}`)
    .join("\n");
}

/**
 * Emulates pandas DataFrame.to_string() for a Atributo/Métrica/Definição
 * table. Columns are separated by whitespace and the row index is visible.
 * The exact column widths pandas produces do not affect LLM comprehension —
 * what matters is that every row contains the three fields. We use a
 * tab-separated layout with a header row, which is unambiguous.
 */
function contextToString(qm: QualityMetricsMap): string {
  const rows: Array<{ atributo: string; metrica: string; definicao: string }> = [];
  for (const quality of QUALITY_LABELS) {
    const metrics = qm[quality] ?? [];
    for (const m of metrics) {
      rows.push({ atributo: quality, metrica: m.metric, definicao: m.definition });
    }
  }
  const header = ["Atributo", "Métrica", "Definição"].join("\t");
  const lines = rows.map((r) => [r.atributo, r.metrica, r.definicao].join("\t"));
  return [header, ...lines].join("\n");
}

function buildPrompt(
  clube: string,
  local: LlmLocalInputs,
): string {
  const attributesSorted = local.attributes.map((s: LlmStat) => s.label);
  const melhoresSorted = local.melhores.map((s: LlmStat) => s.label);
  const pioresSorted = local.piores.map((s: LlmStat) => s.label);
  const contextDf = contextToString(qualityMetrics);

  return (
    `Escreva uma análise aprofundada sobre a performance do clube ${clube} baseada nos dados fornecidos, em português brasileiro. \n\n` +
    `A análise deve contemplar: ` +
    `Análise geral sobre os atributos do clube ${clube}:\n${seriesToString(attributesSorted)}\n\n` +
    `Pontos fortes (6 métricas em z-score nas quais o clube se destacou positivamente):\n${seriesToString(melhoresSorted)}\n\n` +
    `Pontos fracos (6 métricas em z-score nas quais o clube se destacou negativamente):\n${seriesToString(pioresSorted)}\n\n` +
    `Contexto Conceitual - Atributos e Métricas:\n${contextDf}\n\n` +
    `Considere o desempenho nos atributos e a relação entre as métricas destacadas e os atributos aos quais pertencem. ` +
    `A análise deve ser bem estruturada, técnica mas compreensível e ter no máximo 250 palavras (rigorosamente). ` +
    `Use Markdown leve para estrutura: parágrafos curtos e **negrito** para destaques pontuais. Evite listas longas, tabelas e cabeçalhos. ` +
    `NÃO inclua título, cabeçalho, nem mencione o nome do clube na primeira linha — comece a análise diretamente pelo conteúdo. O título será adicionado pela interface. ` +
    `Não apresente z-scores na análise final. ` +
    `Não escreva as expressões "(ponto forte)" nem "(ponto fraco)" ao lado das métricas — são óbvias para o leitor pelo contexto.`
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    logLlmOrigin("performance", request, { blocked: "rate_limit", ip });
    return NextResponse.json(
      { error: "Muitas requisições — tente novamente em instantes" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: { slug?: unknown; local?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const local = body.local;

  logLlmOrigin("performance", request, { slug, local });

  if (!slug) {
    return NextResponse.json({ error: "Parâmetro `slug` obrigatório" }, { status: 400 });
  }
  if (local !== "casa" && local !== "fora") {
    return NextResponse.json({ error: "Parâmetro `local` inválido" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Serviço indisponível", detail: "credentials missing" },
      { status: 500 },
    );
  }

  const club = bySlug(slug);
  if (!club) {
    return NextResponse.json({ error: "Clube não encontrado" }, { status: 404 });
  }

  const clubInputs = llmInputs[slug];
  if (!clubInputs) {
    return NextResponse.json({ error: "Sem dados para esse clube" }, { status: 404 });
  }

  const localInputs = clubInputs[local];
  if (!localInputs) {
    return NextResponse.json(
      { error: "Sem jogos suficientes nessa modalidade" },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(club.displayName, localInputs);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const text = response.text ?? "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Falha ao gerar análise" },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, text });
  } catch (err) {
    console.error("[api/llm/performance] Gemini error:", err);
    return NextResponse.json(
      { error: "Falha ao gerar análise" },
      { status: 502 },
    );
  }
}
