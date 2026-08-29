## Context

Ver `proposal.md` — Why. Estado atual:

- Vite SPA, `type: module`, `scripts.build = "tsc -b && vite build"` → `dist/` (gitignorado). `preview = "vite preview"`. Sem `engines`.
- `vite.config.ts`: só `plugins` + alias `@` + `server.proxy` (dev). Nenhuma config de `base`/`build.outDir` custom → `dist/` na raiz.
- `api-client.ts`: `getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || ''`. Com a var → URLs absolutas; sem ela → relativas (proxy do Vite em dev).
- `.env.development` (local, ignorado pelo `~/.gitignore_global` que ignora `.env.*` exceto `.env.example`); `.env.example` versionado.
- Rotas: `createBrowserRouter` (history API) — `/login`, `/admin/**`, `/cotacao/:token`, `/pedido/:token`. Todas precisam de fallback para `index.html` no servidor estático.

## Goals / Non-Goals

**Goals:**
- `git push heroku main` publica o front como estático, com SPA fallback (refresh em qualquer rota funciona) e HTTPS.
- `VITE_API_BASE_URL` de produção entra no build via config var do Heroku, apontando para o backend.
- Zero mudança em `src/`.

**Non-Goals:**
- CI/CD, preview apps automáticas (só deploy manual documentado; `app.json` é o mínimo).
- SSR / pre-render / Node server próprio — hospedagem 100% estática.
- CDN custom, domínio custom, cache-busting além do hash de arquivo que o Vite já faz.
- Mexer no backend (change irmã).

## Decisions

### 1. Buildpacks: `heroku/nodejs` + `heroku-community/static`
O nodejs builda (`npm ci` + `npm run build` automático quando há script `build`), o static serve `dist/`. Ordem importa: nodejs primeiro.

- Alternativa — só `heroku/nodejs` + `vite preview`/`serve` como processo `web`: mantém um dyno Node rodando à toa para servir arquivos; o buildpack estático é feito pra isso e é mais barato/simples.
- Alternativa — Dockerfile com nginx: mais controle, mais superfície de manutenção; desnecessário para um SPA.

### 2. `static.json` com history fallback e HTTPS
```json
{
  "root": "dist/",
  "clean_urls": true,
  "https_only": true,
  "routes": { "/**": "index.html" },
  "headers": {
    "/**": {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }
  }
}
```
`routes: {"/**": "index.html"}` é o fallback de SPA. Assets com hash do Vite continuam servidos direto (o buildpack casa arquivo existente antes do fallback).

- Sem `Cache-Control` custom: o padrão do buildpack + o hash nos nomes de arquivo do Vite já resolvem invalidação.

### 3. `VITE_API_BASE_URL` como config var, não arquivo
O Vite, no `vite build`, expõe em `import.meta.env` tanto os `.env*` quanto os `process.env.VITE_*` que já existem — e estes têm **precedência**. Então `heroku config:set VITE_API_BASE_URL=https://<back>` é lido no build sem nenhum `.env.production` no repo. Um `.env.production` versionado seria confuso (valor "cozido") e, além disso, o `~/.gitignore_global` ignora `.env.*` — nem daria pra commitar. O `.env.example` ganha um comentário explicando isso.

### 4. `engines.node`
`"engines": { "node": ">=24 <25" }` — casa com o `v24.15.0` local e evita o buildpack pular para uma major nova sem querer. `npm` fica no default do buildpack.

- Risco de devDeps: o buildpack nodejs instala tudo, roda `build`, e só então poda `devDependencies`. `vite`/`typescript`/plugins como devDeps funcionam. Se um dia o buildpack mudar a ordem, o plano B é `NPM_CONFIG_INCLUDE=dev` como config var — documentado no README, não aplicado agora.

### 5. `app.json` mínimo
`buildpacks` (os dois, na ordem) + `env: { "VITE_API_BASE_URL": { "required": true, "description": "URL do backend no Heroku" } }`. Sem `addons`, sem `scripts`, sem `formation`.

## Risks / Trade-offs

- **`heroku-community/static` é community** (não oficial da Heroku) — estável e amplamente usado, mas sem SLA da Heroku. → Se for descontinuado, plano B é `heroku/nodejs` + `serve -s dist` como processo `web` (um `Procfile`); troca pequena, documentada como alternativa no README.
- **`VITE_API_BASE_URL` errado no build** → o app chama a origem errada e tudo dá CORS/404. Mitigação: `app.json` marca a var como `required`; o README manda conferir a aba Network após o primeiro deploy.
- **Rota `/cotacao/:token` no refresh** — sem o `routes` do `static.json` daria 404. Coberto pela Decisão 2; a tarefa de verificação e2e testa exatamente isso.
- **Ordem de deploy** — o front precisa do `VITE_API_BASE_URL` (URL do back) para buildar útil, então o backend sobe primeiro. Documentado no README como pré-requisito.
