// src/components/home/club-selector.tsx
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, Search } from "lucide-react";
import { CLUBS, type Club } from "@/lib/clubs";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

interface ClubSelectorProps {
  value: string | null;                    // selected slug
  onChange: (slug: string | null) => void;
}

export function ClubSelector({ value, onChange }: ClubSelectorProps) {
  const items = useMemo<Club[]>(() => {
    // Sort alphabetically by displayName (pt-BR locale, ignoring accents for ordering)
    return [...CLUBS].sort((a, b) =>
      normalize(a.displayName).localeCompare(normalize(b.displayName), "pt-BR"),
    );
  }, []);

  const selected = items.find((c) => c.slug === value) ?? null;

  return (
    <Combobox.Root
      items={items}
      value={selected}
      onValueChange={(v) => onChange((v as Club | null)?.slug ?? null)}
      itemToStringLabel={(c: Club) => c.displayName}
      itemToStringValue={(c: Club) => c.slug}
      isItemEqualToValue={(a: Club, b: Club) => a.slug === b.slug}
    >
      <Combobox.InputGroup className="relative w-full max-w-md">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#c4c9ac]">
          <Search className="size-4" aria-hidden />
        </div>
        <Combobox.Input
          placeholder="Escolha um clube…"
          aria-label="Buscar clube"
          className="w-full bg-[#222a3d] border border-[#444933]/50 text-white rounded-sm py-4 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-[#c3f400] focus:border-transparent cursor-pointer font-bold tracking-tight placeholder:text-[#c4c9ac]/60"
        />
        <Combobox.Trigger
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#c3f400] hover:text-[#abd600] transition-colors"
          aria-label="Abrir lista de clubes"
        >
          <ChevronDown className="size-5" aria-hidden />
        </Combobox.Trigger>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="z-50 outline-none">
          <Combobox.Popup className="bg-[#171f33] border border-[#444933]/50 rounded-sm shadow-[0_20px_50px_rgba(6,14,32,0.6)] max-h-80 overflow-y-auto w-[var(--anchor-width)] min-w-[280px] py-1 outline-none">
            <Combobox.Empty className="px-4 py-3 text-sm text-[#c4c9ac]">
              Nenhum clube encontrado.
            </Combobox.Empty>
            <Combobox.List>
              {(club: Club) => (
                <Combobox.Item
                  key={club.slug}
                  value={club}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer text-[#dae2fd] data-[highlighted]:bg-[#222a3d] data-[selected]:text-[#c3f400] outline-none"
                >
                  {club.badge ? (
                    <Image src={club.badge} alt="" width={24} height={24} className="shrink-0" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-[#2d3449] text-[10px] font-bold text-[#c4c9ac]">
                      {club.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="flex-1 truncate text-sm font-medium">{club.displayName}</span>
                  <Combobox.ItemIndicator>
                    <Check className="size-4 text-[#c3f400]" aria-hidden />
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
