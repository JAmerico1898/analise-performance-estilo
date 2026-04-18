// src/app/landing/page.tsx
import { Hero } from "@/components/landing/hero";
import { WhatYouFind } from "@/components/landing/what-you-find";
import { WhoAnalyzes } from "@/components/landing/who-analyzes";
import { HowToUse } from "@/components/landing/how-to-use";
import { Footer } from "@/components/site/footer";

export const metadata = {
  title: "Brasileirão Série A · Análise de Clubes",
  description: "Análise editorial honesta dos 20 clubes da Série A 2026.",
};

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <WhatYouFind />
      <WhoAnalyzes />
      <HowToUse />
      <Footer />
    </main>
  );
}
