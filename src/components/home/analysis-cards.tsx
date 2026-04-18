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
    <section id="analise" className="py-12 md:py-16 bg-[#060e20]">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            const content = (
              <div
                className={[
                  "p-8 bg-[#131b2e] border-l-4 border-[#c3f400] rounded-sm group transition-colors h-full flex flex-col",
                  enabled ? "hover:bg-[#222a3d]" : "opacity-50 cursor-not-allowed",
                ].join(" ")}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">
                    {c.title}
                  </h3>
                  <Icon className="size-6 text-[#c3f400] shrink-0" aria-hidden />
                </div>
                <p className="text-[#c4c9ac] text-base leading-relaxed flex-1">{c.description}</p>
                <div className="mt-6 flex items-center gap-2 text-[#c3f400] font-bold text-xs uppercase tracking-widest">
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
