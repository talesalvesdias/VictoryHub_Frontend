import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { HOME_STATS, FEATURES } from "@/lib/constants";

const PREVIEW = [
  { game: "CS2", name: "CS2 Championship Open", filled: 96, max: 128 },
  { game: "VALORANT", name: "Valorant Pro Series", filled: 64, max: 64 },
  { game: "MARVEL RIVALS", name: "Marvel Rivals Cup", filled: 18, max: 32 },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="bg-hero-gradient px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="order-2 lg:order-1">
            <p className="mb-2.5 text-xs font-bold tracking-[2px]">
              ARENA COMPETITIVA #1 DO BRASIL
            </p>
            <h1 className="font-display mb-5 text-5xl leading-none sm:text-6xl lg:text-[80px]">
              COMPITA.
              <br />
              GANHE.
              <br />
              <span className="text-primary">RECEBA PRÊMIOS.</span>
            </h1>
            <p className="mb-8 max-w-lg leading-relaxed text-[#a0a0a0]">
              VictoryHub é a arena competitiva onde jogadores provam sua habilidade,
              competem em torneios e sobem na classificação. Seu ranking determina os
              adversários — partidas sempre justas.
            </p>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row">
              <Button href="/torneios" size="lg">
                Participar de um Torneio
              </Button>
              <Button href="/sobre" variant="secondary" size="lg">
                Saiba Mais
              </Button>
            </div>
            <hr className="mb-8 border-t border-[#222]" />
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
              {HOME_STATS.map((s) => (
                <div key={s.label}>
                  <h2 className="font-display text-3xl">{s.value}</h2>
                  <p className="mt-1 text-[11px] tracking-wider text-[#666]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative flex h-72 w-72 items-center justify-center lg:h-96 lg:w-96">
              <span className="absolute h-full w-full rounded-full border border-[rgba(255,66,66,0.16)]" />
              <span className="absolute h-[70%] w-[70%] rounded-full border border-[rgba(255,66,66,0.16)]" />
              <span className="absolute h-[45%] w-[45%] rounded-full border border-[rgba(255,66,66,0.16)]" />
              <span className="absolute h-3/4 w-3/4 rounded-full bg-[radial-gradient(circle,rgba(206,45,45,0.2),transparent_70%)]" />
              <Image src="/logo.png" alt="VictoryHub" width={70} height={70} className="relative" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-section-tint px-6 py-12 md:px-12">
        <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} hover className="reveal">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-[#3d2e20] bg-dark-card text-xl">
                {f.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TORNEIOS PREVIEW */}
      <section className="bg-dark px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[2px] text-primary">AO VIVO AGORA</p>
              <h2 className="font-display text-4xl tracking-wide sm:text-5xl">TORNEIOS ATIVOS</h2>
            </div>
            <Button href="/torneios" variant="ghost">
              Ver todos →
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {PREVIEW.map((t) => (
              <Card key={t.name} hover>
                <div className="mb-5 flex items-center justify-between">
                  <Badge kind="game">{t.game}</Badge>
                  <Badge kind="live">● Ao Vivo</Badge>
                </div>
                <h3 className="mb-2.5 text-xl font-semibold">{t.name}</h3>
                <p className="mb-4 text-[13px] text-[#fffafa]">
                  👥 {t.filled} / {t.max} jogadores
                </p>
                <ProgressBar value={t.filled} max={t.max} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark px-5 py-24 text-center md:py-32">
        <p className="mb-5 text-[13px] font-bold tracking-[2px] text-primary">
          PRONTO PARA COMPETIR?
        </p>
        <h2 className="font-display mb-5 text-4xl tracking-wide sm:text-6xl lg:text-[72px]">
          CRIE SUA CONTA GRATUITAMENTE
        </h2>
        <p className="mb-10 text-lg leading-relaxed text-muted">
          Cadastre-se, vincule sua conta de jogo e comece a competir em
          <br className="hidden sm:block" /> torneios com prêmios reais.
        </p>
        <Button href="/cadastro" size="lg" className="px-12">
          Criar Conta Grátis
        </Button>
      </section>
    </>
  );
}
