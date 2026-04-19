// src/app/api/llm/style/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { bySlug } from "@/lib/clubs";
import styleInputsJson from "@/data/compiled/style-inputs.json";
import styleMetricsMapJson from "@/data/compiled/style-metrics-map.json";
import styleCatalogJson from "@/data/compiled/style-catalog.json";
import type {
  StyleCatalogEntry,
  StyleInputsMap,
  StyleLocalInputs,
  StyleMetricValue,
} from "@/types/data";

const styleInputs = styleInputsJson as StyleInputsMap;
const styleMetricsMap = styleMetricsMapJson as Record<
  string,
  Array<{ metric: string; definition: string }>
>;
const styleCatalog = styleCatalogJson as StyleCatalogEntry[];

/**
 * Emulates pandas `pd.Series(arr).to_string()` default formatting:
 *
 *   0  label1
 *   1  label2
 *   ...
 */
function seriesToString(items: string[]): string {
  if (items.length === 0) return "Series([], dtype: object)";
  const maxIdxWidth = String(items.length - 1).length;
  return items
    .map((label, i) => `${String(i).padStart(maxIdxWidth, " ")}  ${label}`)
    .join("\n");
}

/**
 * Emulates pandas DataFrame.to_string() for an Atributo/Métrica/Definição
 * table. Tab-separated layout with a header row.
 */
function contextStyleToString(): string {
  const header = ["Atributo", "Métrica", "Definição"].join("\t");
  const lines: string[] = [];
  for (const [atributo, metrics] of Object.entries(styleMetricsMap)) {
    for (const m of metrics) {
      lines.push([atributo, m.metric, m.definition].join("\t"));
    }
  }
  return [header, ...lines].join("\n");
}

/**
 * Emulates pandas DataFrame.to_string() for the styles catalog.
 * Tab-separated with a header row.
 */
function catalogToString(): string {
  const header = ["estilo de jogo", "definição"].join("\t");
  const lines = styleCatalog.map((c) => [c.estilo, c.definicao].join("\t"));
  return [header, ...lines].join("\n");
}

function fmtNominal(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v - Math.round(v)) < 1e-9) return Math.round(v).toString();
  return v.toFixed(2);
}

function inferUnit(label: string): string {
  if (/\(%\)/.test(label) || /_%/.test(label)) return "%";
  if (/\(m\)/.test(label)) return "m";
  if (/\(s\)/.test(label)) return "s";
  return "";
}

function formatMetricValue(m: StyleMetricValue): string {
  const unit = inferUnit(m.label);
  const valueStr = fmtNominal(m.value);
  return `${m.label}: ${valueStr}${unit}`;
}

function buildPrompt(
  clube: string,
  local: "casa" | "fora",
  localInputs: StyleLocalInputs,
): string {
  const localDescricao = local === "casa" ? "em casa" : "fora de casa";
  const metricsSeries = localInputs.metrics.map(formatMetricValue);
  const catalogDf = catalogToString();
  const contextDf = contextStyleToString();

  return (
    `Escreva uma análise do estilo de jogo do clube ${clube} nos últimos 5 jogos ${localDescricao}, em português brasileiro.\n\n` +
    `Métricas de estilo (valores nominais médios dos últimos 5 jogos):\n${seriesToString(metricsSeries)}\n\n` +
    `Catálogo de estilos de referência:\n${catalogDf}\n\n` +
    `Contexto conceitual - Métricas de estilo:\n${contextDf}\n\n` +
    `A análise deve: (1) identificar o estilo predominante com justificativa baseada em 3-4 métricas específicas; ` +
    `(2) descrever características defensivas (pressão, altura, intensidade); ` +
    `(3) descrever características ofensivas (construção, verticalização, finalização). ` +
    `Formato: técnico mas compreensível, até 250 palavras (rigorosamente), Markdown leve com parágrafos curtos e **negrito** para destaques. ` +
    `Evite listas longas, tabelas e cabeçalhos. ` +
    `NÃO inclua título, cabeçalho, nem mencione o nome do clube na primeira linha — comece a análise diretamente pelo conteúdo. ` +
    `Não apresente valores de métricas na análise final.`
  );
}

export async function POST(request: Request) {
  let body: { slug?: unknown; local?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const local = body.local;

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

  const clubInputs = styleInputs[slug];
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

  const prompt = buildPrompt(club.displayName, local, localInputs);

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
    console.error("[api/llm/style] Gemini error:", err);
    return NextResponse.json(
      { error: "Falha ao gerar análise" },
      { status: 502 },
    );
  }
}
