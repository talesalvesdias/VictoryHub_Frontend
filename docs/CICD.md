# CI/CD — GitHub Actions + Vercel

Pipeline básico do VictoryHub (item de Abril do cronograma: *"CI/CD básico — deixar os
deploys mais dinâmicos"*).

## Workflows

| Arquivo | Gatilho | O que faz |
|---------|---------|-----------|
| `.github/workflows/ci.yml` | push no `main` + todo PR | Barreira de qualidade: `npm ci` → `prisma generate` → `prisma migrate deploy` (Postgres de serviço) → `lint` → `typecheck` → `build` |
| `.github/workflows/deploy.yml` | push no `main` + todo PR | Deploy na Vercel — **preview** por PR, **produção** no `main` |

O CI sobe um container **Postgres 16** como serviço e aplica as migrations de verdade,
então um schema quebrado é pego antes do merge. O CI **não** depende de nenhum secret
externo (usa valores dummy), então sempre roda — ideal como *required check*.

## Configurar o deploy (Vercel)

O `deploy.yml` só executa o deploy se os 3 secrets existirem (senão é pulado com um aviso).

### 1. Criar o projeto na Vercel
```bash
npm i -g vercel
vercel link        # vincula a pasta ao projeto Vercel (cria .vercel/)
```
Isso gera `.vercel/project.json` com o **orgId** e o **projectId**.

### 2. Gerar um token
Vercel → **Account Settings → Tokens → Create** → copie o valor.

### 3. Adicionar os secrets no GitHub
Repositório → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Valor |
|--------|-------|
| `VERCEL_TOKEN` | o token criado no passo 2 |
| `VERCEL_ORG_ID` | `orgId` do `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` do `.vercel/project.json` |

### 4. Variáveis de ambiente da aplicação (na Vercel)
No projeto da Vercel → **Settings → Environment Variables**, defina (Production + Preview):

| Variável | Observação |
|----------|------------|
| `DATABASE_URL` | Postgres gerenciado (Neon/Supabase) — **não** use o Docker local |
| `AUTH_SECRET` | `npx auth secret` |
| `AUTH_URL` / `NEXT_PUBLIC_BASE_URL` | a URL pública do deploy |
| `STEAM_API_KEY` | chave da Steam Web API (server-only) |

> O `prisma generate` roda automaticamente no `postinstall`. As **migrations de produção**
> (`prisma migrate deploy`) devem ser aplicadas contra o banco de produção — rode manualmente
> ou adicione um passo de release quando a infra estiver definida (ECS/RDS em maio).

## Fluxo do dia a dia

1. Abre um PR → **CI** valida lint/types/build/migrations e a **Vercel** publica uma URL de preview.
2. Merge no `main` → **CI** roda de novo e a **Vercel** promove para **produção**.

## Próximos passos (alinhado ao cronograma)

- **Junho**: adicionar `npm test` (testes unitários + integração) como passo do CI.
- **Maio**: quando a infra AWS subir (ECS Fargate), trocar/duplicar o CD por build de
  imagem Docker → registry → ECS. O CI permanece igual.
