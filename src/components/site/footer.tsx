// src/components/site/footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-steel/80 bg-graphite">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-display text-xl font-bold text-snow">Brasileirão Série A</p>
          <p className="font-display text-lg text-snow">Análise de Clubes</p>
          <p className="mt-4 text-sm text-mist">
            por <span className="font-semibold text-snow">José Américo Antunes</span>
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mist">Navegação</p>
          <ul className="space-y-2 text-sm text-snow">
            <li><Link href="/" className="hover:text-neon">Home</Link></li>
            <li><Link href="/landing" className="hover:text-neon">Apresentação</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mist">Recursos</p>
          <ul className="space-y-2 text-sm text-snow">
            <li><span className="text-mist">Glossário (em breve)</span></li>
            <li><span className="text-mist">Metodologia (em breve)</span></li>
            <li><span className="text-mist">Sobre (em breve)</span></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mist">Contato</p>
          <p className="text-sm text-snow">Erros, Dúvidas, Sugestões?</p>
          <Link
            href="/contato"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-neon px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Entre em contato →
          </Link>
        </div>
      </div>

      <div className="border-t border-steel/60">
        <div className="mx-auto max-w-[1280px] px-4 py-4 text-xs text-mist">
          <p>Temporada 2026 — atualizado semanalmente</p>
        </div>
      </div>
    </footer>
  );
}
