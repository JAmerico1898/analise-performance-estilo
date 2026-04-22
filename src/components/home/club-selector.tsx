// src/components/home/club-selector.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, Search } from "lucide-react";
import { CLUBS, type Club } from "@/lib/clubs";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

interface ClubSelectorProps {
  value: string | null;                    // selected slug
  onChange: (slug: string | null) => void;
}

export function ClubSelector({ value, onChange }: ClubSelectorProps) {
  const [open, setOpen] = useState(false);
  const items = useMemo<Club[]>(() => {
    const sorted = [...CLUBS].sort((a, b) =>
      normalize(a.displayName).localeCompare(normalize(b.displayName), "pt-BR"),
    );
    const vascoIdx = sorted.findIndex((c) => c.slug === "vasco-da-gama");
    if (vascoIdx > 0) {
      const [vasco] = sorted.splice(vascoIdx, 1);
      sorted.unshift(vasco);
    }
    return sorted;
  }, []);

  const selected = items.find((c) => c.slug === value) ?? null;
  const hasSelection = selected !== null;

  const inputBorder = hasSelection
    ? "border-[#444933]"
    : "border-[#c3f400]/70 hover:border-[#c3f400] focus:border-[#c3f400]";

  return (
    <Combobox.Root
      items={items}
      value={selected}
      onValueChange={(v) => onChange((v as Club | null)?.slug ?? null)}
      open={open}
      onOpenChange={setOpen}
      openOnInputClick
      itemToStringLabel={(c: Club) => c.displayName}
      itemToStringValue={(c: Club) => c.slug}
      isItemEqualToValue={(a: Club, b: Club) => a.slug === b.slug}
    >
      <Combobox.InputGroup className="relative w-full max-w-md">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#c3f400]/80 z-10">
          <Search className="size-4" aria-hidden />
        </div>
        <Combobox.Input
          placeholder="Escolha um clube…"
          aria-label="Buscar clube"
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          className={`relative w-full bg-[#0b1326] border-2 ${inputBorder} text-[#dae2fd] text-sm rounded-md py-2.5 pl-10 pr-10 focus:outline-none cursor-pointer font-bold tracking-tight placeholder:text-[#c4c9ac]/70 transition-colors duration-300`}
        />
        {!hasSelection && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-md overflow-hidden z-[5]"
          >
            <div className="club-shimmer-sweep absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-[#c3f400]/35 to-transparent" />
          </div>
        )}
        <Combobox.Trigger
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#c3f400] hover:text-[#c3f400] transition-colors z-10"
          aria-label="Abrir lista de clubes"
        >
          <ChevronDown className="size-5" aria-hidden />
        </Combobox.Trigger>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="z-50 outline-none">
          <Combobox.Popup className="bg-white border border-[#e5e7eb] rounded-sm shadow-[0_20px_50px_rgba(11,19,38,0.18)] max-h-80 overflow-y-auto w-[var(--anchor-width)] min-w-[280px] py-1 outline-none">
            <Combobox.Empty className="px-4 py-3 text-sm text-[#3b4456]">
              Nenhum clube encontrado.
            </Combobox.Empty>
            <Combobox.List>
              {(club: Club) => (
                <Combobox.Item
                  key={club.slug}
                  value={club}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer text-[#0b1326] data-[highlighted]:bg-[#f3f4f6] data-[selected]:text-[#556b00] outline-none"
                >
                  {club.badge ? (
                    <Image src={club.badge} alt="" width={24} height={24} className="shrink-0" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-[#f3f4f6] text-[10px] font-bold text-[#3b4456]">
                      {club.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="flex-1 truncate text-sm font-medium">{club.displayName}</span>
                  <Combobox.ItemIndicator>
                    <Check className="size-4 text-[#556b00]" aria-hidden />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
