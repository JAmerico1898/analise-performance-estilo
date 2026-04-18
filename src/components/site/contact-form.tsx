"use client";

import { useState } from "react";

export function ContactForm({ onSent }: { onSent?: () => void } = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message }),
      });
      if (res.ok) {
        setStatus("sent");
        setName(""); setEmail(""); setMessage("");
        onSent?.();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-sm border border-[#c3f400]/40 bg-[#c3f400]/10 p-6 text-center">
        <p className="text-lg font-bold text-[#c3f400]">Mensagem enviada. Obrigado pelo retorno!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#c4c9ac]">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (opcional)"
          className="w-full rounded-sm border border-[#444933]/50 bg-[#222a3d] px-4 py-3 text-[#dae2fd] placeholder:text-[#c4c9ac]/50 focus:border-[#c3f400] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#c4c9ac]">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com (opcional — para resposta)"
          className="w-full rounded-sm border border-[#444933]/50 bg-[#222a3d] px-4 py-3 text-[#dae2fd] placeholder:text-[#c4c9ac]/50 focus:border-[#c3f400] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#c4c9ac]">
          Mensagem <span className="text-[#ffb4ab]">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descreva o erro, dúvida ou sugestão…"
          className="w-full resize-y rounded-sm border border-[#444933]/50 bg-[#222a3d] px-4 py-3 text-[#dae2fd] placeholder:text-[#c4c9ac]/50 focus:border-[#c3f400] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
        />
      </div>

      {status === "error" && (
        <div className="rounded-sm border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 px-4 py-3 text-sm text-[#ffb4ab]">
          Não foi possível enviar. Tente novamente.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-sm bg-[#c3f400] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#161e00] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
