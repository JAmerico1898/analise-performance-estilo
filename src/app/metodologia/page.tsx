// src/app/metodologia/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Footer } from "@/components/site/footer";

export const metadata = {
  title: "Metodologia · Análise",
};

async function loadSpec(): Promise<string> {
  const filePath = path.join(process.cwd(), "specs", "metodologia.md");
  const content = await fs.readFile(filePath, "utf8");
  // Strip the leading "# Metodologia" title — the page renders its own heading.
  return content.replace(/^#\s+Metodologia\s*\n+/, "");
}

export default async function MetodologiaPage() {
  const markdown = await loadSpec();

  return (
    <>
      <main className="mx-auto min-h-screen max-w-[900px] px-6 pb-20 pt-12 md:px-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight italic text-[#0b1326]">
          <span className="kinetic-text-gradient">Metodologia</span>
        </h1>

        <div className="mt-6 flex items-start gap-4">
          <div className="kinetic-gradient mt-2 h-1 w-16 shrink-0" />
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[#3b4456]">
            Como os dados são coletados, padronizados e agregados para compor
            as análises apresentadas no aplicativo.
          </p>
        </div>

        <article className="mt-12 space-y-5 text-sm md:text-base leading-relaxed text-[#0b1326]">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h2: ({ children }) => (
                <h2 className="mt-12 mb-4 text-2xl font-black uppercase italic tracking-tight text-[#0b1326]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-3 text-lg font-bold uppercase tracking-tight text-[#556b00]">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed text-[#0b1326]">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-[#556b00]">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-[#0b1326]">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="ml-6 list-disc space-y-2 marker:text-[#556b00]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="ml-6 list-decimal space-y-1 marker:text-[#556b00]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed text-[#0b1326]">{children}</li>
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
