## 1. Scroll no topo ao navegar

- [x] 1.1 Adicionar `<ScrollRestoration />` (react-router-dom) dentro de `src/admin/layout/AdminLayout.tsx`. Verificar: `npm run build` verde e o teste existente de `AdminLayout` continua verde.

## 2. Transição de rota sem snap

- [x] 2.1 Em `src/shared/components/ui/route-transition.tsx`, remover o `document.startViewTransition` e o estado de display (`displayLocation`/`displayOutlet`/`transitionStage`), renderizando o outlet atual com fade-in via `key={location.pathname}`. Verificar: `npm run build` verde.
- [x] 2.2 No mesmo arquivo, remover o fallback de fadeOut/`onTransitionEnd` (o flash em branco), mantendo apenas o fade-in do novo conteúdo. Verificar: `npm run build` verde.

## 3. Teste

- [x] 3.1 Adicionar teste de `RouteTransition` cobrindo que o outlet novo é exibido após a troca de rota (e que não quebra sem `startViewTransition`). Verificar: `npm test` verde.

## 4. Verificação final

- [x] 4.1 Rodar `npm run build`, `npm test` e `npm run lint` e confirmar os três verdes (regra AGENTS.md §3).
