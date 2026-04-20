// src/components/site/top-bar.tsx
import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0_8px_24px_rgba(6,14,32,0.35)]">
      <div className="mx-auto flex h-[1cm] max-w-[1280px] items-center px-6 md:px-8">
        <Link href="/" className="text-xs md:text-sm font-black tracking-tight leading-none">
          <span className="italic tracking-tighter text-[#556b00]">Brasileirão</span>
          <span className="text-[#0b1326]"> Série A · Análise</span>
        </Link>
      </div>
    </header>
  );
}
