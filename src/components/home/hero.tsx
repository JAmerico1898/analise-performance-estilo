// src/components/home/hero.tsx
"use client";

export function Hero() {
  return (
    <section className="relative min-h-[640px] md:min-h-[760px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero.jpg"
          alt="Futebol brasileiro — imagem de abertura"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1326] via-[#0b1326]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-transparent to-transparent" />
      </div>
      <div className="container mx-auto px-6 md:px-8 relative z-10 grid md:grid-cols-2 items-center gap-12 py-20">
        <div className="max-w-2xl">
          <span className="inline-block bg-[#abd600]/20 text-[#c3f400] px-3 py-1 rounded-sm text-[10px] tracking-[0.2em] font-bold uppercase mb-6">
            Brasileirão Série A · 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.92] mb-6 text-[#dae2fd]">
            Brasileirão Série A:{" "}
            <br />
            <span className="kinetic-text-gradient">Análise de Performance e Estilo de Jogo</span>
          </h1>
          <p className="text-[#c4c9ac] text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
            Explore insights profundos, métricas avançadas e padrões táticos detalhados de cada clube na elite do futebol brasileiro. A ferramenta definitiva para analistas e entusiastas.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#selector"
              className="px-8 py-4 bg-[#c3f400] text-[#161e00] font-bold uppercase tracking-wider text-sm rounded-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Explorar análises
            </a>
            <a
              href="/contato"
              className="px-8 py-4 bg-[#31394d]/40 backdrop-blur-sm text-white font-bold uppercase tracking-wider text-sm rounded-sm hover:bg-[#2d3449] active:scale-95 transition-all border border-white/10"
            >
              Fale com o autor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
