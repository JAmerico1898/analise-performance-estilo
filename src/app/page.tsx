// src/app/page.tsx
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { ClubSearch } from "@/components/home/club-search";
import { Highlights } from "@/components/home/highlights";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1280px] px-4 pt-10">
        <ClubSearch />
        <Highlights />
      </main>
      <Footer />
    </>
  );
}
