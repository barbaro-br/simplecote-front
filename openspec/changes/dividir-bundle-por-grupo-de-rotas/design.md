## Context

`src/routes.tsx` usa `createBrowserRouter` (react-router-dom v7) com todas as páginas importadas estaticamente no topo do arquivo — admin (`ProdutosPage`, `EmpresasPage`, `UsuariosPage`, `CotacoesPage`, `AnalisesPage`, `DashboardPage`, etc.), público mobile (`CotacaoPorTokenPage`, `PedidoPorTokenPage`, `ColaboradorPage`) e login/recuperação. `App.tsx` renderiza `<RouterProvider router={routes} />` sem nenhum `Suspense`. Build atual gera um único `dist/assets/index-*.js` de ~980KB minificado (confirmado com `vite build`). O único precedente de lazy-loading no projeto é o `LeitorCodigoBarras` dentro de `ColaboradorPage.tsx` (`React.lazy` + `Suspense` local, feito numa change anterior).

## Goals / Non-Goals

**Goals:**
- Quem abre `/colaborador/:token` ou `/cotacao/:token`/`/pedido/:token` no celular baixa só o código dessas telas + o que é genuinamente compartilhado (api-client, auth, UI base) — não o painel admin inteiro.
- Zero mudança de comportamento funcional/dado exibido em qualquer tela.
- Não quebrar o smoke test de deploy (`deploy.yml`), que depende de achar a URL do back dentro do bundle publicado.

**Non-Goals:**
- Não otimiza o tamanho de cada chunk individualmente (ex: não troca Recharts por lib mais leve) — só separa o que já existe em grupos carregados sob demanda.
- Não adiciona SSR/prerendering.
- Não mexe no back (confirmado com o usuário: mudança é 100% build/bundling do front).

## Decisions

- **Usar a API `route.lazy()` do react-router (data router), não `React.lazy()` manual por página.** Como o projeto já usa `createBrowserRouter` (data router API do react-router v6.4+/v7), cada rota pode declarar `lazy: () => import('./Pagina').then(m => ({ Component: m.Pagina }))` em vez de `element: <Pagina />` com import estático. Alternativa considerada: `React.lazy()` + um `<Suspense>` global em `App.tsx` (mesmo padrão já usado no `LeitorCodigoBarras`). Rejeitada como abordagem principal porque `route.lazy()` é o mecanismo nativo do data router — integra com o ciclo de navegação (loaders, fallback por rota) sem precisar de Suspense manual ao redor do `RouterProvider` inteiro. Confirmar durante a implementação (na versão instalada do `react-router-dom`) se `route.lazy()` exige ou não um `HydrateFallback`/loading state próprio por rota; se a versão instalada não suportar bem, cair para a alternativa (`React.lazy` + `Suspense` local por grupo), documentando a troca aqui.
- **Agrupamento em 3 blocos**: (1) admin — tudo sob `path: '/admin'`; (2) público mobile — `/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`; (3) login/esqueci-senha/redefinir-senha ficam com import estático (são pequenas, e são a primeira coisa que qualquer usuário não-autenticado vê — lazy aí só adicionaria uma etapa de carregamento sem ganho real).
- **Módulos compartilhados não são forçados a nenhum chunk manualmente** — deixar o Rollup/Vite decidir via chunking automático (qualquer módulo importado por 2+ entradas lazy vira chunk comum automaticamente). Alternativa considerada: `build.rollupOptions.output.manualChunks` explícito. Rejeitada por agora — complexidade desnecessária antes de medir se o chunking automático já resolve bem; revisar `dist/assets/*.js` após o build e só configurar manual chunks se o resultado não for satisfatório.

## Risks / Trade-offs

- [Smoke test do deploy quebra] → o regex de `deploy.yml` procura `/assets/index-[A-Za-z0-9_-]+\.js`. Se o `api-client.ts` (que usa `VITE_API_BASE_URL`) migrar para um chunk com outro prefixo de nome, o smoke test não encontra a URL e falha o deploy (falso negativo, não um bug real). Mitigação: buildar localmente com `VITE_API_BASE_URL` setado, inspecionar `dist/assets/*.js` pra achar qual chunk contém a URL, e ajustar o regex do `deploy.yml` nesta mesma change se o nome do chunk mudou. Task dedicada pra isso abaixo.
- [Flash de carregamento na primeira navegação pra uma área nova] → aceitável (documentado no proposal como único efeito observável), mas o fallback visual precisa ser minimamente decente (não uma tela branca) — usar um skeleton simples, reaproveitando o padrão de `Skeleton` já usado em outras telas do projeto onde existir um genérico, ou um spinner simples se não houver.
- [Testes que montam páginas via `render(<Componente />)` direto, sem passar pelo router] → não são afetados (não usam `routes.tsx`). Testes que efetivamente navegam via `RouterProvider`/`MemoryRouter` podem precisar de `findBy*`/`waitFor` em vez de `getBy*` na primeira renderização pós-navegação — mesmo ajuste já aplicado em `ColaboradorPage.test.tsx` para o `LeitorCodigoBarras` lazy.

## Migration Plan

Mudança é só de build; não há dado migrado nem coisa a reverter no servidor. Deploy normal (push em `main` → CI → Vercel). Se o smoke test falhar por causa do regex do chunk, o pipeline já bloqueia o deploy antes de ir ao ar (comportamento correto do smoke test — não é uma regressão de produção, é o safety net funcionando). Rollback, se necessário depois de já estar no ar: `vercel rollback`, igual a qualquer outro deploy do front.
