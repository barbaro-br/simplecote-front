## 1. Setup and Utilities

- [x] 1.1 Create `useGradeAoVivoSSE` hook to connect to `/api/cotacoes/{id}/ao-vivo/stream` and invalidate/update the cache when `LanceAtualizado` (or similar) events are received, verifying via tests or by checking the hook behavior in a test component.
- [x] 1.2 Expose the hook in `src/admin/cotacoes/cotacoes.api.ts` (or the appropriate API file) and verify it exports successfully without typescript errors.

## 2. Refactoring CotacaoDetalhePage

- [x] 2.1 Remove `ItensSection` and `RespostasSection` from `CotacaoDetalhePage.tsx` and verify the page still compiles and renders.
- [x] 2.2 Import and embed `GradeAoVivoTabela` directly inside `CotacaoDetalhePage`, passing the correct `id` from the URL params, and verify it renders the grid.
- [x] 2.3 Integrate `useGradeAoVivoSSE` inside the detail page (or inside the table component) to listen for updates when the quotation status is `ABERTA`, verifying that when connected, the data updates dynamically.

## 3. Cleanup

- [x] 3.1 Remove the now-obsolete `GradeAoVivoPage.tsx` and its route from `routes.tsx` (e.g. `/admin/cotacoes/:id/ao-vivo`) and verify that routing works without it.
- [x] 3.2 Run frontend checks (build, lint, test) to verify that no dead code remains and the application is healthy.
