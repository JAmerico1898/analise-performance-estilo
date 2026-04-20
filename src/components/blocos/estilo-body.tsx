// src/components/blocos/estilo-body.tsx
"use client";

import { useState } from "react";
import { Loader2, Home, Plane } from "lucide-react";
import ReactMarkdown from "react-markdown";
import styleInputsJson from "@/data/compiled/style-inputs.json";
import { sanitizePartida, formatDate } from "./distribution-strip";
import styleDistributionJson from "@/data/compiled/style-distribution.json";
import type { StyleDistributionMap, StyleInputsMap } from "@/types/data";
import { StyleDistributionStrip } from "./style-distribution-strip";

type Local = "casa" | "fora";

const styleInputs = styleInputsJson as StyleInputsMap;
const styleDistribution = styleDistributionJson as StyleDistributionMap;

const ACCENT_MELHORES = "#c3f400";
const ACCENT_PIORES = "#ffb94d";

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

  return (
    <section className="mt-10">
      {/* Casa / Fora segmented control */}
      <div className="flex flex-col items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#3b4456]">
          Modalidade
        </p>
        <div className="inline-flex items-center rounded-md border border-[#e5e7eb] bg-white p-1 shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
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
                    : "bg-transparent text-[#3b4456] hover:text-[#556b00] hover:bg-[#f3f4f6]")
                }
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
        {localInputs && localInputs.games.length > 0 ? (
          <div className="mt-2 w-full max-w-xl overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="border-b border-[#e5e7eb] bg-white px-4 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#556b00]">
                Últimos 5 jogos {local === "casa" ? "em casa" : "fora de casa"}
              </p>
            </div>
            <ul className="divide-y divide-[#e5e7eb]">
              {localInputs.games.map((g) => {
                const match = sanitizePartida(g.partida);
                const m = match.match(/^(.+?)\s+(\d+)\s*x\s*(\d+)\s+(.+)$/);
                return (
                  <li
                    key={`${g.rodada}-${g.partida}`}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <span className="inline-flex h-7 min-w-[2.75rem] items-center justify-center rounded bg-[#f3f4f6] px-2 font-mono text-[11px] font-bold text-[#556b00]">
                      R{g.rodada}
                    </span>
                    <span className="whitespace-nowrap font-mono text-[11px] tabular text-[#3b4456]">
                      {formatDate(g.data)}
                    </span>
                    {m ? (
                      <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-sm text-[#0b1326]">
                        <span className="truncate text-right">{m[1]}</span>
                        <span className="inline-flex items-center gap-1 rounded border border-[#e5e7eb] bg-white px-2 py-0.5 font-mono text-xs font-bold tabular text-[#0b1326]">
                          <span>{m[2]}</span>
                          <span className="text-[#3b4456]">x</span>
                          <span>{m[3]}</span>
                        </span>
                        <span className="truncate">{m[4]}</span>
                      </span>
                    ) : (
                      <span className="flex-1 text-right text-sm text-[#0b1326]">
                        {match}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Body: loading | text | error | solicitar button */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-[#3b4456]">
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
            <article className="border-l-2 border-[#c3f400] bg-white p-6 text-base leading-relaxed text-[#0b1326]">
              <h2 className="mb-5 text-2xl md:text-3xl font-black uppercase italic tracking-tight text-[#0b1326]">
                Estilo de Jogo do{" "}
                <span className="kinetic-text-gradient">{clubDisplayName}</span>
              </h2>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h2 className="mb-4 text-2xl font-black uppercase italic tracking-tight text-[#0b1326]">
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className="mb-3 mt-5 text-xl font-bold uppercase tracking-tight text-[#556b00]">
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="mb-2 mt-4 text-base font-bold uppercase tracking-widest text-[#3b4456]">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#0b1326]">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-[#3b4456]">{children}</em>,
                  ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {text}
              </ReactMarkdown>
            </article>

            {localInputs ? (
              <details className="mt-6 rounded-sm border border-[#e5e7eb] bg-white">
                <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-[#556b00] hover:text-[#556b00]">
                  Ver métricas em detalhe
                </summary>
                <div className="border-t border-[#e5e7eb] p-4 md:p-6">
                  <section>
                    <p className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-[#556b00]">
                      Destaques acima da média da liga
                    </p>
                    <div className="space-y-3">
                      {localInputs.melhores.map((h) => {
                        const dist = styleDistribution[h.label];
                        if (!dist) return null;
                        const entries = local === "casa" ? dist.casa : dist.fora;
                        return (
                          <StyleDistributionStrip
                            key={h.label}
                            label={h.label}
                            value={h.value}
                            rank={h.rank}
                            distribution={entries}
                            selectedSlug={slug}
                            accent={ACCENT_MELHORES}
                          />
                        );
                      })}
                    </div>
                  </section>

                  <section className="mt-8">
                    <p className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-[#ffb94d]">
                      Destaques abaixo da média da liga
                    </p>
                    <div className="space-y-3">
                      {localInputs.piores.map((h) => {
                        const dist = styleDistribution[h.label];
                        if (!dist) return null;
                        const entries = local === "casa" ? dist.casa : dist.fora;
                        return (
                          <StyleDistributionStrip
                            key={h.label}
                            label={h.label}
                            value={h.value}
                            rank={h.rank}
                            distribution={entries}
                            selectedSlug={slug}
                            accent={ACCENT_PIORES}
                          />
                        );
                      })}
                    </div>
                  </section>
                </div>
              </details>
            ) : null}
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
