// src/components/site/footer.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-0 w-full border-t border-[#444933]/15 bg-[#0b1326] py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-8 md:grid-cols-3 md:gap-8">
        {/* Branding */}
        <div className="space-y-4">
          <div className="text-2xl font-black tracking-tight text-white">Brasileirão Série A</div>
          <div className="text-xl font-medium text-white">Análise de Clubes</div>
          <div className="text-sm text-[#c4c9ac]">
            por <span className="font-bold text-white">José Américo Antunes</span>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4c9ac]">
            Recursos
          </h4>
          <ul className="space-y-4 text-sm">
            <li>
              <Link
                href="/glossario"
                className="text-white transition-colors hover:text-[#c3f400]"
              >
                Glossário
              </Link>
            </li>
            <li>
              <Link
                href="/metodologia"
                className="text-white transition-colors hover:text-[#c3f400]"
              >
                Metodologia
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4c9ac]">
            Contato
          </h4>
          <p className="text-sm text-white">Erros, Dúvidas, Sugestões?</p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 rounded-sm bg-[#c3f400] px-6 py-3 text-sm font-bold text-[#161e00] transition-all hover:brightness-110 active:scale-95"
          >
            Entre em contato
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-[#444933]/15 px-6 pt-6 md:px-8">
        <p className="text-xs text-[#c4c9ac]">Temporada 2026 — atualizado semanalmente</p>
      </div>
    </footer>
  );
}
