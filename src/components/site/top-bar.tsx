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

type Segment =
  | "performance/bloco-1"
  | "performance/bloco-2"
  | "performance/bloco-3"
  | "performance/bloco-4"
  | "performance/bloco-5"
  | "estilo";

type Tab = { label: string; segment: Segment };

const PERFORMANCE_TABS: Tab[] = [
  { label: "Clube × Clube", segment: "performance/bloco-1" },
  { label: "Na Rodada", segment: "performance/bloco-2" },
  { label: "Na Competição", segment: "performance/bloco-3" },
  { label: "2026 × 2025", segment: "performance/bloco-4" },
  { label: "Análise LLM", segment: "performance/bloco-5" },
];

const ESTILO_TAB: Tab = { label: "Estilo de Jogo", segment: "estilo" };

function TabGroup({
  title,
  tabs,
  active,
  effectiveSlug,
  onSelect,
}: {
  title: string;
  tabs: Tab[];
  active: string | null;
  effectiveSlug: string | null;
  onSelect: (tab: Tab) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center">
      <span className="text-center text-[9px] md:text-[10px] font-bold uppercase tracking-wider leading-none text-[#3b4456] opacity-70">
        {title}
      </span>
      <div className="flex items-center gap-0.5">
        {tabs.map((t) => {
          const isActive = active === t.segment;
          const className =
            "whitespace-nowrap px-2 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-tight leading-tight transition-colors " +
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
              onClick={() => onSelect(t)}
              className={className}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 flex-col gap-0.5 whitespace-nowrap text-[10px] md:text-xs font-black tracking-tight leading-tight"
        >
          <span>
            <span className="italic tracking-tighter text-[#556b00]">Brasileirão</span>
            <span className="text-[#0b1326]"> Série A</span>
          </span>
          <span className="text-[#0b1326]">Análise de Performance e Estilo de Jogo</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-stretch gap-6 overflow-x-auto">
          <TabGroup
            title="Análise de Performance"
            tabs={PERFORMANCE_TABS}
            active={active}
            effectiveSlug={effectiveSlug}
            onSelect={(t) => {
              setPendingTab(t);
              setOpen(true);
            }}
          />
          <TabGroup
            title="Análise de"
            tabs={[ESTILO_TAB]}
            active={active}
            effectiveSlug={effectiveSlug}
            onSelect={(t) => {
              setPendingTab(t);
              setOpen(true);
            }}
          />
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
