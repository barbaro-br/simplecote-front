## Why

O front roda só em `vite` local. A demonstração precisa dele publicado; a escolha foi **Heroku**, como um app separado do backend (2 apps). Um SPA Vite não sobe no Heroku sem preparo:

- Não há como o Heroku servir o `dist/`: falta o buildpack estático e o `static.json`.
- Rotas de client-side (`/cotacao/:token`, `/admin/cotacoes/:id`, …) dão 404 no refresh sem **history fallback** (`/** → index.html`).
- `VITE_API_BASE_URL` é resolvido **no build**; hoje só existe `.env.development` (local, ignorado). Em produção o valor é a URL do backend no Heroku e precisa entrar no build.
- `package.json` não fixa a versão do Node — o buildpack pode escolher uma incompatível.

## What Changes

- **`static.json`** na raiz (buildpack `heroku-community/static`): `root: "dist/"`, `clean_urls: true`, `https_only: true`, `routes: { "/**": "index.html" }` (SPA fallback), e headers de segurança básicos (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`).
- **`app.json`** na raiz: `buildpacks: [heroku/nodejs, heroku-community/static]` (nodejs builda, static serve) e `env` declarando `VITE_API_BASE_URL` (required, sem default — é a URL do backend).
- **`package.json`**: `engines.node` fixado (`>=24 <25`, alinhado ao local `v24.15.0`). O buildpack nodejs roda `npm run build` automaticamente (há script `build`) e gera `dist/` antes de podar as devDependencies, então `vite`/`tsc` seguem como devDeps.
- **`.env.example`**: comentar que em produção `VITE_API_BASE_URL` é a URL do backend Heroku e entra como *config var* (o Vite lê `process.env.VITE_*` no build, com precedência sobre arquivos `.env`).
- **`README.md`**: seção "Deploy no Heroku (front)" — `heroku create <app-front>`, `heroku buildpacks:add heroku/nodejs` + `heroku buildpacks:add heroku-community/static`, `heroku config:set VITE_API_BASE_URL=https://<app-back>.herokuapp.com`, `git push heroku main`, e conferir que `/cotacao/<token>` abre no refresh.
- Sem mudança de código de `src/`: o app já lê `import.meta.env.VITE_API_BASE_URL` e faz chamadas absolutas quando ele existe.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Configuração de build/hospedagem para deploy — `static.json`, `app.json`, `engines`, docs. Sem alteração de comportamento da aplicação. `.openspec.yaml` declara `skip_specs: true`.

## Impact

- Raiz do repo: novos `static.json`, `app.json`; edição de `package.json` (`engines`), `.env.example` (comentário), `README.md`.
- Nenhum arquivo em `src/`.
- Coordena com a change `preparar-deploy-heroku` do `simplecote-back`: o `VITE_API_BASE_URL` deste app é a URL do backend; o backend precisa liberar CORS para a URL **deste** app (`SIMPLECOTE_CORS_ORIGINS`) e apontar `SIMPLECOTE_BASE_URL` para cá (o link mágico do representante é a rota `/cotacao/:token` deste front).
- A verificação e2e depende do backend já publicado (change irmã).
