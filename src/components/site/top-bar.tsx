// src/components/site/top-bar.tsx
import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-steel/80 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1280px] items-center gap-6 px-4">
        <Link href="/" className="font-display text-xl font-extrabold tracking-wide text-snow">
          Brasileirão <span className="text-neon">Série A</span> · Análise
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm text-mist">
          <Link href="/" className="hover:text-snow">Home</Link>
          <Link href="/contato" className="hover:text-snow">Contato</Link>
        </nav>
      </div>
    </header>
  );
}
