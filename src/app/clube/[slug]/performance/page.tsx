// src/app/clube/[slug]/performance/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { bySlug, CLUBS } from "@/lib/clubs";

export function generateStaticParams() {
  return CLUBS.map((c) => ({ slug: c.slug }));
}

const BLOCOS = [
  {
    n: 1,
    slug: "bloco-1",
    title: "Clube vs Clube",
    description:
      "Comparação do jogo selecionado em relação aos demais jogos da equipe na competição.",
    accent: "#63f7ff",
  },
  {
    n: 2,
    slug: "bloco-2",
    title: "Clube na Rodada",
    description:
      "Comparar a partida escolhida da equipe com as demais partidas da mesma rodada na competição. Cada partida aparece duas vezes, destacando ora uma equipe, ora a outra.",
    accent: "#abd600",
  },
  {
    n: 3,
    slug: "bloco-3",
    title: "Clube na Competição",
    description:
      "Compara o desempenho da equipe com as demais equipes da competição, por meio de uma média móvel de 5 jogos.",
    accent: "#c3f400",
  },
  {
    n: 4,
    slug: "bloco-4",
    title: "2026 vs 2025",
    description:
      "Compara o desempenho da equipe em 2026 com seu desempenho em 2025, por meio de uma média móvel de 5 jogos.",
    accent: "#00f4fe",
  },
  {
    n: 5,
    slug: "bloco-5",
    title: "Análise por LLM",
    description:
      "Narrativa em texto sobre a performance do clube em casa e fora.",
    accent: "#c3f400",
  },
];

export default async function PerformanceOpeningPage({
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
      <main className="mx-auto max-w-[1100px] px-6 md:px-8 pt-12 pb-20 min-h-screen">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-[#c3f400] hover:brightness-110"
        >
          ← Voltar
        </Link>

        <header className="mt-8 flex items-center gap-6">
          {club.badge ? (
            <Image src={club.badge} alt="" width={88} height={88} />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded bg-[#2d3449] text-2xl font-bold text-[#dae2fd]">
              {club.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#c4c9ac]">
              Brasileirão Série A · 2026 · {club.displayName}
            </p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight italic text-white">
              Análise de{" "}
              <span className="kinetic-text-gradient">Performance</span>
            </h1>
          </div>
        </header>

        <div className="mt-8 flex items-start gap-4">
          <div className="kinetic-gradient mt-2 h-1 w-16" />
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[#c4c9ac]">
            Cinco leituras complementares do desempenho do clube. Escolha o bloco
            que responde à sua pergunta — do jogo específico à trajetória na
            competição.
          </p>
        </div>

        <section
          id="blocos"
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BLOCOS.map((bloco) => (
            <Link
              key={bloco.slug}
              href={`/clube/${club.slug}/performance/${bloco.slug}`}
              className="group relative flex flex-col gap-4 border-l-2 bg-[#131b2e] p-6 transition-colors hover:bg-[#171f33]"
              style={{ borderLeftColor: bloco.accent }}
            >
              <div className="flex items-start justify-between">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: bloco.accent }}
                >
                  Bloco {bloco.n}
                </p>
                <ArrowUpRight
                  className="size-4 opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  style={{ color: bloco.accent }}
                  aria-hidden
                />
              </div>

              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                {bloco.title}
              </h2>

              <p className="text-sm leading-relaxed text-[#c4c9ac]">
                {bloco.description}
              </p>

              <p
                className="mt-auto font-mono text-xs font-bold uppercase tracking-widest"
                style={{ color: bloco.accent }}
              >
                Abrir →
              </p>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
