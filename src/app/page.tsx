// src/app/page.tsx
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/home/hero";
import { LandingBody } from "@/components/home/landing-body";
import { MatchDynamics } from "@/components/home/match-dynamics";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <main className="bg-white text-[#0b1326]">
        <Hero />
        <LandingBody />
        <MatchDynamics />
      </main>
      <Footer />
    </>
  );
}
