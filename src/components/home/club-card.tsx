// src/components/home/club-card.tsx
import Link from "next/link";
import Image from "next/image";
import type { Club } from "@/lib/clubs";
import type { StandingsRow } from "@/types/data";

function formChip(z: number): { label: string; className: string } {
  if (z > 0.3) return { label: "↑ em alta", className: "bg-success/15 text-success" };
  if (z < -0.3) return { label: "↓ em queda", className: "bg-danger/15 text-danger" };
  return { label: "→ estável", className: "bg-steel text-mist" };
}

export function ClubCard({ club, row }: { club: Club; row: StandingsRow | undefined }) {
  const form = formChip(row?.forma_z_media_ultimos_5 ?? 0);
  return (
    <Link
      href={`/clube/${club.slug}`}
      className="group flex flex-col items-center gap-2 rounded-lg border border-steel bg-graphite p-5 text-center transition-all hover:-translate-y-1 hover:border-neon"
    >
      <div className="flex h-16 w-16 items-center justify-center">
        {club.badge ? (
          <Image src={club.badge} alt={club.displayName} width={64} height={64} />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded bg-steel font-display text-lg font-bold text-snow">
            {club.displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <p className="font-display text-lg font-bold text-snow">{club.displayName}</p>
      <p className="font-mono text-xs text-mist">
        {row ? `${row.posicao}º · ${row.pontos} pts` : "—"}
      </p>
      <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${form.className}`}>{form.label}</span>
    </Link>
  );
}
