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
        <div className="container mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-center gap-8">
          <h2 className="text-base font-black italic tracking-tighter text-[#0b1326] uppercase text-center md:text-left">
            SELECIONE SEU CLUBE
          </h2>
          <ClubSelector value={selected} onChange={setSelected} />
        </div>
      </section>

      <AnalysisCards selectedSlug={selected} />
    </>
  );
}
