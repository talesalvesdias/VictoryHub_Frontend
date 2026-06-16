"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import { fieldClass, labelClass } from "@/components/ui/fieldStyles";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error ?? "Não foi possível cadastrar.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          mode === "signup"
            ? "Conta criada, mas o login falhou. Tente entrar manualmente."
            : "E-mail ou senha incorretos.",
        );
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSignup && (
        <div>
          <label className={labelClass} htmlFor="name">
            Nome
          </label>
          <input className={fieldClass} id="name" name="name" placeholder="Seu nome" required />
        </div>
      )}
      <div>
        <label className={labelClass} htmlFor="email">
          E-mail
        </label>
        <input
          className={fieldClass}
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">
          Senha
        </label>
        <input
          className={fieldClass}
          id="password"
          name="password"
          type="password"
          placeholder={isSignup ? "Mínimo 6 caracteres" : "Sua senha"}
          required
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Aguarde..." : isSignup ? "Criar Conta" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted">
        {isSignup ? (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-primary hover:underline">
              Cadastrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
