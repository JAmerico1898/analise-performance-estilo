// src/app/clube/[slug]/performance/bloco-1/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/top-bar";
import { AnalysisNav } from "@/components/site/analysis-nav";
import { Footer } from "@/components/site/footer";
import { Bloco1Body } from "@/components/blocos/bloco1-body";
import { bySlug, CLUBS } from "@/lib/clubs";
import performanceTeam from "@/data/compiled/performance-team.json";
import type { PerformanceTeamRow } from "@/types/data";

export function generateStaticParams() {
  return CLUBS.map((c) => ({ slug: c.slug }));
}

export default async function Bloco1Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = bySlug(slug);
  if (!club) notFound();

  const all = performanceTeam as PerformanceTeamRow[];
  const games = all
    .filter((r) => r.clube === club.csvName)
    .sort((a, b) => a.rodada - b.rodada);

  if (games.length === 0) notFound();

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
              {club.displayName} · Performance · Bloco 1
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight italic text-[#0b1326]">
              <span className="kinetic-text-gradient">Clube vs Clube</span>
            </h1>
          </div>
        </header>

        <p className="mt-4 max-w-2xl text-xs md:text-sm leading-snug text-[#3b4456]">
          Compare um jogo específico da equipe com todos os demais jogos do próprio clube na competição, qualidade por qualidade.
        </p>

        <Bloco1Body games={games} />
      </main>
      <Footer />
    </>
  );
}
