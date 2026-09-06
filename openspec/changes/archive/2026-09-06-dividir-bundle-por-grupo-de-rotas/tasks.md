## 1. Rotas do admin

- [x] 1.1 Confirmar na versão instalada de `react-router-dom` (`package.json`) se `route.lazy()` é suportado como documentado no design; se não for, usar `React.lazy()` + `Suspense` por grupo (registrar a troca no design.md)
- [x] 1.2 Em `routes.tsx`, converter as rotas sob `/admin` (Dashboard, Cotações, NovaCotação, CotaçãoDetalhe, Resultado, Produtos, Empresas, Usuários, Análises, Configurações) de `element: <Pagina />` com import estático para `lazy: () => import('./caminho').then(m => ({ Component: m.Pagina }))`
- [x] 1.3 Rodar `npm run dev`, navegar por todas as telas do admin manualmente e confirmar que carregam sem erro de console

## 2. Rotas públicas mobile

- [x] 2.1 Converter `/cotacao/:token`, `/pedido/:token`, `/colaborador/:token` para `lazy` da mesma forma
- [x] 2.2 Rodar `npm run dev`, abrir cada uma das 3 rotas públicas e confirmar que carregam sem erro de console

## 3. Fallback de carregamento

- [x] 3.1 Definir e aplicar um fallback visual simples (skeleton ou spinner) para o carregamento do chunk — via `HydrateFallback`/`errorElement` por rota se `route.lazy()` exigir, ou `<Suspense fallback={...}>` ao redor do `RouterProvider` em `App.tsx` se a alternativa do design for necessária

## 4. Build e verificação do bundle

- [x] 4.1 Rodar `VITE_API_BASE_URL=<url-do-back> npx vite build` e listar `dist/assets/*.js` — confirmar que existe separação real (chunk do admin bem maior que o chunk público, ou pelo menos que os dois não são mais um único arquivo de ~980KB)
- [x] 4.2 Localizar qual chunk contém a string da `VITE_API_BASE_URL` (`grep` no `dist/assets/*.js` buildado) — se não for mais um arquivo com prefixo `index-`, atualizar o regex do smoke test em `simplecote-front/.github/workflows/deploy.yml` (linha do `bundle=""` / `BASH_REMATCH`) para o padrão correto
- [x] 4.3 Se o item 4.2 exigiu mudança no `deploy.yml`, rodar o smoke test localmente simulando os passos do workflow (servir `dist/` com `vite preview` ou similar e repetir a lógica do `curl`/`grep`) antes de confiar no CI

## 5. Checagem de saúde

- [x] 5.1 `npx vitest run` completo — verde; ajustar testes que dependam de renderização síncrona pós-navegação (`getBy*` → `findBy*`/`waitFor`) onde a suíte apontar
- [x] 5.2 `npx tsc -b` e `npx oxlint` — sem erro novo
- [x] 5.3 `npx vite build` final — sem novo aviso de chunk >500KB para o grupo público (o grupo admin pode continuar grande, é esperado e aceitável)
