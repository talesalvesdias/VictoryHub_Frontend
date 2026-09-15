"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CookieConsent = "accepted" | "rejected" | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(
      "victoryhub-cookie-consent"
    ) as CookieConsent;

    setConsent(savedConsent);
    setIsLoaded(true);
  }, []);

  function handleConsent(choice: "accepted" | "rejected") {
    localStorage.setItem("victoryhub-cookie-consent", choice);
    setConsent(choice);
  }

  // Evita o banner aparecer rapidamente antes de ler o localStorage
  if (!isLoaded || consent !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border-light bg-dark px-5 py-4 shadow-2xl md:px-10 lg:px-20">
      <div className="mx-auto flex max-w-300 flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        
        <div className="max-w-3xl">
          <h3 className="mb-1 text-sm font-semibold text-primary">
            🍪 Política de Cookies 🍪
          </h3>

          <p className="text-xs leading-relaxed text-secondary sm:text-sm">
            Utilizamos cookies para melhorar sua experiência na VictoryHub,
            analisar o uso da plataforma e oferecer funcionalidades
            personalizadas. Você pode aceitar ou recusar cookies opcionais.
            Consulte nossa{" "}
            <a
              href="/cookies"
              className="text-white underline hover:text-primary-hover"
            >
              Política de Cookies
            </a>
            .
          </p>
        </div>

        <div className="flex w-full shrink-0 gap-3 md:w-auto">
          <button
            type="button"
            onClick={() => handleConsent("rejected")}
            className="flex-1 rounded-md border border-gray-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover md:flex-none"
          >
            Recusar
          </button>

          <button
            type="button"
            onClick={() => handleConsent("accepted")}
            className="flex-1 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-hover md:flex-none"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}