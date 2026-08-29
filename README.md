# simplecote-front

Front-end do SimpleCote (React + TypeScript + Vite). Arquitetura pasta-por-feature — ver `spec.md` §5.

## Setup

```bash
npm install
cp .env.example .env.development   # ajuste VITE_API_BASE_URL se o backend não estiver em localhost:8080
```

O backend local sobe em `http://localhost:8080` via `./mvnw spring-boot:test-run` no repositório `simplecote-back` (ver `spec.md` §6).

## Desenvolvimento local

Roteiro para rodar front + backend juntos, com autenticação real:

1. **Backend** — no repositório `simplecote-back` (requer **Docker** rodando, para o Postgres via Testcontainers):

   ```bash
   AUTH_ENABLED=true ./mvnw spring-boot:test-run
   ```

   Sobe em `http://localhost:8080` com a auth ligada e o perfil de dev, que semeia (`SeedDadosDev`) um admin e alguns dados de exemplo.

2. **Front** — neste repositório:

   ```bash
   cp .env.example .env.development   # VITE_API_BASE_URL=http://localhost:8080
   npm run dev
   ```

3. **Login** — abra `http://localhost:5173/login` e entre com as credenciais semeadas:

   | Campo | Valor |
   | ----- | ----- |
   | E-mail | `admin@dev.local` |
   | Senha | `admin123` |

   O JWT fica em `sessionStorage` e o app redireciona para `/admin`. Recarregar a página mantém a sessão; um `401` numa chamada autenticada leva de volta para `/login`.

## Scripts

| Comando         | O que faz                                    |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento (Vite + HMR)     |
| `npm test`      | Suíte de testes (Vitest, uma passada)        |
| `npm run build` | Type-check (`tsc -b`) + build de produção    |
| `npm run lint`  | Oxlint                                       |
| `npm run preview` | Serve o `dist/` gerado pelo build          |

## Ambiente

`VITE_API_BASE_URL` — base URL da API. Definida em `.env.development` (local, não versionado);
`.env.example` é o template versionado. Ver `spec.md` §6.

## Deploy na Vercel

App separado do backend. **Pré-requisito:** o `simplecote-back` já publicado no Heroku — precisamos da URL dele.

Toda a configuração de build/roteamento/headers está versionada em `vercel.json`
(`buildCommand: npm run build`, `outputDirectory: dist`, `rewrites` de SPA para `/index.html`,
headers de segurança e `Cache-Control: immutable` para `/assets/*`).

1. **Importar o repo** — no painel da Vercel, *Add New… → Project* e conecte este repositório
   GitHub. O framework **Vite** é auto-detectado; build e output vêm do `vercel.json`, não mexa
   nos campos.
2. **Node.js Version** — em *Project → Settings → Build & Deployment*, fixe **24.x**
   (o `package.json` usa o range `>=24 <25`, que a Vercel não interpreta; sem fixar, ela usa o
   default dela).
3. **Environment Variable** — em *Project → Settings → Environment Variables*, adicione
   `VITE_API_BASE_URL = https://<app-back>.herokuapp.com` (ao menos no ambiente *Production*;
   *Preview* também se for usar). Lida no `vite build` via `process.env`.
4. **Deploy** — a Vercel faz deploy automático a cada push em `main`; o primeiro roda na
   importação.

**Contrato cruzado com o backend:**

| No `simplecote-back` (Heroku) | Vale a URL deste app na Vercel (`https://<projeto>.vercel.app`) |
| --- | --- |
| `SIMPLECOTE_BASE_URL` | o link mágico do representante é `/cotacao/{token}`, rota deste front |
| `SIMPLECOTE_CORS_ORIGINS` | idem — sem isso as chamadas do front dão CORS |

```bash
heroku config:set -a <app-back> \
  SIMPLECOTE_BASE_URL=https://<projeto>.vercel.app \
  SIMPLECOTE_CORS_ORIGINS=https://<projeto>.vercel.app
```

> **URLs circulares:** front e back referenciam a URL um do outro. Se ainda não souber uma
> das duas, suba com um placeholder, faça o deploy das duas pontas, e então corrija
> `VITE_API_BASE_URL` (Vercel) e `SIMPLECOTE_*` (Heroku) com as URLs reais + redeploy.

Verificação pós-deploy: abrir a URL da Vercel, logar em `/login`, e **recarregar** em
`/admin/cotacoes` e num link `/cotacao/<token>` — as duas rotas têm que resolver (é o
`rewrites` do `vercel.json` que faz o history fallback). Conferir na aba Network que as
chamadas vão para `<app-back>` e não dão CORS.
