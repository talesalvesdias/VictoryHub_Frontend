"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const COLORS = ["#fc5757", "#34d399", "#f5f5f5", "#ff7d7d"];

export default function SuccessAnimation({
  redirectTo = "/",
  seconds = 5,
}: {
  redirectTo?: string;
  seconds?: number;
}) {
  const router = useRouter();
  const [count, setCount] = useState(seconds);

  // Partículas calculadas uma vez (determinístico por índice).
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * 360;
        const distance = 130 + (i % 5) * 16;
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance;
        const size = 5 + (i % 4) * 2;
        return { tx, ty, size, color: COLORS[i % COLORS.length], delay: 0.6 + (i % 6) * 0.04 };
      }),
    [],
  );

  useEffect(() => {
    const tick = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    const redirect = setTimeout(() => router.push(redirectTo), seconds * 1000 + 600);
    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [router, redirectTo, seconds]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-dark px-5 py-20">
      <span className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(252,87,87,0.08),transparent_70%)]" />

      {/* Partículas */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="fb-particle pointer-events-none absolute left-1/2 top-[44%] rounded-full"
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--delay": `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="fb-card relative z-10 w-full max-w-lg rounded-[15px] border border-border bg-dark-card p-12 text-center sm:p-14">
        {/* Checkmark animado */}
        <div className="relative mx-auto mb-7 flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.08)]">
          <span className="fb-ring absolute -inset-2 rounded-full border-2 border-transparent" />
          <svg
            className="h-10 w-10 text-[#34d399]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="fb-check" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display mb-3 text-4xl tracking-wide">Mensagem Enviada!</h1>
        <p className="mb-9 text-sm leading-relaxed text-muted">
          Obrigado por entrar em contato com a VictoryHub. Nossa equipe analisará sua mensagem
          e retornará em até <strong className="text-content">48 horas úteis</strong>.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/" variant="accent" size="lg">
            Voltar para Home
          </Button>
          <Button href="/torneios" variant="ghost" size="lg">
            Ver Torneios
          </Button>
        </div>

        <div className="mt-9 border-t border-border pt-6">
          <p className="mb-2.5 text-xs text-muted">
            Redirecionando para a página inicial em {count} segundo{count === 1 ? "" : "s"}...
          </p>
          <div className="h-[3px] overflow-hidden rounded-full bg-dark-lighter">
            <div className="fb-countdown progress-gradient h-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
