// src/app/clube/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { ContactForm } from "@/components/site/contact-form";
import { bySlug, CLUBS } from "@/lib/clubs";

export function generateStaticParams() {
  return CLUBS.map((c) => ({ slug: c.slug }));
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = bySlug(slug);
  if (!club) notFound();

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[900px] px-6 pt-16">
        <Link href="/" className="text-sm text-neon hover:opacity-80">← Voltar para a tabela</Link>

        <div className="mt-8 flex items-center gap-6">
          {club.badge ? (
            <Image src={club.badge} alt="" width={96} height={96} />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded bg-steel font-display text-2xl font-bold text-snow">
              {club.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-mist">Brasileirão Série A · 2026</p>
            <h1 className="font-display text-5xl font-extrabold text-snow">{club.displayName}</h1>
          </div>
        </div>

        <div className="mt-14 rounded-lg border border-steel bg-graphite p-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-neon">Em construção</p>
          <h2 className="font-display text-3xl font-bold text-snow">A análise completa deste clube está sendo preparada.</h2>
          <p className="mt-4 font-serif text-lg text-mist">
            Em breve: Clube × Clube (Bloco 1), Clube na Rodada (Bloco 2), Clube na Competição (Bloco 3), 2026 × 2025 (Bloco 4), Análise de Performance por LLM (Bloco 5), e Análise de Estilo Casa / Fora.
          </p>
          <p className="mt-4 font-serif text-lg text-mist">
            Deixe seu e-mail abaixo para ser avisado quando este clube entrar no ar.
          </p>

          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
