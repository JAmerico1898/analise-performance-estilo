// src/components/home/landing-body.tsx
"use client";

import { useState } from "react";
import { ClubSelector } from "./club-selector";
import { AnalysisCards } from "./analysis-cards";

export function LandingBody() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <section
        id="selector"
        className="py-12 bg-[#f3f4f6] border-y border-[#e5e7eb]"
      >
        <div className="container mx-auto px-6 md:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl bg-[#0b1326] shadow-[0_20px_50px_-20px_rgba(11,19,38,0.45)] ring-1 ring-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
              <h2 className="text-sm md:text-base font-black italic tracking-tighter text-slate-300 uppercase text-center md:text-left shrink-0">
                SELECIONE SEU CLUBE
              </h2>
              <ClubSelector value={selected} onChange={setSelected} />
            </div>
          </div>
        </div>
      </section>

      <AnalysisCards selectedSlug={selected} />
    </>
  );
}
