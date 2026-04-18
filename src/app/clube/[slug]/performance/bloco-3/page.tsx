// src/app/clube/[slug]/performance/bloco-3/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { Bloco3Body } from "@/components/blocos/bloco3-body";
import { bySlug, CLUBS } from "@/lib/clubs";
import movingAvg from "@/data/compiled/performance-moving-avg.json";
import type { MovingAvgDataset } from "@/types/data";

export function generateStaticParams() {
  return CLUBS.map((c) => ({ slug: c.slug }));
}

export default async function Bloco3Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = bySlug(slug);
  if (!club) notFound();

  const dataset = movingAvg as MovingAvgDataset;

  return (
    <>
      <TopBar />
      <main className="mx-auto min-h-screen max-w-[1100px] px-6 pb-20 pt-12 md:px-8">
        <Link
          href={`/clube/${club.slug}/performance`}
          className="text-sm font-bold uppercase tracking-widest text-[#c3f400] hover:brightness-110"
        >
          ← Análise de Performance
        </Link>

        <header className="mt-8 flex items-center gap-6">
          {club.badge ? (
            <Image src={club.badge} alt="" width={72} height={72} />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded bg-[#2d3449] text-xl font-bold text-[#dae2fd]">
              {club.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c4c9ac]">
              {club.displayName} · Performance · Bloco 3
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight italic text-white">
              Clube na <span className="kinetic-text-gradient">Competição</span>
            </h1>
          </div>
        </header>

        <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-[#c4c9ac]">
          Compara o desempenho da equipe com as demais equipes da competição, por meio de uma média móvel de 5 jogos.
        </p>

        <Bloco3Body focusSlug={club.slug} dataset={dataset} />
      </main>
      <Footer />
    </>
  );
}
