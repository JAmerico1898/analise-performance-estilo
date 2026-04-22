"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClubSelector } from "@/components/home/club-selector";

type Tab = {
  label: string;
  segment:
    | "performance/bloco-1"
    | "performance/bloco-2"
    | "performance/bloco-3"
    | "performance/bloco-4"
    | "performance/bloco-5"
    | "estilo";
};

const TABS: Tab[] = [
  { label: "Clube × Clube", segment: "performance/bloco-1" },
  { label: "Na Rodada", segment: "performance/bloco-2" },
  { label: "Na Competição", segment: "performance/bloco-3" },
  { label: "2026 × 2025", segment: "performance/bloco-4" },
  { label: "Análise LLM", segment: "performance/bloco-5" },
  { label: "Estilo de Jogo", segment: "estilo" },
];

const STORAGE_KEY = "lma:last-club-slug";

function slugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/clube\/([^/]+)(?:\/|$)/);
  return m ? m[1] : null;
}

function segmentFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/clube\/[^/]+\/(performance\/bloco-[1-5]|estilo)/);
  return m ? m[1] : null;
}

export function TopBar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);
  const [storedSlug, setStoredSlug] = useState<string | null>(null);

  const pathSlug = slugFromPath(pathname);
  const active = segmentFromPath(pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathSlug) {
      try {
        window.localStorage.setItem(STORAGE_KEY, pathSlug);
      } catch {}
    } else {
      try {
        setStoredSlug(window.localStorage.getItem(STORAGE_KEY));
      } catch {}
    }
  }, [pathSlug]);

  const effectiveSlug = pathSlug ?? storedSlug ?? null;

  function handleClubChange(nextSlug: string | null) {
    if (!nextSlug) return;
    setOpen(false);
    if (pendingTab) {
      const href = `/clube/${nextSlug}/${pendingTab.segment}`;
      setPendingTab(null);
      router.push(href);
      return;
    }
    if (nextSlug === pathSlug) return;
    if (pathSlug) {
      const nextPath = pathname.replace(/^\/clube\/[^/]+/, `/clube/${nextSlug}`);
      router.push(nextPath);
    } else {
      router.push(`/clube/${nextSlug}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0_8px_24px_rgba(6,14,32,0.35)]">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 md:px-8">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-xs md:text-sm font-black tracking-tight leading-none"
        >
          <span className="italic tracking-tighter text-[#556b00]">Brasileirão</span>
          <span className="text-[#0b1326]"> Série A · Análise</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = active === t.segment;
            const className =
              "whitespace-nowrap px-2.5 py-2 text-[11px] md:text-xs font-bold uppercase tracking-tight transition-colors " +
              (isActive
                ? "text-[#556b00] border-b-2 border-[#c3f400]"
                : "text-[#3b4456] hover:text-[#556b00] border-b-2 border-transparent");

            if (effectiveSlug) {
              const href = `/clube/${effectiveSlug}/${t.segment}`;
              return (
                <Link key={t.segment} href={href} className={className}>
                  {t.label}
                </Link>
              );
            }
            return (
              <button
                key={t.segment}
                type="button"
                onClick={() => {
                  setPendingTab(t);
                  setOpen(true);
                }}
                className={className}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border border-[#c3f400]/40 px-3 py-1.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-[#556b00] hover:bg-[#c3f400]/10 transition-colors"
              />
            }
          >
            {effectiveSlug ? "Trocar clube" : "Escolher clube"}
            <ChevronDown className="size-3.5" aria-hidden />
          </DialogTrigger>
          <DialogContent className="bg-white text-[#0b1326] ring-1 ring-[#e5e7eb] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#0b1326]">
                {pendingTab ? "Escolha um clube para abrir" : "Analisar outro clube"}
              </DialogTitle>
            </DialogHeader>
            <div className="pt-2">
              <ClubSelector value={effectiveSlug} onChange={handleClubChange} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
