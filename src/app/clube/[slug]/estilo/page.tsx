// src/app/clube/[slug]/estilo/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/top-bar";
import { AnalysisNav } from "@/components/site/analysis-nav";
import { Footer } from "@/components/site/footer";
import { EstiloBody } from "@/components/blocos/estilo-body";
import { bySlug, CLUBS } from "@/lib/clubs";

export function generateStaticParams() {
  return CLUBS.map((c) => ({ slug: c.slug }));
}

export default async function EstiloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = bySlug(slug);
  if (!club) notFound();

  return (
    <>
      <TopBar />
      <AnalysisNav slug={club.slug} />
      <main className="mx-auto min-h-screen max-w-[1100px] px-6 pb-20 pt-12 md:px-8">
        <Link
          href={`/clube/${club.slug}`}
          className="text-sm font-bold uppercase tracking-widest text-[#c3f400] hover:brightness-110"
        >
          ← {club.displayName}
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
              {club.displayName} · Estilo
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight italic text-white">
              Análise de <span className="kinetic-text-gradient">Estilo de Jogo</span>
            </h1>
          </div>
        </header>

        <div className="mt-8 flex items-start gap-4">
          <div className="kinetic-gradient mt-2 h-1 w-16" />
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[#c4c9ac]">
            Identifica o estilo predominante do clube a partir dos últimos 5 jogos em casa
            ou fora de casa, com foco em padrões defensivos, ofensivos e de construção.
          </p>
        </div>

        <EstiloBody slug={club.slug} clubDisplayName={club.displayName} />
      </main>
      <Footer />
    </>
  );
}
