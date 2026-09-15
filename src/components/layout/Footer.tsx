import Image from "next/image";
import CookieConsent from "./CookieContent";

const COLUMNS = [
  {
    title: "PLATAFORMA",
    links: ["Torneios", "Rankings", "Loja de Itens", "Como Funciona"],
  },
  {
    title: "EMPRESA",
    links: ["Sobre Nós", "Contato", "Carreiras"],
  },
];

const LEGAL_LINKS = [
  {
    title: "Termos de Uso",
    href: "/Termos_de_Uso_VictoryHub.pdf",
    newTab: true,
  },
  {
    title: "Cookies",
    href: "/cookies",
    newTab: false,
  },
];

const SOCIALS = ["𝕏", "📸", "📺", "in"];

export default function Footer() {
  return (
    <>
      <footer className="border-t border-border-light bg-dark px-5 py-12 md:px-10 lg:px-20">
        <div className="mx-auto flex max-w-300 flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <Image src="/logo.png" alt="VictoryHub" width={25} height={25} />
              <span className="font-bold">VICTORYHUB</span>
            </div>
            <p className="mb-4 text-xs text-secondary">
              © 2026 VictoryHub. Todos os direitos reservados.
            </p>
            <p className="mb-6 text-sm leading-relaxed text-secondary">
              Arena competitiva de matchmaking para jogadores de alto nível.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-dark text-sm transition-colors duration-300 hover:bg-primary-hover"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-20">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-6 text-sm tracking-wide">{col.title}</h4>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="mb-3 block text-sm text-content transition-colors hover:text-primary"
                  >
                    {l}
                  </a>
                ))}
              </div>
            ))}
            <div>
              <h4 className="mb-6 text-sm tracking-wide">LEGAL</h4>
              <p className="mb-4 text-xs">Feito com 🕹️ para jogadores competitivos</p>
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  target={link.newTab ? "_blank" : undefined}
                  rel={link.newTab ? "noopener noreferrer" : undefined}
                  className="mb-3 block text-sm text-content transition-colors hover:text-primary"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </>
  );
}
