## Context

Ver `proposal.md` — Why. Estado atual relevante:

- Build: `npm run build` = `tsc -b && vite build` → `dist/` (`dist/index.html` + `dist/assets/*` com hash no nome). `dist/` está no `.gitignore`. Node `>=24 <25` (`package.json` `engines`).
- Roteamento: `react-router-dom` 7 com `createBrowserRouter` — precisa de history fallback no host (toda rota desconhecida → `index.html`). Rotas reais: `/login`, `/admin/**`, `/cotacao/:token`.
- API base: `src/shared/api/api-client.ts:40` — `const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || ''`. Valor injetado no `vite build` a partir de `process.env.VITE_API_BASE_URL` (precede arquivos `.env`).
- Config Heroku hoje: `static.json` (`root: dist/`, `clean_urls`, `https_only`, `routes /** → index.html`, 3 headers de segurança) + `app.json` (buildpacks `heroku/nodejs` + `heroku-community/static`, env `VITE_API_BASE_URL`). `README` §"Deploy no Heroku" descreve o fluxo `git push heroku main` e um "Plano B" com `Procfile` + `serve`.
- Contrato cruzado com o back (já no `README`): `SIMPLECOTE_BASE_URL` e `SIMPLECOTE_CORS_ORIGINS` no `simplecote-back` valem a URL deste front (o link mágico do representante é `/cotacao/{token}`, rota daqui).

## Goals / Non-Goals

**Goals:**

- `vercel.json` reproduz o comportamento observável do `static.json`: SPA fallback, os 3 headers de segurança, HTTPS.
- Cache correto: `immutable` de 1 ano para `/assets/*` (nome com hash), sem cache agressivo no `index.html`.
- Deploy 100% pela integração Git da Vercel (auto-deploy no push em `main`), zero CLI obrigatória.
- `README` e `.env.example` descrevem o fluxo Vercel + as duas pontas (front Vercel ↔ back Heroku).

**Non-Goals:**

- Nenhuma mudança em código de aplicação, dependências, ou no output do build.
- Não criar o projeto na Vercel nem setar env vars — é ação de UI, fora do repo (documentada no `README`/tasks como runbook).
- Não mexer no `simplecote-back` (o ajuste de `SIMPLECOTE_*` lá é um change/di­­ff separado; aqui só se documenta).
- Não resolver o warning de chunk > 500 KB (polish opcional, item à parte).

## Decisions

### D1 — `vercel.json` versionado em vez de só configurar pela UI

Fonte de verdade no repo: `buildCommand`, `outputDirectory`, `rewrites`, `headers` ficam em `vercel.json`, não em "Project Settings" da Vercel. Motivo: revisável em PR, reproduzível, e sobrevive a recriar o projeto. Alternativa (só UI) rejeitada: config invisível no diff, fácil de divergir.

### D2 — `rewrites` (não `routes`) para o SPA fallback

`vercel.json` moderno: `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`. `rewrites` preserva a URL no browser (o router lê o path) e não intercepta assets estáticos existentes (a Vercel serve o arquivo real antes de aplicar rewrite). Alternativa `"routes"` (API legada) rejeitada: mistura-se mal com `headers` e está em modo de compatibilidade.

### D3 — Headers: 3 de segurança globais + `Cache-Control` para `/assets/*`

- `source: "/(.*)"` → `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` (cópia fiel do `static.json`).
- `source: "/assets/(.*)"` → `Cache-Control: public, max-age=31536000, immutable` — seguro porque o Vite põe hash no nome de todo arquivo em `assets/`; o `index.html` (não casado por essa regra) mantém o default da Vercel (revalidação), garantindo que um deploy novo seja pego na hora.
- `https_only` do `static.json` não vira config: a Vercel serve HTTPS e redireciona HTTP→HTTPS por padrão.
- `clean_urls` do `static.json`: adicionar `"cleanUrls": true` no `vercel.json` para preservar o comportamento anterior (sem `.html` na URL). Efeito praticamente nulo neste app (SPA), mas mantém paridade e custa uma linha.

### D4 — Remover `static.json` e `app.json` neste mesmo change

Nenhum dos dois tem efeito na Vercel e ambos descrevem um caminho de deploy que deixa de existir. Mantê-los "por segurança" só confunde. Rollback do change os traz de volta junto com a seção Heroku do `README` (D6). Alternativa (deixar como no-op) rejeitada: `app.json` é lido pelo botão "Deploy to Heroku" e por review apps — presença sugere um fluxo que não vamos manter.

### D5 — Versão do Node na Vercel

A Vercel lê `engines.node` do `package.json`, mas espera formato `"24.x"`; `">=24 <25"` não é aceito e ela cai no default dela. Decisão: **não** alterar `package.json` (o range atual é intencional e usado por outras ferramentas); em vez disso, o `README`/runbook instrui a fixar a versão do Node em "Project Settings → Node.js Version" na UI da Vercel. Alternativa (reescrever `engines.node` para `24.x`) rejeitada: mudaria contrato de dev por um detalhe de um host.

### D6 — `README`: substituir a seção inteira, preservando o contrato cruzado

"## Deploy no Heroku" → "## Deploy na Vercel". Conteúdo novo: (1) importar repo na UI da Vercel, framework Vite auto-detectado, build/output vêm do `vercel.json`; (2) setar `VITE_API_BASE_URL` = `https://<app-back>.herokuapp.com` (Production, e Preview se quiser); (3) fixar Node 24 na UI (D5); (4) manter a tabela do contrato cruzado com o back (`SIMPLECOTE_BASE_URL`, `SIMPLECOTE_CORS_ORIGINS` = URL da Vercel); (5) verificação pós-deploy (reload em `/admin/cotacoes` e num `/cotacao/<token>`, conferir Network sem CORS). Sai: passo a passo de buildpacks, `git push heroku main`, e o "Plano B / Procfile".

### D7 — Ordem de deploy das duas pontas (URLs circulares)

Front (Vercel) e back (Heroku) referenciam a URL um do outro. Runbook: (a) subir o front na Vercel com `VITE_API_BASE_URL` = URL do back (essa já existe/é conhecida); (b) a Vercel dá a URL do projeto; (c) `heroku config:set` no back com `SIMPLECOTE_BASE_URL` e `SIMPLECOTE_CORS_ORIGINS` = URL da Vercel; (d) se a URL do back ainda não existisse, usar placeholder e corrigir `VITE_API_BASE_URL` + redeploy. Documentado no `README`, não automatizado.

## Risks / Trade-offs

- **`rewrites` capturando assets** → Mitigado: a Vercel resolve arquivos estáticos reais antes de aplicar `rewrite`; `/assets/*` com hash sempre existe no `dist/`. Verificação pós-deploy cobre reload de rota profunda.
- **`Cache-Control: immutable` no arquivo errado** → Regra escopada a `/assets/(.*)`; `index.html` fica de fora e é revalidado, então deploy novo aparece sem hard-refresh.
- **Node version divergente na Vercel (D5)** → Sem fixar na UI, a Vercel usa a versão default dela; o build pode passar mesmo assim (Vite 8 tolera), mas o runbook manda fixar 24 para bater com dev/CI.
- **Esquecer o ajuste no back (D7)** → CORS quebra em produção e o link mágico do representante aponta para host errado. Mitigado pela tabela de contrato cruzado no `README` e por um passo explícito no runbook das tasks.
- **`app.json`/`static.json` removidos e ainda haver um remote `heroku` no front** → Deploy Heroku do front passa a falhar (sem `static.json`). Aceito: é justamente a intenção; o `README` deixa claro que o host do front agora é a Vercel.
- **Warning de chunk > 500 KB continua** → Não bloqueia o build nem o deploy; item de polish opcional, fora do caminho crítico.

## Migration Plan

1. Merge do change: remove `static.json`/`app.json`, adiciona `vercel.json`, atualiza `.env.example` e `README`.
2. Na UI da Vercel: importar o repo, confirmar Vite, setar `VITE_API_BASE_URL`, fixar Node 24, deploy.
3. No `simplecote-back` (Heroku): `heroku config:set SIMPLECOTE_BASE_URL=<url-vercel> SIMPLECOTE_CORS_ORIGINS=<url-vercel>`.
4. Verificar: abrir a URL da Vercel, login, reload em `/admin/cotacoes` e num `/cotacao/<token>`, Network sem CORS.
5. Rollback: reverter o commit (volta `static.json`, `app.json`, seção Heroku do `README`); o projeto Vercel pode ser deixado ou removido pela UI.

## Open Questions

- Nenhuma que altere o approach ou as tasks. (Nome do projeto/URL final na Vercel e se haverá domínio custom são decisões de UI pós-merge.)
