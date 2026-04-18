// src/components/home/highlights.tsx
import Link from "next/link";
import { Shield, Zap, TrendingDown, Sparkles } from "lucide-react";
import highlights from "@/data/highlights.json";
import { bySlug } from "@/lib/clubs";

const ICON: Record<string, typeof Shield> = {
  shield: Shield,
  zap: Zap,
  "trending-down": TrendingDown,
  sparkles: Sparkles,
};

export function Highlights() {
  return (
    <section className="py-10">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-mist">Destaques da rodada</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => {
          const club = bySlug(h.club_slug);
          const Icon = ICON[h.icon] ?? Shield;
          return (
            <Link
              key={h.kind}
              href={h.deep_link}
              className="group rounded-lg border border-steel bg-graphite p-5 transition-colors hover:border-neon"
            >
              <Icon className="h-5 w-5 text-neon" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-mist">{h.title}</p>
              <p className="mt-1 font-display text-2xl font-bold text-snow">{club?.displayName ?? h.club_slug}</p>
              <p className="mt-1 font-mono text-sm text-neon">{h.metric_label}</p>
              <p className="mt-4 text-xs text-mist group-hover:text-neon">→ Ver</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
