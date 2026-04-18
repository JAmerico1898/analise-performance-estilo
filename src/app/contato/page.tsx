import Link from "next/link";
import { ContactForm } from "@/components/site/contact-form";
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";

export const metadata = { title: "Contato · Brasileirão Série A" };

export default function ContatoPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-xl px-6 pb-20 pt-16 min-h-screen">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#c3f400] hover:brightness-110"
        >
          ← Voltar
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight italic text-white">
          Entre em contato
        </h1>
        <p className="mt-2 mb-8 text-base md:text-lg leading-relaxed text-[#c4c9ac]">
          Erros, dúvidas ou sugestões? Escreva abaixo. Respondo pelo e-mail informado.
        </p>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
