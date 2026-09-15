"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import { fieldClass, labelClass } from "@/components/ui/fieldStyles";
import { resourceLimits } from "node:worker_threads";

interface PasswordRequirement {
  id: string;
  label: string;
  regex: RegExp;
}

const REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "Mínimo de 8 caracteres",
    regex: /.{8,}/,
  },
  {
    id: "uppercase",
    label: "Pelo menos uma letra maiúscula",
    regex: /[A-Z]/,
  },
  {
    id: "lowercase",
    label: "Pelo menos uma letra minúscula",
    regex: /[a-z]/,
  },
  {
    id: "number",
    label: "Pelo menos um número",
    regex: /[0-9]/,
  },
  {
    id: "special",
    label: "Pelo menos um caractere especial (!@#$%&*)",
    regex: /[^A-Za-z0-9]/,
  },
];

export default function AuthForm({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const router = useRouter();
  const params = useSearchParams();

  const next = params.get("next") ?? "/dashboard";
  const isSignup = mode === "signup";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nome, E-mail e Senha
   const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);


  // Verifica cada requisito individualmente
  const passwordValidation = REQUIREMENTS.map((requirement) => ({
    ...requirement,
    valid: requirement.regex.test(password),
  }));

  // Verifica se TODOS os requisitos foram atendidos
  const isPasswordValid = passwordValidation.every(
    (requirement) => requirement.valid,
  );

  // Requisitos que ainda não foram atendidos
  const missingRequirements = passwordValidation.filter(
    (requirement) => !requirement.valid,
  );
  function validateEmail(value: string) {
  const trimmedEmail = value.trim();

  if (!trimmedEmail) {
    return "Informe seu e-mail.";
  }

  if (!trimmedEmail.includes("@")) {
    return "O e-mail precisa conter @.";
  }

  const [localPart, domain, ...extra] = trimmedEmail.split("@");

  if (!localPart) {
    return "Digite algo antes do @.";
  }

  if (!domain) {
    return "Digite o domínio depois do @. Exemplo: gmail.com";
  }

  if (extra.length > 0) {
    return "O e-mail deve conter apenas um @.";
  }

  if (!domain.includes(".")) {
    return "Digite um domínio válido. Exemplo: gmail.com";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(trimmedEmail)) {
    return "Digite um endereço de e-mail válido.";
  }

  return "";
}

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const form = new FormData(event.currentTarget);

  const formName = String(form.get("name") ?? "");
  const formEmail = String(form.get("email") ?? "");
  const formPassword = String(form.get("password") ?? "");

  const currentEmailError = validateEmail(formEmail);

setEmailTouched(true);
setEmailError(currentEmailError);

if (currentEmailError) {
  setError("Verifique os campos destacados antes de continuar.");
  return;
}

if (isSignup && !isPasswordValid) {
  setPasswordTouched(true);
  setPasswordFocused(true);

  setError("Verifique os campos destacados antes de continuar.");

  return;
}

    // Bloqueia o cadastro caso a senha não cumpra os requisitos
    if (isSignup && !isPasswordValid) {
      setPasswordTouched(true);
      setPasswordFocused(true);

      setError(
        "Sua senha ainda não atende a todos os requisitos indicados abaixo.",
      );

      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const result = await signIn("credentials", {
  email: formEmail,
  password: formPassword,
  redirect: false,
});

        const data = result;

        if (!result.ok) {
          setError(
            data?.error ?? "Não foi possível cadastrar.",
          );

          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password: formPassword,
        redirect: false,
      });

      if (result?.error) {
        setError(
          isSignup
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {/* NOME */}
      {isSignup && (
        <div>
          <label
            className={labelClass}
            htmlFor="name"
          >
            Nome
          </label>

          <input
            className={fieldClass}
            id="name"
            name="name"
            placeholder="Seu nome"
            required
          />
        </div>
      )}

      {/* E-MAIL */}
      <div>
  <label
    className={labelClass}
    htmlFor="email"
  >
    E-mail
  </label>

  <input
    className={`${fieldClass} ${
      emailError
        ? "border-primary focus:border-primary"
        : ""
    }`}
    id="email"
    name="email"
    type="email"
    value={email}
    placeholder="seu@email.com"
    required
    aria-invalid={!!emailError}
    aria-describedby={
      emailError ? "email-error" : undefined
    }
    onChange={(event) => {
      const value = event.target.value;

      setEmail(value);

      // Depois que o usuário já saiu do campo uma vez,
      // atualiza o erro enquanto ele corrige.
      if (emailTouched) {
        setEmailError(validateEmail(value));
      }
    }}
    onBlur={() => {
      setEmailTouched(true);
      setEmailError(validateEmail(email));
    }}
  />

  {emailError && (
    <p
      id="email-error"
      role="alert"
      className="mt-2 flex items-center gap-1.5 text-xs text-primary"
    >
      <span aria-hidden="true">⚠</span>
      {emailError}
    </p>
  )}
</div>

      {/* SENHA */}
      <div>
        <label
          className={labelClass}
          htmlFor="password"
        >
          Senha
        </label>

        <input
          className={`${fieldClass} ${
            isSignup &&
            passwordTouched &&
            !isPasswordValid
              ? "border-primary focus:border-primary"
              : ""
          }`}
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);

            if (error) {
              setError("");
            }
          }}
          onFocus={() => {
            setPasswordFocused(true);
          }}
          onBlur={() => {
            setPasswordFocused(false);
            setPasswordTouched(true);
          }}
          placeholder={
            isSignup
              ? "Crie uma senha"
              : "Sua senha"
          }
          required
          aria-invalid={
            isSignup &&
            passwordTouched &&
            !isPasswordValid
          }
          aria-describedby={
            isSignup
              ? "password-requirements"
              : undefined
          }
        />

        {/* CHECKLIST */}
        {isSignup &&
          (passwordFocused ||
            password.length > 0 ||
            passwordTouched) && (
            <div
              id="password-requirements"
              className="mt-3 rounded-lg border border-white/10 bg-black/20 p-4"
            >
              <p className="mb-3 text-xs font-semibold text-zinc-300">
                Sua senha deve conter:
              </p>

              <ul className="space-y-2">
                {passwordValidation.map(
                  (requirement) => (
                    <li
                      key={requirement.id}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        requirement.valid
                          ? "text-emerald-400"
                          : passwordTouched
                            ? "text-primary"
                            : "text-zinc-500"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          requirement.valid
                            ? "border-emerald-400 bg-emerald-400/10"
                            : passwordTouched
                              ? "border-primary"
                              : "border-zinc-600"
                        }`}
                      >
                        {requirement.valid
                          ? "✓"
                          : "○"}
                      </span>

                      <span>
                        {requirement.label}
                      </span>
                    </li>
                  ),
                )}
              </ul>

              {/* Mensagem quando tudo estiver correto */}
              {isPasswordValid &&
                password.length > 0 && (
                  <p className="mt-3 text-xs font-medium text-emerald-400">
                    ✓ Senha válida
                  </p>
                )}

              {/* Quantidade de requisitos faltantes */}
              {passwordTouched &&
                !isPasswordValid &&
                password.length > 0 && (
                  <p className="mt-3 text-xs text-primary">
                    {missingRequirements.length === 1
                      ? "Falta atender 1 requisito."
                      : `Faltam atender ${missingRequirements.length} requisitos.`}
                  </p>
                )}
            </div>
          )}
      </div>

      {/* ERRO GERAL */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <p className="text-sm text-primary">
            {error}
          </p>
        </div>
      )}

      {/* BOTÃO */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Aguarde..."
          : isSignup
            ? "Criar Conta"
            : "Entrar"}
      </Button>

      {/* LOGIN / CADASTRO */}
      <p className="text-center text-sm text-muted">
        {isSignup ? (
          <>
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline"
            >
              Entrar
            </Link>
          </>
        ) : (
          <>
            Não tem conta?{" "}
            <Link
              href="/cadastro"
              className="text-primary hover:underline"
            >
              Cadastrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
