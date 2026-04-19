// src/app/metodologia/page.tsx
import { TopBar } from "@/components/site/top-bar";
import { AnalysisNav } from "@/components/site/analysis-nav";
import { Footer } from "@/components/site/footer";

export const metadata = {
  title: "Metodologia · Análise",
};

export default function MetodologiaPage() {
  return (
    <>
      <TopBar />
      <AnalysisNav />
      <main className="mx-auto min-h-screen max-w-[900px] px-6 pb-20 pt-12 md:px-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight italic text-white">
          <span className="kinetic-text-gradient">Metodologia</span>
        </h1>

        <div className="mt-8 flex items-start gap-4">
          <div className="kinetic-gradient mt-2 h-1 w-16" />
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[#c4c9ac]">
            Em breve.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
