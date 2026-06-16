# Documentação Técnica — VictoryHub

> Plataforma de **matchmaking + torneios** para jogos competitivos (CS2, Valorant,
> Marvel Rivals, COD). Reconstrução do legado vanilla (`Project_Happy_Game`) em stack
> moderna, preservando a identidade visual (tema dark + vermelho `#fc5757`).

Última atualização: 2026-06-16.

---

## 1. Visão geral

| Item | Valor |
|------|-------|
| Diretório | `/home/shareware/Documents/VIctoryHub` |
| Dev server | `npm run dev` → http://localhost:3000 |
| Banco | PostgreSQL 16 (container Docker `victoryhub-db`) |
| Estado | MVP completo e verificado (build + lint + typecheck OK) |

O projeto entrega os requisitos do MVP: **≥5 páginas navegáveis**, **login/cadastro**,
**integração com a Steam vinculada à conta**, **schema de banco** e **arquitetura de
backend**, além dos requisitos dos stakeholders (Next.js + Tailwind, componentes
reutilizáveis, responsividade, consumo dinâmico de dados via `fetch`/`async-await`/`useEffect`).

---

## 2. Stack e versões

- **Next.js 16.2.9** (App Router, Turbopack) + **React 19.2** + **TypeScript 5**
- **Tailwind CSS v4** (`@tailwindcss/postcss`, tokens via `@theme`)
- **PostgreSQL 16** + **Prisma 6.19** (ORM)
- **NextAuth v5 (beta)** + `@auth/prisma-adapter` + **bcryptjs** — autenticação
- **zod** — validação de dados
- **Steam Web API** + **Steam OpenID 2.0** — vínculo de conta

> **Nota de versão — Prisma fixado na v6.** A v7 removeu `url` do `datasource` e passou a
> exigir `prisma.config.ts` + driver adapters. Para o MVP, a v6 (config clássica) é mais
> simples e compatível com o adapter do NextAuth. Não atualizar sem necessidade.

---

## 3. Decisões de arquitetura

| Decisão | Justificativa |
|---------|---------------|
| **App Router** (não Pages) | Padrão atual; Server Components + route handlers; client components com `useEffect` onde o requisito pede. |
| **PostgreSQL + Prisma** | Mais próximo de produção; migrations versionadas. Rodando local via Docker. |
| **NextAuth v5 (Credentials)** | Login/cadastro com e-mail/senha + sessão JWT prontos. |
| **Steam = fluxo OpenID manual** (não provider) | Steam usa OpenID 2.0 (não OIDC); não há provider first-class no NextAuth v5. Vínculo amarrado à sessão do usuário logado. |
| **Auth split** (`auth.config.ts` + `auth.ts`) | `auth.config.ts` é edge-safe (sem Prisma/bcrypt) para o middleware; `auth.ts` tem o adapter + Credentials. |
| **Sessão JWT** | O provider Credentials **exige** `strategy: "jwt"` (não funciona com database sessions). |
| **Fallback mock de torneios** | A app roda sem banco para demo: `/api/tournaments` cai em `src/lib/tournaments.mock.ts`. |
| **`filledSlots` denormalizado** | Permite renderizar a barra de progresso sem join; incrementado em transação. |

---

## 4. Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx              # fontes, Providers, Navbar/Footer globais
│   ├── globals.css             # design system (@theme + animações)
│   ├── page.tsx                # Home (/)
│   ├── torneios/page.tsx       # Torneios (consome API dinamicamente)
│   ├── sobre/page.tsx          # Sobre Nós
│   ├── contato/page.tsx        # Contato (form)
│   ├── feedback/page.tsx       # Sucesso + countdown
│   ├── login/ · cadastro/      # Autenticação
│   ├── dashboard/
│   │   ├── layout.tsx          # guard server-side (auth)
│   │   └── page.tsx            # perfil + dados Steam
│   └── api/                    # rotas de backend (ver §9)
│       ├── auth/[...nextauth]/ · auth/signup/
│       ├── tournaments/ · tournaments/[id]/register/
│       ├── steam/link/ · steam/callback/ · steam/sync/
│       └── contact/
├── components/
│   ├── Providers.tsx           # SessionProvider
│   ├── layout/                 # Navbar, Footer
│   ├── ui/                     # Button, Card, Badge, ProgressBar, fieldStyles
│   ├── tournaments/            # TournamentCard, Filters, List, RegisterButton
│   ├── contact/ContactForm.tsx
│   ├── feedback/SuccessAnimation.tsx
│   ├── auth/AuthForm.tsx
│   └── dashboard/              # LinkSteamButton, SyncSteamButton, OwnedGames, Cs2Stats
├── lib/
│   ├── prisma.ts               # singleton do PrismaClient
│   ├── tournaments.ts          # camada de dados (DB + fallback mock)
│   ├── tournaments.mock.ts     # 4 torneios (seed + fallback)
│   ├── steam.ts                # client da Steam Web API (server-only)
│   ├── steam-openid.ts         # build URL + verify do OpenID
│   ├── auth-helpers.ts         # getCurrentUser()
│   ├── validation.ts           # schemas zod
│   ├── constants.ts            # nav, criadores, features, filtros…
│   └── cn.ts                   # merge de classes
├── auth.ts · auth.config.ts    # config NextAuth (completa + edge-safe)
└── types/                      # DTOs + augmentação do next-auth

middleware.ts                   # protege /dashboard
prisma/schema.prisma · seed.ts  # schema + seed
```

---

## 5. Design system

Tokens definidos em `src/app/globals.css` via `@theme` (utilitários Tailwind):

| Token | Cor | Uso |
|-------|-----|-----|
| `primary` | `#fc5757` | CTAs, destaques |
| `primary-hover` | `#ff7d7d` | hover de botões |
| `accent` | `#ff3434` | bordas/realces |
| `dark` | `#000000` | fundo base |
| `dark-card` | `#0e0c0c` | fundo de cards |
| `dark-lighter` | `#1a1a1a` | inputs, variações |
| `muted` / `secondary` | `#888` / `#a3a3a3` | textos secundários |
| `success` / `error` | `#4ade80` / `#f87171` | estados |

- **Fontes**: Bebas Neue (títulos, `.font-display`) + Poppins (corpo) via `next/font`.
- **Gradientes**: navbar `linear-gradient(to right,#1f1919,#802a2a)`, progress `#ff3434→#ff7b7b`.
- **Responsividade**: breakpoints Tailwind (sm/md/lg), grids 1→2→3 colunas.
- **Animações**: reveal no scroll, e na página de feedback — checkmark SVG (draw),
  ring spin, partículas e countdown (keyframes `fb-*`).

---

## 6. Páginas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | estática | Hero, stats (12K+/340+/R$500K), 3 features, preview de torneios, CTA |
| `/torneios` | dinâmica | `TournamentList` (client) consome `/api/tournaments` com `fetch`+`useEffect`; filtros por jogo / ao vivo; estados loading/erro/vazio |
| `/sobre` | estática | História, timeline, 4 objetivos, criadores (Tales, Danilo, Leonardo, Henzo) |
| `/contato` | client | Formulário (nome, e-mail, assunto, tipo, mensagem) → `POST /api/contact` → redirect `/feedback` |
| `/feedback` | client | Animação de sucesso + countdown de 5s com auto-redirect |
| `/login` · `/cadastro` | client | Autenticação (Credentials) |
| `/dashboard` | server (auth) | Perfil + saldo/rank + dados Steam (jogos, horas, stats CS2) |

> **Requisito Parte 2 (dados dinâmicos)** atendido em `/torneios`:
> `src/components/tournaments/TournamentList.tsx` usa `fetch` + `async/await` + `useEffect`.

---

## 7. Componentes reutilizáveis

| Componente | Client? | Props principais |
|------------|---------|------------------|
| `Navbar` | sim | — (usa `useSession`, link ativo via `usePathname`) |
| `Footer` | não | — |
| `Button` | não | `variant` (primary/secondary/accent/ghost), `size`, `href?` |
| `Card` | não | `hover`, `className` |
| `Badge` | não | `kind` (game/live/soon/full/neutral) |
| `ProgressBar` | não | `value`, `max` |
| `TournamentCard` | não | `tournament: TournamentDTO` |
| `TournamentFilters` | sim | `active`, `onChange` |
| `TournamentList` | sim | — (estado de filtro + fetch) |
| `RegisterButton` | sim | `tournamentId`, `status` |
| `ContactForm` | sim | — |
| `SuccessAnimation` | sim | `redirectTo`, `seconds` |
| `AuthForm` | sim | `mode` (login/signup) |
| `LinkSteamButton` / `SyncSteamButton` | sim | `linked` / — |
| `OwnedGames` / `Cs2Stats` | não | `games` / `stats` |

---

## 8. Schema do banco (Prisma)

Arquivo: `prisma/schema.prisma`.

### Modelos

- **User** — `id`, `name`, `email @unique`, `passwordHash`, `coins` (default 0),
  `rank` (default "Unranked"), timestamps. Relações: `steamAccount?`, `registrations[]`,
  `accounts[]`, `sessions[]`.
- **SteamAccount** — `userId @unique`, `steamId64 @unique`, `persona`, `profileUrl`,
  `avatar`, `countryCode`, `ownedGames Json?`, `cs2Stats Json?`, `lastSyncedAt`. (Tabela
  própria — **não** reutiliza `Account` do NextAuth.)
- **Tournament** — `name`, `slug @unique`, `game`, `status`, `description`, `prize`,
  `format`, `rankRequirement?`, `rules`, `maxSlots`, `filledSlots` (denormalizado),
  `isLive`, `startsAt?`.
- **TournamentRegistration** — `userId`, `tournamentId`, `status`,
  `@@unique([userId, tournamentId])` (bloqueia inscrição dupla).
- **ContactMessage** — `nome`, `email`, `assunto`, `mensagem`, `type`.
- **Account / Session / VerificationToken** — tabelas do adapter NextAuth.

### Enums

- `GameType` = CS2 · VALORANT · MARVEL_RIVALS · COD
- `TournamentStatus` = UPCOMING · LIVE · FULL · FINISHED
- `RegistrationStatus` = REGISTERED · CHECKED_IN · ELIMINATED · WITHDRAWN
- `ContactType` = SUPPORT · PARTNERSHIP · BUG · FEEDBACK · OTHER

---

## 9. API / Rotas de backend

Todas em `src/app/api/**`, executam **somente no servidor**. A `STEAM_API_KEY` nunca é
exposta ao client (sem prefixo `NEXT_PUBLIC_`).

| Rota | Método | Auth | Corpo / Query | Resposta |
|------|--------|------|---------------|----------|
| `/api/auth/[...nextauth]` | GET/POST | público | — | Handlers do NextAuth (login, sessão, csrf) |
| `/api/auth/signup` | POST | público | `{name,email,password}` | `201 {ok,user}` · `409` e-mail existe · `400` inválido |
| `/api/tournaments` | GET | público | `?game=CS2` · `?live=true` | `{tournaments: TournamentDTO[]}` |
| `/api/tournaments/[id]/register` | POST | usuário | — | `201 {ok,filledSlots}` · `401` · `409` cheio/duplicado |
| `/api/steam/link` | GET | usuário | — | `302` → Steam OpenID |
| `/api/steam/callback` | GET | usuário | params OpenID | `302` → `/dashboard?steam=ok\|erro` |
| `/api/steam/sync` | POST | usuário | — | `{ok,gameCount}` · `400` sem vínculo · `503` sem key |
| `/api/contact` | POST | público | `{nome,email,assunto,mensagem,type}` | `{ok,persisted}` · `400` inválido |

**Inscrição** usa `prisma.$transaction`: verifica vaga, cria a inscrição, incrementa
`filledSlots` e vira `FULL` ao lotar. Violação de `@@unique` → `409 "Você já está inscrito."`

---

## 10. Fluxo de autenticação

1. **Cadastro** — `POST /api/auth/signup` valida com zod, faz `bcrypt.hash(senha, 10)` e
   cria o `User`. Em seguida o client chama `signIn("credentials")`.
2. **Login** — `Credentials.authorize` (em `src/auth.ts`) busca o usuário, compara o hash
   com `bcrypt.compare` e retorna `{id, email, name, coins, rank, steamLinked}`.
3. **Sessão JWT** — callbacks `jwt`/`session` (em `src/auth.config.ts`) propagam
   `id, coins, rank, steamLinked` para `session.user`.
4. **Proteção** — `middleware.ts` (instância edge-safe) protege `/dashboard`; o
   `dashboard/layout.tsx` revalida com `auth()` (defesa em profundidade).

---

## 11. Integração Steam

**Vínculo (OpenID 2.0)** — `src/lib/steam-openid.ts`:
1. `GET /api/steam/link` (logado) monta a URL `checkid_setup` e redireciona para
   `steamcommunity.com/openid/login`.
2. No retorno, `GET /api/steam/callback` re-posta os parâmetros com
   `check_authentication` (exige `is_valid:true` — impede callback forjado), extrai o
   `steamId64` do `claimed_id` e faz `upsert` no `SteamAccount`.

**Dados (Steam Web API)** — `src/lib/steam.ts` (server-only):
- `GetPlayerSummaries` → perfil + avatar
- `GetOwnedGames` → jogos + horas (ordenados)
- `GetUserStatsForGame` (appid 730) → stats de CS2 (trata 403 de perfil privado)

`POST /api/steam/sync` atualiza o cache em `SteamAccount` (`ownedGames`, `cs2Stats`,
`lastSyncedAt`). O dashboard lê do banco; o botão "Sincronizar" dispara o refresh.

---

## 12. Banco de dados local (Docker)

Criado durante o desenvolvimento (não havia Postgres nativo):

```bash
docker run -d --name victoryhub-db \
  -e POSTGRES_USER=victoryhub -e POSTGRES_PASSWORD=victoryhub -e POSTGRES_DB=victoryhub \
  -p 5432:5432 -v victoryhub-pgdata:/var/lib/postgresql/data postgres:16
```

`.env`:
```
DATABASE_URL="postgresql://victoryhub:victoryhub@localhost:5432/victoryhub?schema=public"
```

Gerenciamento:
```bash
docker start victoryhub-db     # reiniciar após reboot
docker stop  victoryhub-db
```

---

## 13. Como rodar e verificar

```bash
npm install
# .env já configurado (DATABASE_URL local + STEAM_API_KEY)
npm run db:migrate     # aplica o schema
npm run db:seed        # popula 4 torneios
npm run dev            # http://localhost:3000
```

**Verificações já executadas:**
- `npm run build` — 17 rotas compiladas (static/dynamic corretos)
- `npx tsc --noEmit` — sem erros de tipo
- `npm run lint` — sem warnings
- Signup → usuário persistido no Postgres (hash bcrypt)
- `/api/tournaments?game=COD` → lendo e filtrando do banco
- `/dashboard` sem auth → `307` redirect para `/login`

Inspecionar dados: `npm run db:studio` (Prisma Studio).

---

## 14. Histórico de implementação (milestones)

1. Scaffold Next.js + Tailwind v4 + dependências
2. Shell estático (componentes + Home + Sobre)
3. DB + torneios dinâmicos (schema, API, fallback mock, lista com fetch)
4. Contato + Feedback (validação + animação)
5. Auth (NextAuth v5: signup, login, middleware, navbar com sessão)
6. Inscrição em torneio (rota transacional)
7. Vínculo Steam (OpenID)
8. Dashboard + dados Steam (sync, perfil, jogos, stats)
9. Polish + verificação (lint, typecheck, build, smoke tests)
10. Banco Postgres local (Docker) + migrations + seed

---

## 15. Próximos passos / backlog

- **Evoluir a API** (próxima tarefa): novos endpoints (listar inscrições do usuário,
  detalhe de torneio, ranking), padronização de erros, possível documentação OpenAPI.
- Modal de login/cadastro (como no legado) além das páginas dedicadas.
- Mais estatísticas no dashboard (conquistas, gráficos).
- Deploy (Vercel + Neon/Supabase) e ajuste das URLs de callback da Steam.
- Testes automatizados (unit/integração).
