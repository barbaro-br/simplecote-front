## 1. Configuração Vercel no repo

- [x] 1.1 Criar `vercel.json` na raiz com `buildCommand: "npm run build"`, `outputDirectory: "dist"`, `cleanUrls: true`, `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]`, e `headers`: (a) `source "/(.*)"` com `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`; (b) `source "/assets/(.*)"` com `Cache-Control: public, max-age=31536000, immutable`. Verificar: `python3 -m json.tool vercel.json` sai sem erro e os 3 headers batem com os do `static.json` atual.
- [x] 1.2 Remover `static.json` e `app.json` da raiz. Verificar: `git status` mostra os dois como deleted; `grep -rn "static.json\|app.json" .` (fora de `node_modules`/`openspec/changes`) não retorna referências vivas.

## 2. Documentação

- [x] 2.1 Atualizar `.env.example`: substituir o bloco de comentário "Em produção (Heroku)… `heroku config:set`" por instrução Vercel (`vercel env add VITE_API_BASE_URL` ou painel → Settings → Environment Variables); manter a linha `VITE_API_BASE_URL=http://localhost:8080` para o fluxo local. Verificar: `cat .env.example` não menciona mais Heroku e cita Vercel.
- [x] 2.2 No `README.md`, renomear a seção "## Deploy no Heroku" para "## Deploy na Vercel" e reescrever o corpo: importar o repo na UI da Vercel (framework Vite auto-detectado; build/output vêm do `vercel.json`), setar `VITE_API_BASE_URL=https://<app-back>.herokuapp.com`, fixar "Node.js Version" = 24 em Project Settings, e auto-deploy no push em `main`. Remover o passo a passo de buildpacks, `git push heroku main` e o "Plano B / Procfile". Verificar: revisão do diff — a seção não cita mais `heroku`/buildpack/`static.json`.
- [x] 2.3 No `README.md`, manter (adaptando o texto) a tabela do contrato cruzado com o back — `SIMPLECOTE_BASE_URL` e `SIMPLECOTE_CORS_ORIGINS` no `simplecote-back` = URL da Vercel — e a verificação pós-deploy (reload em `/admin/cotacoes` e num `/cotacao/<token>`; Network sem CORS). Incluir o runbook das URLs circulares (placeholder → deploy das duas pontas → corrigir com URLs reais). Verificar: revisão do diff — a tabela e a checklist pós-deploy seguem presentes, agora referenciando a Vercel.

## 3. Verificação do build

- [x] 3.1 Rodar `npm run build` e confirmar `dist/index.html` + `dist/assets/` gerados; `tsc -b` sem erro. Verificar: `ls dist/index.html dist/assets/` lista os arquivos e o comando sai com status 0.
- [x] 3.2 Confirmar que `dist/` continua ignorado. Verificar: `git check-ignore dist` retorna `dist` e `git status` não lista arquivos de `dist/`.
- [x] 3.3 Sanidade do fallback SPA localmente: `npm run preview` e abrir `/admin/cotacoes` e `/cotacao/teste` com reload — as duas rotas resolvem (o `preview` do Vite já faz history fallback, espelhando o `rewrite` da Vercel). Verificar: nenhuma das duas dá 404 no reload.

## 4. Polish opcional (não bloqueia)

- [x] 4.1 (Opcional) No `vite.config.ts`, adicionar `build.rollupOptions.output.manualChunks` separando um vendor chunk (`react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`) OU elevar `build.chunkSizeWarningLimit`, para silenciar o warning de chunk > 500 KB. Verificar: `npm run build` roda sem o warning de tamanho de chunk.
