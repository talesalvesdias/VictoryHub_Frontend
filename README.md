# VictoryHub

Arena competitiva de **matchmaking + torneios** para jogos competitivos (CS2, Valorant,
Marvel Rivals, COD). Reconstrução do projeto legado (`Project_Happy_Game`) em uma stack
moderna, mantendo a identidade visual (tema dark + vermelho `#fc5757`, Bebas Neue/Poppins).

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **PostgreSQL + Prisma** (ORM)
- **Auth.js / NextAuth v5** — login/cadastro (Credentials + bcrypt), sessão JWT
- **Steam Web API** + **Steam OpenID 2.0** — vínculo de conta Steam ao usuário

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Home — hero, stats, features, preview de torneios, CTA |
| `/torneios` | Lista de torneios **dinâmica** (fetch + useEffect) com filtros |
| `/sobre` | História, timeline, objetivos e criadores |
| `/contato` | Formulário de contato (validação + persistência) |
| `/feedback` | Animação de sucesso + countdown |
| `/login` · `/cadastro` | Autenticação |
| `/dashboard` | (auth) Perfil + dados Steam vinculados (jogos, horas, stats CS2) |

## Setup

```bash
npm install
cp .env.example .env      # preencha as variáveis (veja abaixo)
npm run dev               # http://localhost:3000
```

A app **roda sem banco** para demonstração: a página de torneios cai num fallback de dados
mock (`src/lib/tournaments.mock.ts`) e o formulário de contato aceita o envio. Login,
inscrição em torneios e dashboard exigem `DATABASE_URL`.

### Variáveis de ambiente

| Variável | Para quê |
|----------|----------|
| `DATABASE_URL` | Conexão Postgres (Neon/Supabase). Necessária para auth/inscrição/dashboard. |
| `AUTH_SECRET` | Segredo do NextAuth — gere com `npx auth secret`. |
| `AUTH_URL` / `NEXT_PUBLIC_BASE_URL` | URL base (callbacks Steam/OAuth). |
| `STEAM_API_KEY` | Chave da Steam Web API ([obter aqui](https://steamcommunity.com/dev/apikey)). Server-only. |
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic para o chatbot ([console](https://console.anthropic.com)). Server-only. Opcional: sem ela o chat mostra "indisponível". |
| `CHAT_DAILY_LIMIT` | Opcional. Teto global de mensagens do chat por dia (padrão 1000). |

### Banco de dados (quando tiver `DATABASE_URL`)

```bash
npm run db:migrate    # cria as tabelas
npm run db:seed       # popula os 4 torneios
npm run db:studio     # inspeciona os dados (Prisma Studio)
```

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm test` (vitest — não chama a API do chatbot)
- `npm run db:generate | db:migrate | db:push | db:seed | db:studio`

## Arquitetura

- **Rotas de API** (`src/app/api/**`, server-only):
  `auth/[...nextauth]`, `auth/signup`, `tournaments`, `tournaments/[id]/register`,
  `steam/link`, `steam/callback`, `steam/sync`, `contact`.
- **Steam**: vínculo via OpenID (`src/lib/steam-openid.ts`) com verificação
  `check_authentication`; dados via Steam Web API (`src/lib/steam.ts`), cacheados em
  `SteamAccount`. A `STEAM_API_KEY` nunca é exposta ao client.
- **Auth**: config edge-safe (`src/auth.config.ts`) para o middleware + config completa
  (`src/auth.ts`) com Prisma adapter e Credentials. `/dashboard` é protegido por
  `middleware.ts` e por guard no `dashboard/layout.tsx`.
- **Design system**: tokens em `src/app/globals.css` (`@theme`), componentes reutilizáveis
  em `src/components/` (Navbar, Footer, Button, Card, Badge, ProgressBar, TournamentCard…).
- **Chatbot (Assistente VictoryHub)**: widget em `src/components/chat/` (montado no
  `layout.tsx`) + `POST /api/chat` (stream SSE). O modelo (`claude-opus-5-5`, via
  `@anthropic-ai/sdk`) só usa ferramentas de leitura — listar/detalhar torneios,
  recomendar e ler o perfil da sessão — definidas em `src/lib/chat/tools.ts`. Guardrails
  (validação, rate limit por IP/usuário + teto diário na tabela `ChatUsage`, logs sem
  conteúdo) em `src/lib/chat/`. Planejamento e decisões em `docs/planning-chatbot.md`.
