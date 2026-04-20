// src/components/home/analysis-cards.tsx
"use client";

import Link from "next/link";
import { Activity, ArrowRight, LayoutGrid } from "lucide-react";

interface AnalysisCardsProps {
  selectedSlug: string | null;
}

export function AnalysisCards({ selectedSlug }: AnalysisCardsProps) {
  const enabled = Boolean(selectedSlug);
  const cards = [
    {
      key: "performance",
      title: "Análise de Performance",
      description:
        "Qualidades do jogo (defesa, transições, ataque, criação), métricas contextualizadas e comparação Clube × Clube.",
      icon: Activity,
      cta: "Ver métricas",
      href: enabled ? `/clube/${selectedSlug}/performance` : null,
    },
    {
      key: "estilo",
      title: "Análise de Estilo",
      description:
        "Padrões táticos, zonas de ocupação e comportamento coletivo em campo — diagnóstico casa × fora.",
      icon: LayoutGrid,
      cta: "Ver padrões",
      href: enabled ? `/clube/${selectedSlug}/estilo` : null,
    },
  ] as const;

  return (
    <section id="analise" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            const content = (
              <div
                className={[
                  "p-6 bg-white border border-[#e5e7eb] border-l-4 border-l-[#c3f400] rounded-sm shadow-[0_2px_14px_rgba(11,19,38,0.08)] group transition-colors h-full flex flex-col",
                  enabled ? "hover:bg-[#f9fafb]" : "cursor-not-allowed",
                ].join(" ")}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-black tracking-tight text-black uppercase italic">
                    {c.title}
                  </h3>
                  <Icon className="size-5 text-[#556b00] shrink-0" aria-hidden />
                </div>
                <p className="text-black text-sm leading-relaxed flex-1">{c.description}</p>
                <div className="mt-4 flex items-center gap-2 text-[#556b00] font-bold text-[11px] uppercase tracking-widest">
                  {enabled ? c.cta : "Selecione um clube para habilitar"}
                  {enabled && <ArrowRight className="size-4" aria-hidden />}
                </div>
              </div>
            );

            if (enabled && c.href) {
              return (
                <Link
                  key={c.key}
                  href={c.href}
                  aria-label={`${c.title} — abrir para o clube selecionado`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400] rounded-sm"
                >
                  {content}
                </Link>
              );
            }
            return (
              <div
                key={c.key}
                aria-disabled="true"
                className="block"
                title="Selecione um clube acima para habilitar"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
