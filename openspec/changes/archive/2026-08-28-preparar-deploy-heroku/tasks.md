## 1. Config de build/hospedagem

- [x] 1.1 `static.json` na raiz: `root: "dist/"`, `clean_urls: true`, `https_only: true`, `routes: { "/**": "index.html" }`, `headers` com `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. Verificar: `python3 -c "import json;json.load(open('static.json'))"` OK.
- [x] 1.2 `package.json`: adicionar `"engines": { "node": ">=24 <25" }`. Verificar: `npm run build` local continua gerando `dist/index.html` + `dist/assets/*` com o Node atual.
- [x] 1.3 `app.json` na raiz: `buildpacks: [{"url":"heroku/nodejs"},{"url":"heroku-community/static"}]` e `env: { "VITE_API_BASE_URL": { "required": true, "description": "URL do backend no Heroku (ex.: https://<app-back>.herokuapp.com)" } }`. Verificar: `python3 -c "import json;json.load(open('app.json'))"` OK.
- [x] 1.4 `.env.example`: acrescentar comentário — em produção `VITE_API_BASE_URL` é a URL do backend Heroku e entra como `heroku config:set VITE_API_BASE_URL=…` (lido no `vite build` via `process.env`, com precedência sobre arquivos `.env`). Verificar: `.env.example` segue sendo o único `.env*` versionado (`git check-ignore .env.example` vazio).

## 2. Documentação

- [x] 2.1 `README.md` — seção "## Deploy no Heroku": pré-requisito (backend já publicado, change irmã do `simplecote-back`); `heroku create <app-front>`; `heroku buildpacks:add heroku/nodejs -a <app-front>` + `heroku buildpacks:add heroku-community/static -a <app-front>`; `heroku config:set -a <app-front> VITE_API_BASE_URL=https://<app-back>.herokuapp.com`; `git push heroku main`; verificação: abrir a URL, logar em `/login`, e recarregar em `/admin/cotacoes` e num link `/cotacao/<token>` — as duas rotas têm que resolver (SPA fallback). Nota cruzada: a URL deste app é o que vai em `SIMPLECOTE_BASE_URL` e `SIMPLECOTE_CORS_ORIGINS` do backend. Plano B do buildpack estático (`serve -s dist` + `Procfile`) mencionado em uma linha.

## 3. Fechamento

- [x] 3.1 `npm run build` → exit 0, `dist/index.html` + `dist/assets/*` gerados, `dist/` gitignorado; `npx vitest run` → **21 arquivos / 68 testes** verdes. `static.json`/`app.json`/`package.json` parseiam; `.env.example` segue rastreável.
- [ ] 3.2 Deploy real num app Heroku de teste com `VITE_API_BASE_URL` apontando para o backend publicado: `git push heroku main` builda com Node 24, o app abre, o login funciona contra o backend (CORS liberado pela change irmã), e recarregar em `/admin/cotacoes/:id` e `/cotacao/:token` não dá 404. Registrar a URL e ajustes no fechamento.
- [x] 3.3 `openspec validate preparar-deploy-heroku` sem erros.
