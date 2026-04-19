// src/components/blocos/estilo-body.tsx
"use client";

import { useState } from "react";
import { Loader2, Home, Plane } from "lucide-react";
import ReactMarkdown from "react-markdown";
import styleInputsJson from "@/data/compiled/style-inputs.json";
import styleDistributionJson from "@/data/compiled/style-distribution.json";
import styleMetricsMapJson from "@/data/compiled/style-metrics-map.json";
import type {
  StyleDistributionMap,
  StyleInputsMap,
} from "@/types/data";
import { StyleDistributionStrip } from "./style-distribution-strip";

type Local = "casa" | "fora";

const styleInputs = styleInputsJson as StyleInputsMap;
const styleDistribution = styleDistributionJson as StyleDistributionMap;
const styleMetricsMap = styleMetricsMapJson as Record<
  string,
  Array<{ metric: string; definition: string }>
>;

const ACCENT = "#c3f400";

export function EstiloBody({
  slug,
  clubDisplayName,
}: {
  slug: string;
  clubDisplayName: string;
}) {
  const [local, setLocal] = useState<Local>("casa");
  const [results, setResults] = useState<{ casa: string | null; fora: string | null }>({
    casa: null,
    fora: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = results[local];

  async function solicitar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/llm/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, local }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(typeof data.error === "string" ? data.error : "Falha ao gerar análise");
        return;
      }
      setResults((prev) => ({ ...prev, [local]: data.text as string }));
    } catch {
      setError("Falha de rede — verifique sua conexão");
    } finally {
      setLoading(false);
    }
  }

  function selectLocal(next: Local) {
    if (next === local) return;
    setLocal(next);
    setError(null);
  }

  function tentarNovamente() {
    setError(null);
    solicitar();
  }

  const clubInputs = styleInputs[slug];
  const localInputs = clubInputs ? clubInputs[local] : null;
  const valueByLabel = new Map<string, number>();
  if (localInputs) {
    for (const m of localInputs.metrics) valueByLabel.set(m.label, m.value);
  }

  return (
    <section className="mt-10">
      {/* Casa / Fora segmented control */}
      <div className="flex flex-col items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c4c9ac]">
          Modalidade
        </p>
        <div className="inline-flex items-center rounded-md border border-[#2d3449] bg-[#0b1326] p-1 shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
          {(
            [
              { key: "casa", label: "Casa", Icon: Home },
              { key: "fora", label: "Fora", Icon: Plane },
            ] as const
          ).map(({ key, label, Icon }) => {
            const active = key === local;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectLocal(key)}
                aria-pressed={active}
                disabled={loading}
                className={
                  "inline-flex items-center gap-2 rounded px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-60 " +
                  (active
                    ? "bg-[#c3f400] text-[#161e00] shadow-[0_0_18px_rgba(195,244,0,0.35)]"
                    : "bg-transparent text-[#c4c9ac] hover:text-[#dae2fd] hover:bg-[#171f33]")
                }
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[#c4c9ac]">
          Últimos 5 jogos {local === "casa" ? "em casa" : "fora de casa"}
        </p>
      </div>

      {/* Body: loading | text | error | solicitar button */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-[#c4c9ac]">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <span className="text-sm">Gerando análise...</span>
          </div>
        ) : error ? (
          <div className="border border-[#c72a3a]/40 bg-[#c72a3a]/10 p-4 text-[#ffb4ab]">
            <p className="text-sm">{error}</p>
            <button
              type="button"
              onClick={tentarNovamente}
              className="mt-3 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#c3f400] text-[#161e00] hover:brightness-110"
            >
              Tentar novamente
            </button>
          </div>
        ) : text ? (
          <>
            <article className="border-l-2 border-[#c3f400] bg-[#131b2e] p-6 text-base leading-relaxed text-[#dae2fd]">
              <h2 className="mb-5 text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white">
                Estilo de Jogo do{" "}
                <span className="kinetic-text-gradient">{clubDisplayName}</span>
              </h2>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h2 className="mb-4 text-2xl font-black uppercase italic tracking-tight text-white">
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className="mb-3 mt-5 text-xl font-bold uppercase tracking-tight text-[#c3f400]">
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="mb-2 mt-4 text-base font-bold uppercase tracking-widest text-[#c4c9ac]">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-white">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-[#c4c9ac]">{children}</em>,
                  ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {text}
              </ReactMarkdown>
            </article>

            {/* Collapsible detail — 26 distribution strips grouped by atributo */}
            <details className="mt-6 rounded-sm border border-[#2d3449] bg-[#0b1326]">
              <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[#c3f400] hover:text-[#abd600]">
                Ver métricas em detalhe
              </summary>
              <div className="space-y-6 border-t border-[#2d3449] p-4 md:p-6">
                {Object.entries(styleMetricsMap).map(([atributo, metrics]) => (
                  <div
                    key={atributo}
                    className="space-y-3 border-l-2 pl-4"
                    style={{ borderLeftColor: ACCENT }}
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#c3f400]">
                      {atributo}
                    </p>
                    <div className="space-y-3">
                      {metrics.map((m) => {
                        const value = valueByLabel.get(m.metric);
                        const dist = styleDistribution[m.metric];
                        if (value === undefined || !dist) return null;
                        const entries = local === "casa" ? dist.casa : dist.fora;
                        return (
                          <StyleDistributionStrip
                            key={m.metric}
                            label={m.metric}
                            value={value}
                            distribution={entries}
                            selectedSlug={slug}
                            accent={ACCENT}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={solicitar}
              disabled={loading}
              className="px-8 py-3 text-sm font-bold uppercase tracking-widest bg-[#c3f400] text-[#161e00] hover:brightness-110 disabled:opacity-60 shadow-[0_0_24px_rgba(195,244,0,0.25)]"
            >
              Solicitar análise
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
