import Link from "next/link";
import { ContactForm } from "@/components/site/contact-form";
import { TopBar } from "@/components/site/top-bar";
import { Footer } from "@/components/site/footer";

export const metadata = { title: "Contato · Brasileirão Série A" };

export default function ContatoPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-xl px-6 pb-20 pt-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-neon hover:opacity-80">
          ← Voltar
        </Link>
        <h1 className="font-display text-4xl font-extrabold text-snow">Entre em contato</h1>
        <p className="mt-2 mb-8 font-serif text-lg text-mist">
          Erros, dúvidas ou sugestões? Escreva abaixo. Respondo pelo e-mail informado.
        </p>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
