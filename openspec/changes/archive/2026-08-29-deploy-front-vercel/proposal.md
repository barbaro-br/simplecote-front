## Why

O `preparar-deploy-heroku` (arquivado) configurou o front como SPA estática servida pelo buildpack `heroku-community/static`, que é um buildpack de comunidade, sem SLA e com "Plano B" já documentado no `README`. A Vercel hospeda SPA Vite com history fallback, HTTPS e headers nativamente, no plano Hobby (grátis), com auto-deploy no push — melhor encaixe para a demo em produção sem virar ops. Este change troca a configuração de deploy do front de Heroku para Vercel.

## What Changes

- **Remover `static.json` e `app.json`** — configuração exclusiva dos buildpacks Heroku (`heroku/nodejs` + `heroku-community/static` e o app manifest). A Vercel ignora os dois; ficam como lixo.
- **Adicionar `vercel.json`:**
  - `buildCommand: "npm run build"`, `outputDirectory: "dist"`;
  - `rewrites`: `/(.*)` → `/index.html` — history fallback SPA para o `createBrowserRouter` (rotas `/admin/**` e `/cotacao/:token` resolvem em reload/deep-link);
  - `headers`: os três de segurança que estavam no `static.json` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`) para todas as rotas, e `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` (arquivos com hash no nome).
- **`.env.example`** — trocar o comentário de produção "Heroku `config:set`" por "Vercel: `vercel env add VITE_API_BASE_URL` ou pelo painel". Sem mudança de código: `src/shared/api/api-client.ts` já lê `import.meta.env.VITE_API_BASE_URL` no build (com fallback `''`).
- **`README.md`** — a seção "Deploy no Heroku" vira "Deploy na Vercel": importar o repo pela UI, framework Vite auto-detectado, `VITE_API_BASE_URL` = URL do back no Heroku. Mantém a nota cross-repo: o back precisa de `SIMPLECOTE_BASE_URL` e `SIMPLECOTE_CORS_ORIGINS` apontando para a URL da Vercel. Sai o passo a passo de buildpacks e o "Plano B / Procfile".
- **Opcional (polish, não bloqueia):** `manualChunks` (vendor react/router/query) ou `build.chunkSizeWarningLimit` no `vite.config.ts` para silenciar o warning de chunk > 500 KB.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Mudança puramente de configuração de deploy e documentação — sem alteração de comportamento observável da aplicação (mesmas rotas, mesmos headers de segurança, mesma leitura de `VITE_API_BASE_URL` no build). `.openspec.yaml` declara `skip_specs: true`.

## Impact

- **Removidos:** `static.json`, `app.json`.
- **Novo:** `vercel.json`.
- **Editados:** `.env.example` (comentário), `README.md` (seção de deploy), possivelmente `vite.config.ts` (polish opcional).
- **Sem mudança de código de aplicação**, sem novas dependências npm, sem mudança em `dist/` (já no `.gitignore`).
- **Cross-repo:** depende de o `simplecote-back` ter `SIMPLECOTE_BASE_URL` e `SIMPLECOTE_CORS_ORIGINS` = URL da Vercel. As duas URLs se referenciam mutuamente → estratégia de placeholder no primeiro deploy, correção depois com as URLs reais.
- **Infra externa:** projeto novo na Vercel conectado ao repo GitHub (feito pela UI, fora do controle deste change).
