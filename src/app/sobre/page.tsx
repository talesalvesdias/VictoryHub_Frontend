import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import { CREATORS, TIMELINE, OBJECTIVES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "VictoryHub | Sobre Nós",
};

export default function Sobre() {
  return (
    <>
      {/* HEADER */}
      <section className="bg-dark px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-bold tracking-[2px] text-primary">NOSSA HISTÓRIA</p>
          <h1 className="font-display py-2 text-5xl tracking-wide sm:text-6xl">
            SOBRE A VICTORYHUB
          </h1>
          <hr className="my-4 w-20 border-t-2 border-primary" />
          <p className="max-w-2xl leading-relaxed text-secondary">
            Nascemos da paixão por jogos competitivos e da frustração com a falta de
            plataformas sérias para jogadores casuais e semi-profissionais no Brasil.
          </p>
        </div>
      </section>

      {/* ARENA + TIMELINE */}
      <section className="bg-section-tint px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display mb-6 text-3xl tracking-wide sm:text-4xl">
              UMA ARENA FEITA POR JOGADORES, PARA JOGADORES
            </h2>
            <div className="space-y-4 leading-relaxed text-secondary">
              <p>
                O projeto VictoryHub nasceu dentro de uma sala de aula, quando quatro
                estudantes de Sistemas de Informação perceberam que o mercado de e-sports
                brasileiro carecia de uma plataforma acessível, justa e centrada na
                experiência do jogador.
              </p>
              <p>
                A ideia central é simples: qualquer pessoa que goste de jogos competitivos —
                seja CS2, Valorant, Marvel Rivals ou COD — merece ter acesso a torneios
                organizados, com prêmios reais e matchmaking que respeite o seu nível de
                habilidade.
              </p>
              <p>
                Nosso sistema de rank garante que você nunca enfrente adversários muito acima
                ou abaixo do seu nível, tornando cada partida desafiadora e justa. Cada
                vitória tem peso. Cada derrota, uma lição.
              </p>
            </div>
          </div>

          <ol className="relative space-y-8 border-l border-border-input pl-8">
            {TIMELINE.map((item) => (
              <li key={item.tag} className="relative">
                <span className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full bg-primary" />
                <p className="text-xs font-bold tracking-wider text-primary">{item.tag}</p>
                <h4 className="mb-1 text-lg font-semibold">{item.title}</h4>
                <p className="text-sm text-muted">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* OBJETIVOS */}
      <section className="bg-dark px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-bold tracking-[2px] text-primary">O QUE NOS MOVE</p>
          <h2 className="font-display mb-10 text-4xl tracking-wide sm:text-5xl">
            OBJETIVOS DO PROJETO
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {OBJECTIVES.map((o) => (
              <Card key={o.n} hover>
                <span className="font-display text-3xl text-primary">{o.n}</span>
                <h3 className="mb-2 mt-1 text-lg font-semibold">{o.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{o.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CRIADORES */}
      <section className="bg-section-tint px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1200px] text-center">
          <p className="text-xs font-bold tracking-[2px] text-primary">QUEM SOMOS</p>
          <h2 className="font-display text-4xl tracking-wide sm:text-5xl">OS CRIADORES</h2>
          <p className="mx-auto mb-10 mt-2 max-w-xl text-secondary">
            Estudantes de Sistemas de Informação apaixonados por tecnologia e games.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CREATORS.map((c) => (
              <Card key={c.rm} hover className="flex flex-col items-center">
                <div className="font-display mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-dark">
                  {c.initials}
                </div>
                <h3 className="text-base font-semibold">{c.name}</h3>
                <span className="text-sm text-muted">{c.rm}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
