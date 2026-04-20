// src/app/clube/[slug]/page.tsx
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

const ANALYSES = [
  {
    href: (slug: string) => `/clube/${slug}/performance/bloco-1`,
    kicker: "Bloco 1",
    title: "Clube × Clube",
    description: "Comparação do jogo selecionado com os demais jogos do próprio clube na competição.",
    accent: "#63f7ff",
  },
  {
    href: (slug: string) => `/clube/${slug}/performance/bloco-2`,
    kicker: "Bloco 2",
    title: "Na Rodada",
    description: "Compara a partida escolhida da equipe com as demais partidas da mesma rodada.",
    accent: "#abd600",
  },
  {
    href: (slug: string) => `/clube/${slug}/performance/bloco-3`,
    kicker: "Bloco 3",
    title: "Na Competição",
    description: "Compara o desempenho da equipe com as demais, via média móvel de 5 jogos.",
    accent: "#c3f400",
  },
  {
    href: (slug: string) => `/clube/${slug}/performance/bloco-4`,
    kicker: "Bloco 4",
    title: "2026 × 2025",
    description: "Compara o desempenho de 2026 com 2025, via média móvel de 5 jogos.",
    accent: "#00f4fe",
  },
  {
    href: (slug: string) => `/clube/${slug}/performance/bloco-5`,
    kicker: "Bloco 5",
    title: "Análise LLM",
    description: "Relatório gerado a partir das 6 métricas de maior e menor destaque.",
    accent: "#c3f400",
  },
  {
    href: (slug: string) => `/clube/${slug}/estilo`,
    kicker: "Estilo",
    title: "Estilo de Jogo",
    description: "Identifica o estilo predominante nos últimos 5 jogos em casa ou fora.",
    accent: "#abd600",
  },
];

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = bySlug(slug);
  if (!club) notFound();

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1100px] px-6 md:px-8 pt-12 pb-20 min-h-screen">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-[#556b00] hover:brightness-110"
        >
          ← Voltar
        </Link>

        <header className="mt-8 flex items-center gap-6">
          {club.badge ? (
            <Image src={club.badge} alt="" width={96} height={96} />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded bg-[#f3f4f6] text-2xl font-bold text-[#0b1326]">
              {club.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#3b4456]">Brasileirão Série A · 2026</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight italic text-[#0b1326]">{club.displayName}</h1>
          </div>
        </header>

        <div className="mt-8 flex items-start gap-4">
          <div className="kinetic-gradient mt-2 h-1 w-16" />
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[#3b4456]">
            Escolha a análise que responde à sua pergunta — do jogo específico à
            trajetória na competição e ao estilo de jogo do clube.
          </p>
        </div>

        <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ANALYSES.map((a) => (
            <Link
              key={a.title}
              href={a.href(club.slug)}
              className="group relative flex flex-col gap-4 border-l-2 bg-white p-6 transition-colors hover:bg-[#f3f4f6]"
              style={{ borderLeftColor: a.accent }}
            >
              <div className="flex items-start justify-between">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: a.accent }}
                >
                  {a.kicker}
                </p>
                <ArrowUpRight
                  className="size-4 opacity-70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  style={{ color: a.accent }}
                  aria-hidden
                />
              </div>

              <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#0b1326]">
                {a.title}
              </h2>

              <p className="text-sm leading-relaxed text-[#3b4456]">
                {a.description}
              </p>

              <p
                className="mt-auto font-mono text-xs font-bold uppercase tracking-widest"
                style={{ color: a.accent }}
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
