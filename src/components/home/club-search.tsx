// src/components/home/club-search.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CLUBS } from "@/lib/clubs";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function ClubSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const n = normalize(q);
    return CLUBS.filter((c) => normalize(c.displayName).includes(n)).slice(0, 8);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        (ref.current?.querySelector("input") as HTMLInputElement | null)?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar clube…  (tecle /)"
        className="w-full rounded-md border border-steel bg-graphite px-5 py-4 font-display text-xl text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-steel bg-graphite shadow-xl">
          {results.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/clube/${c.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-steel"
              >
                {c.badge ? (
                  <Image src={c.badge} alt="" width={28} height={28} />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-steel text-xs font-bold text-mist">
                    {c.displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="text-snow">{c.displayName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
