// src/components/site/top-bar.tsx
import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b1326]/80 backdrop-blur-xl bg-gradient-to-b from-[#131b2e] to-transparent shadow-[0_20px_50px_rgba(6,14,32,0.4)]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-6 md:px-8">
        <Link href="/" className="text-xl md:text-2xl font-black tracking-tight">
          <span className="italic tracking-tighter text-[#c3f400]">Brasileirão</span>
          <span className="text-white"> Série A · Análise</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-8">
          <a
            href="/#selector"
            className="font-bold uppercase text-[12px] tracking-tight text-[#c4c9ac] hover:text-white transition-colors"
          >
            Clubes
          </a>
          <a
            href="/#analise"
            className="font-bold uppercase text-[12px] tracking-tight text-[#c4c9ac] hover:text-white transition-colors"
          >
            Análise
          </a>
          <a
            href="/#dynamics"
            className="font-bold uppercase text-[12px] tracking-tight text-[#c4c9ac] hover:text-white transition-colors"
          >
            Sobre
          </a>
        </nav>
      </div>
    </header>
  );
}
