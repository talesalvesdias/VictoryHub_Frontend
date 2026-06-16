import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "VictoryHub | Contato",
};

const INFO = [
  { icon: "✉️", label: "E-mail", value: "contato@victoryhub.com.br" },
  { icon: "💬", label: "WhatsApp", value: "Em breve" },
  { icon: "⏱️", label: "Tempo de Resposta", value: "Até 48 horas úteis" },
  { icon: "📍", label: "Localização", value: "São Paulo, SP – Brasil" },
];

export default function Contato() {
  return (
    <>
      <section className="bg-dark px-6 pt-16 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-bold tracking-[2px] text-primary">FALE CONOSCO</p>
          <h1 className="font-display py-2 text-5xl tracking-wide sm:text-6xl">CONTATO</h1>
          <hr className="my-4 w-20 border-t-2 border-primary" />
          <p className="max-w-2xl leading-relaxed text-secondary">
            Tem dúvidas, sugestões ou quer reportar um problema? Nossa equipe responde em até
            48 horas.
          </p>
        </div>
      </section>

      <section className="bg-dark px-6 py-12 md:px-12 md:pb-20">
        <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          {/* Sidebar */}
          <Card className="h-fit lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold">Informações de Contato</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Escolha o canal que preferir. Respondemos a todos os contatos.
            </p>
            <ul className="space-y-5">
              {INFO.map((i) => (
                <li key={i.label} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-input bg-dark-lighter">
                    {i.icon}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{i.label}</p>
                    <p className="text-sm font-medium">{i.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Form */}
          <Card>
            <h2 className="text-lg font-semibold">Envie sua mensagem</h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              Preencha o formulário abaixo e entraremos em contato.
            </p>
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  );
}
