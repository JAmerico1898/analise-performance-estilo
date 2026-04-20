// src/app/clube/[slug]/performance/bloco-4/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/top-bar";
import { AnalysisNav } from "@/components/site/analysis-nav";
import { Footer } from "@/components/site/footer";
import { Bloco4Body } from "@/components/blocos/bloco4-body";
import { bySlug, CLUBS } from "@/lib/clubs";
import movingAvg from "@/data/compiled/performance-moving-avg.json";
import movingAvg2025 from "@/data/compiled/performance-moving-avg-2025.json";
import type { MovingAvgDataset, MovingAvgTeamSeries } from "@/types/data";

export function generateStaticParams() {
  return CLUBS.map((c) => ({ slug: c.slug }));
}

export default async function Bloco4Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = bySlug(slug);
  if (!club) notFound();

  const dataset2026 = movingAvg as MovingAvgDataset;
  const dataset2025 = movingAvg2025 as MovingAvgDataset;

  // 2026 series — required. Match by CSV name (2026 uses the manifest csvName).
  const series2026: MovingAvgTeamSeries | null =
    dataset2026.teams.find((t) => t.clube === club.csvName) ?? null;
  if (!series2026) notFound();

  // 2025 series — optional. Match by CSV name; promoted clubs won't be found.
  const series2025: MovingAvgTeamSeries | null =
    dataset2025.teams.find((t) => t.clube === club.csvName) ?? null;

  return (
    <>
      <TopBar />
      <AnalysisNav slug={club.slug} />
      <main className="mx-auto min-h-screen max-w-[1100px] px-6 pb-20 pt-12 md:px-8">
        <Link
          href={`/clube/${club.slug}/performance`}
          className="text-sm font-bold uppercase tracking-widest text-[#556b00] hover:brightness-110"
        >
          ← Análise de Performance
        </Link>

        <header className="mt-8 flex items-center gap-6">
          {club.badge ? (
            <Image src={club.badge} alt="" width={72} height={72} />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded bg-[#f3f4f6] text-xl font-bold text-[#0b1326]">
              {club.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#3b4456]">
              {club.displayName} · Performance · Bloco 4
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight italic text-[#0b1326]">
              2026 vs <span className="kinetic-text-gradient">2025</span>
            </h1>
          </div>
        </header>

        <div className="mt-8 flex items-start gap-4">
          <div className="kinetic-gradient mt-2 h-1 w-16" />
          <p className="max-w-2xl text-xs md:text-sm leading-snug text-[#3b4456]">
            Compara o desempenho da equipe em 2026 com seu desempenho em 2025,
            por meio de uma média móvel de 3 jogos. Valores em Z-score.
          </p>
        </div>

        <Bloco4Body
          club={club}
          dataset2026={dataset2026}
          series2026={series2026}
          series2025={series2025}
        />
      </main>
      <Footer />
    </>
  );
}
