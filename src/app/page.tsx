// src/app/page.tsx
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { ClubSearch } from "@/components/home/club-search";
import { Highlights } from "@/components/home/highlights";
import { ClubGrid } from "@/components/home/club-grid";
import standings from "@/data/compiled/standings.json";
import type { StandingsRow } from "@/types/data";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1280px] px-4 pt-10">
        <ClubSearch />
        <Highlights />
        <ClubGrid standings={standings as StandingsRow[]} />
      </main>
      <Footer />
    </>
  );
}
