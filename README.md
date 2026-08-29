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

## Deploy no Heroku

App separado do backend. **Pré-requisito:** o `simplecote-back` já publicado (change irmã `preparar-deploy-heroku`) — precisamos da URL dele.

Pré-requisitos: [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli), `heroku login`.

```bash
heroku create <app-front>
heroku buildpacks:add -a <app-front> heroku/nodejs
heroku buildpacks:add -a <app-front> heroku-community/static

heroku config:set -a <app-front> VITE_API_BASE_URL=https://<app-back>.herokuapp.com

git push heroku main
```

O buildpack `heroku/nodejs` roda `npm ci` + `npm run build` (script `build`) → `dist/`; o
`heroku-community/static` serve o `dist/` (config em `static.json`: `routes: {"/**": "index.html"}`
para o SPA fallback, `https_only`). O `VITE_API_BASE_URL` é lido no build via `process.env`.

**Contrato cruzado com o backend:**

| No `simplecote-back` | Vale a URL deste app (`<app-front>`) |
| --- | --- |
| `SIMPLECOTE_BASE_URL` | o link mágico do representante é `/cotacao/{token}`, rota deste front |
| `SIMPLECOTE_CORS_ORIGINS` | idem |

Verificação pós-deploy: abrir a URL, logar em `/login`, e **recarregar** em `/admin/cotacoes`
e num link `/cotacao/<token>` — as duas rotas têm que resolver (é o `static.json` que faz o
history fallback). Conferir na aba Network que as chamadas vão para `<app-back>` e não dão CORS.

> Plano B, se o buildpack `heroku-community/static` sair do ar: `heroku/nodejs` + um
> `Procfile` com `web: npx serve -s dist -l $PORT` (adicionar `serve` às `dependencies`).
