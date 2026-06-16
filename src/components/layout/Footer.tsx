import Image from "next/image";

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

const SOCIALS = ["𝕏", "📸", "📺", "in"];

export default function Footer() {
  return (
    <footer className="border-t border-border-light bg-dark px-5 py-12 md:px-10 lg:px-20">
      <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-10 md:flex-row">
        <div className="max-w-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <Image src="/logo.png" alt="VictoryHub" width={25} height={25} />
            <span className="font-bold">VICTORYHUB</span>
          </div>
          <p className="mb-4 text-xs text-secondary">
            © 2025 VictoryHub. Todos os direitos reservados.
          </p>
          <p className="mb-6 text-sm leading-relaxed text-secondary">
            Arena competitiva de matchmaking para jogadores de alto nível.
          </p>
          <div className="flex gap-2.5">
            {SOCIALS.map((s, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-dark text-sm transition-colors duration-300 hover:border-[#ffaa00] hover:bg-border"
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
            {["Termos de Uso", "Privacidade", "Cookies"].map((l) => (
              <a
                key={l}
                href="#"
                className="mb-3 block text-sm text-content transition-colors hover:text-primary"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
