// src/app/glossario/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import ReactMarkdown from "react-markdown";
import { TopBar } from "@/components/site/top-bar";
import { AnalysisNav } from "@/components/site/analysis-nav";
import { Footer } from "@/components/site/footer";

interface Row {
  Atributo: string;
  Métrica: string;
  Definição: string;
}

interface Group {
  qualidade: string;
  intro: string;
  metrics: { metrica: string; definicao: string }[];
}

async function loadCsv(filename: string): Promise<Group[]> {
  const filePath = path.join(process.cwd(), "public", "data", filename);
  const content = await fs.readFile(filePath, "utf8");
  const parsed = Papa.parse<Row>(content, {
    header: true,
    skipEmptyLines: true,
  });
  const groups = new Map<string, Group>();
  for (const r of parsed.data) {
    const q = (r.Atributo || "").trim();
    if (!q) continue;
    const metrica = (r.Métrica || "").trim();
    const definicao = (r.Definição || "").trim();
    if (!groups.has(q)) {
      groups.set(q, { qualidade: q, intro: "", metrics: [] });
    }
    const g = groups.get(q)!;
    if (!metrica) {
      g.intro = definicao;
    } else {
      g.metrics.push({ metrica, definicao });
    }
  }
  return [...groups.values()];
}

function groupsToMarkdown(groups: Group[]): string {
  const parts: string[] = [];
  for (const g of groups) {
    parts.push(`## ${g.qualidade}`);
    if (g.intro) parts.push(g.intro);
    for (const m of g.metrics) {
      parts.push(`**${m.metrica}** — ${m.definicao}`);
    }
  }
  return parts.join("\n\n");
}

export const metadata = {
  title: "Glossário · Análise",
};

export default async function GlossarioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "estilo" ? "estilo" : "performance";

  const [perf, estilo] = await Promise.all([
    loadCsv("context.csv"),
    loadCsv("context_style.csv"),
  ]);

  const markdown =
    activeTab === "estilo" ? groupsToMarkdown(estilo) : groupsToMarkdown(perf);

  return (
    <>
      <TopBar />
      <AnalysisNav />
      <main className="mx-auto min-h-screen max-w-[900px] px-6 pb-20 pt-12 md:px-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight italic text-[#0b1326]">
          <span className="kinetic-text-gradient">Glossário</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-[#3b4456]">
          Definições das qualidades e métricas usadas nas análises.
        </p>

        <div className="mt-8 flex gap-1 border-b border-[#e5e7eb]/20">
          <TabLink
            href="/glossario?tab=performance"
            active={activeTab === "performance"}
            label="Performance"
          />
          <TabLink
            href="/glossario?tab=estilo"
            active={activeTab === "estilo"}
            label="Estilo de Jogo"
          />
        </div>

        <article className="mt-8 space-y-4 text-sm md:text-base leading-relaxed text-[#0b1326]">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mt-10 mb-3 text-2xl font-black uppercase italic tracking-tight text-[#0b1326]">
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed text-[#0b1326]">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-[#556b00]">{children}</strong>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </>
  );
}

function TabLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={
        "px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-tight transition-colors " +
        (active
          ? "text-[#556b00] border-b-2 border-[#c3f400]"
          : "text-[#3b4456] hover:text-[#556b00] border-b-2 border-transparent")
      }
    >
      {label}
    </a>
  );
}
