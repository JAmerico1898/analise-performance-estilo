// src/components/blocos/bloco5-body.tsx
"use client";

import { useState } from "react";
import { Loader2, Home, Plane } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Local = "casa" | "fora";

export function Bloco5Body({
  slug,
  clubDisplayName,
}: {
  slug: string;
  clubDisplayName: string;
}) {
  const [local, setLocal] = useState<Local>("casa");
  // Session-scoped cache: results per local so switching toggles keeps text.
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
      const res = await fetch("/api/llm/performance", {
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
        <p className="text-xs text-[#3b4456]">
          Últimos 5 jogos {local === "casa" ? "em casa" : "fora de casa"}
        </p>
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
          <article className="border-l-2 border-[#c3f400] bg-white p-6 text-base leading-relaxed text-[#0b1326]">
            <h2 className="mb-5 text-2xl md:text-3xl font-black uppercase italic tracking-tight text-[#0b1326]">
              Análise de Performance do{" "}
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
                strong: ({ children }) => <strong className="font-bold text-[#0b1326]">{children}</strong>,
                em: ({ children }) => <em className="italic text-[#3b4456]">{children}</em>,
                ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {text}
            </ReactMarkdown>
          </article>
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
