import type { Metadata } from "next";
import TournamentList from "@/components/tournaments/TournamentList";

export const metadata: Metadata = {
  title: "VictoryHub | Torneios",
};

export default function Torneios() {
  return (
    <section className="bg-dark px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-10">
          <p className="text-xs font-bold tracking-[2px] text-primary">AO VIVO AGORA</p>
          <h1 className="font-display py-2 text-5xl tracking-wide sm:text-6xl">TORNEIOS</h1>
          <hr className="my-4 w-20 border-t-2 border-primary" />
          <p className="max-w-2xl leading-relaxed text-secondary">
            Escolha um jogo, confira as regras e inscreva-se. As vagas atualizam em tempo
            real e o matchmaking respeita o seu rank.
          </p>
        </header>

        <TournamentList />
      </div>
    </section>
  );
}
