"use client";

import { useSyncExternalStore } from "react";

type CookieConsent = "accepted" | "rejected" | null;
const COOKIE_CONSENT_KEY = "victoryhub-cookie-consent";
const CONSENT_CHANGE_EVENT = "victoryhub-cookie-consent-change";

function getConsent(): CookieConsent {
  const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

  return savedConsent === "accepted" || savedConsent === "rejected"
    ? savedConsent
    : null;
}

function subscribeToConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
  };
}

export default function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsent,
    () => null
  );

  function handleConsent(choice: "accepted" | "rejected") {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }

  if (consent !== null) {
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
            <Link
              href="/cookies"
              className="text-white underline transition-colors hover:text-primary-hover"
            >
              Política de Cookies
            </Link>
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
