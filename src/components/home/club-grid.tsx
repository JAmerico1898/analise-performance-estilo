// src/components/home/club-grid.tsx
import { CLUBS, byCsvName } from "@/lib/clubs";
import type { StandingsRow } from "@/types/data";
import { ClubCard } from "./club-card";

export function ClubGrid({ standings }: { standings: StandingsRow[] }) {
  const byTeam = new Map<string, StandingsRow>(standings.map((s) => [s.clube, s]));
  const ordered = [...standings].sort((a, b) => a.posicao - b.posicao);

  return (
    <section className="py-10">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-mist">Tabela · Brasileirão Série A</p>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {ordered.map((row) => {
          const club = byCsvName(row.clube);
          if (!club) return null;
          return <ClubCard key={club.slug} club={club} row={row} />;
        })}
      </div>
    </section>
  );
}
