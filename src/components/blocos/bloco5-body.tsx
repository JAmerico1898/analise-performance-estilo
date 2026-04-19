// src/components/blocos/bloco5-body.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Local = "casa" | "fora";

export function Bloco5Body({ slug }: { slug: string }) {
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
      {/* Casa / Fora toggle */}
      <div className="flex gap-2">
        {(["casa", "fora"] as const).map((l) => {
          const active = l === local;
          const label = l === "casa" ? "Casa" : "Fora";
          return (
            <button
              key={l}
              type="button"
              onClick={() => selectLocal(l)}
              className={
                active
                  ? "px-5 py-2 text-sm font-bold uppercase tracking-widest bg-[#c3f400] text-[#161e00]"
                  : "px-5 py-2 text-sm font-bold uppercase tracking-widest bg-[#131b2e] text-[#dae2fd] border border-[#2d3449] hover:bg-[#171f33]"
              }
              aria-pressed={active}
              disabled={loading}
            >
              {label}
            </button>
          );
        })}
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
          <article className="border-l-2 border-[#c3f400] bg-[#131b2e] p-6">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-[#dae2fd]">
              {text}
            </p>
          </article>
        ) : (
          <button
            type="button"
            onClick={solicitar}
            disabled={loading}
            className="px-6 py-3 text-sm font-bold uppercase tracking-widest bg-[#c3f400] text-[#161e00] hover:brightness-110 disabled:opacity-60"
          >
            Solicitar análise
          </button>
        )}
      </div>
    </section>
  );
}
