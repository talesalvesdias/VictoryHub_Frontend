"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { fieldClass, labelClass } from "@/components/ui/fieldStyles";
import { CONTACT_SUBJECTS, CONTACT_TYPES } from "@/lib/constants";

type Errors = Partial<Record<"nome" | "email" | "assunto" | "mensagem", string>>;

export default function ContactForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate(data: Record<string, string>): Errors {
    const e: Errors = {};
    if (data.nome.trim().length < 2) e.nome = "Informe seu nome.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "E-mail inválido.";
    if (!data.assunto) e.assunto = "Selecione um assunto.";
    if (data.mensagem.trim().length < 10) e.mensagem = "Mensagem muito curta (mín. 10 caracteres).";
    return e;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    const form = new FormData(event.currentTarget);
    const data = {
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("email") ?? ""),
      assunto: String(form.get("assunto") ?? ""),
      mensagem: String(form.get("mensagem") ?? ""),
      type: String(form.get("type") ?? "SUPPORT"),
    };

    const e = validate(data);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body?.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }
      router.push("/feedback");
    } catch {
      setServerError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="nome">
            Nome *
          </label>
          <input className={fieldClass} id="nome" name="nome" placeholder="Seu nome completo" />
          {errors.nome && <p className="mt-1 text-xs text-error">{errors.nome}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            E-mail *
          </label>
          <input
            className={fieldClass}
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
          />
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="assunto">
            Assunto *
          </label>
          <select className={fieldClass} id="assunto" name="assunto" defaultValue="">
            <option value="" disabled>
              Selecione um assunto
            </option>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.assunto && <p className="mt-1 text-xs text-error">{errors.assunto}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="type">
            Tipo da mensagem
          </label>
          <select className={fieldClass} id="type" name="type" defaultValue="SUPPORT">
            {CONTACT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="mensagem">
          Mensagem *
        </label>
        <textarea
          className={`${fieldClass} min-h-[150px] resize-y`}
          id="mensagem"
          name="mensagem"
          placeholder="Descreva sua dúvida ou sugestão em detalhes..."
        />
        {errors.mensagem && <p className="mt-1 text-xs text-error">{errors.mensagem}</p>}
      </div>

      {serverError && <p className="text-sm text-error">{serverError}</p>}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          * Campos obrigatórios. Seus dados não serão compartilhados.
        </p>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar Mensagem"}
        </Button>
      </div>
    </form>
  );
}
