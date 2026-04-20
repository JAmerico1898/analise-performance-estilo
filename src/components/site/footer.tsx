// src/components/site/footer.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-0 w-full border-t border-[#e5e7eb] bg-white py-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:px-8 md:grid-cols-3 md:gap-8">
        {/* Branding */}
        <div className="space-y-1">
          <div className="text-lg font-black tracking-tight text-[#0b1326]">Brasileirão Série A</div>
          <div className="text-sm font-medium text-[#0b1326]">Análise de Clubes</div>
          <div className="text-xs text-[#3b4456]">
            por <span className="font-bold text-[#0b1326]">José Américo Antunes</span>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3b4456]">
            Recursos
          </h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/glossario"
                className="text-[#0b1326] transition-colors hover:text-[#556b00]"
              >
                Glossário
              </Link>
            </li>
            <li>
              <Link
                href="/metodologia"
                className="text-[#0b1326] transition-colors hover:text-[#556b00]"
              >
                Metodologia
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3b4456]">
            Contato
          </h4>
          <p className="text-xs text-[#0b1326]">Erros, Dúvidas, Sugestões?</p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 rounded-sm bg-[#c3f400] px-4 py-2 text-xs font-bold text-[#161e00] transition-all hover:brightness-110 active:scale-95"
          >
            Entre em contato
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl border-t border-[#e5e7eb] px-6 pt-3 md:px-8">
        <p className="text-[11px] text-[#3b4456]">Temporada 2026 — atualizado semanalmente</p>
      </div>
    </footer>
  );
}
