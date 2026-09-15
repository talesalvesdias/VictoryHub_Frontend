import Link from "next/link";

export default function PoliticaDeCookies() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Destaque superior */}
      <div className="h-1 w-full bg-primary" />

      <section className="mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-24">
        {/* Cabeçalho */}
        <header className="mb-14 border-b border-white/10 pb-10">
          <span className="mb-3 block font-poppins text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            VictoryHub • Legal
          </span>

          <h1 className="font-bebas text-5xl uppercase tracking-wide text-white md:text-7xl">
            Política de <span className="text-primary">Cookies</span>
          </h1>

          <p className="mt-4 max-w-2xl font-poppins text-sm leading-7 text-zinc-400">
            Esta Política explica como a VictoryHub utiliza cookies e
            tecnologias semelhantes durante a utilização da plataforma.
          </p>

          <p className="mt-4 font-poppins text-xs text-zinc-500">
            Última atualização: setembro de 2026
          </p>
        </header>

        {/* Conteúdo */}
        <div className="space-y-10 font-poppins text-sm leading-7 text-zinc-300">
          <Section number="01" title="O que são cookies?">
            <p>
              Cookies são pequenos arquivos armazenados no dispositivo do
              usuário durante a navegação em um site. Eles podem ser utilizados
              para lembrar preferências, manter sessões ativas, oferecer
              funcionalidades e obter informações sobre a utilização da
              plataforma.
            </p>
          </Section>

          <Section number="02" title="Quais cookies podemos utilizar?">
            <p className="mb-5">
              A VictoryHub poderá utilizar diferentes categorias de cookies:
            </p>

            <CookieCard
              title="Cookies necessários"
              badge="ESSENCIAIS"
            >
              São essenciais para o funcionamento, segurança e acesso aos
              recursos da plataforma. Quando estritamente necessários para a
              prestação do serviço, poderão ser utilizados independentemente
              do consentimento.
            </CookieCard>

            <CookieCard title="Cookies de preferências">
              Permitem lembrar determinadas escolhas realizadas pelo usuário,
              proporcionando uma experiência mais personalizada.
            </CookieCard>

            <CookieCard title="Cookies de análise">
              Ajudam a compreender como os usuários interagem com a plataforma,
              permitindo identificar melhorias de desempenho, navegação e
              experiência.
            </CookieCard>

            <CookieCard title="Cookies de marketing">
              Podem ser utilizados para medir campanhas e apresentar conteúdos
              ou anúncios mais relevantes. Quando aplicável, serão utilizados
              de acordo com as escolhas de consentimento do usuário.
            </CookieCard>
          </Section>

          <Section number="03" title="Consentimento">
            <p>
              Ao acessar a VictoryHub, o usuário poderá aceitar ou recusar o
              uso de cookies opcionais por meio do aviso de cookies apresentado
              na plataforma.
            </p>

            <p className="mt-4">
              A recusa de cookies opcionais não impedirá o uso das
              funcionalidades essenciais da VictoryHub.
            </p>

            <p className="mt-4">
              O consentimento poderá ser alterado ou retirado posteriormente
              por meio das configurações de cookies disponibilizadas na
              plataforma.
            </p>
          </Section>

          <Section number="04" title="Cookies de terceiros">
            <p>
              Algumas funcionalidades da VictoryHub poderão utilizar serviços
              fornecidos por terceiros. Esses serviços poderão utilizar seus
              próprios cookies, sujeitos às respectivas políticas de
              privacidade e cookies.
            </p>

            <p className="mt-4">
              Sempre que necessário, cookies de terceiros que não sejam
              essenciais somente serão ativados após a obtenção do
              consentimento correspondente.
            </p>
          </Section>

          <Section number="05" title="Gerenciamento de cookies">
            <p>
              Além das opções disponibilizadas pela VictoryHub, o usuário pode
              configurar seu navegador para bloquear ou excluir cookies.
            </p>

            <p className="mt-4">
              O bloqueio de cookies estritamente necessários poderá afetar o
              funcionamento de determinadas funcionalidades da plataforma.
            </p>
          </Section>

          <Section number="06" title="Alterações nesta Política">
            <p>
              Esta Política de Cookies poderá ser atualizada periodicamente
              para refletir alterações na plataforma, nas tecnologias
              utilizadas ou na legislação aplicável.
            </p>

            <p className="mt-4">
              Recomendamos que o usuário consulte esta página periodicamente
              para verificar eventuais atualizações.
            </p>
          </Section>

          <Section number="07" title="Privacidade e proteção de dados">
            <p>
              O tratamento de dados pessoais relacionado ao uso de cookies
              deverá observar a legislação aplicável, incluindo a Lei Geral de
              Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018).
            </p>

            <p className="mt-4">
              Para mais informações sobre o tratamento de dados pessoais,
              consulte a Política de Privacidade da VictoryHub.
            </p>
          </Section>
        </div>

        {/* Rodapé da política */}
        <div className="mt-16 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bebas text-2xl tracking-wide text-white">
              VICTORY<span className="text-primary">HUB</span>
            </p>

            <p className="mt-1 font-poppins text-xs text-zinc-500">
              Arena competitiva para jogadores de alto nível.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-primary/40 px-5 py-2.5 font-poppins text-xs font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-black"
          >
            ← Voltar para a VictoryHub
          </Link>
        </div>
      </section>
    </main>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="font-bebas text-xl text-primary">
          {number}
        </span>

        <h2 className="font-bebas text-3xl uppercase tracking-wide text-white">
          {title}
        </h2>
      </div>

      <div className="border-l border-primary/30 pl-5">
        {children}
      </div>
    </section>
  );
}

function CookieCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-lg border border-white/10 bg-white/3 p-5 transition-colors duration-300 hover:border-primary/30">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h3 className="font-poppins text-sm font-semibold text-white">
          {title}
        </h3>

        {badge && (
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary">
            {badge}
          </span>
        )}
      </div>

      <p className="text-sm leading-6 text-zinc-400">
        {children}
      </p>
    </div>
  );
}