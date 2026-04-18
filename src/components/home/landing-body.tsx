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
        className="py-12 bg-[#131b2e] border-y border-[#444933]/20"
      >
        <div className="container mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-center gap-8">
          <h2 className="text-xl font-black italic tracking-tighter text-white uppercase text-center md:text-left">
            SELECIONE SEU CLUBE
          </h2>
          <ClubSelector value={selected} onChange={setSelected} />
        </div>
      </section>

      <AnalysisCards selectedSlug={selected} />
    </>
  );
}
