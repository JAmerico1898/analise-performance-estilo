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
      <div className="rounded-xl border border-neon/40 bg-neon/10 p-6 text-center">
        <p className="text-lg font-bold text-neon">Mensagem enviada. Obrigado pelo retorno!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mist">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (opcional)"
          className="w-full rounded-md border border-steel bg-graphite px-4 py-3 text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mist">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com (opcional — para resposta)"
          className="w-full rounded-md border border-steel bg-graphite px-4 py-3 text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mist">
          Mensagem <span className="text-danger">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descreva o erro, dúvida ou sugestão…"
          className="w-full resize-y rounded-md border border-steel bg-graphite px-4 py-3 text-snow placeholder:text-mist/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
        />
      </div>

      {status === "error" && (
        <div className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          Não foi possível enviar. Tente novamente.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-neon px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
