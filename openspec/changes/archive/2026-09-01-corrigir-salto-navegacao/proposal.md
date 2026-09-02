## Why

Ao navegar entre as telas do painel admin (ex.: `/usuarios` → `/cotacoes`), o conteúdo aparece deslocado para baixo e depois "salta" para cima. A causa é dupla: o router (`createBrowserRouter`) não usa `<ScrollRestoration/>`, então o scroll não é resetado ao trocar de rota; e o `RouteTransition` usa `document.startViewTransition` sem `flushSync`, fazendo o snapshot da transição capturar o outlet antigo e produzir um snap visível.

## What Changes

- Adicionar `<ScrollRestoration />` (react-router-dom) à árvore do router para resetar o scroll ao topo a cada navegação (e restaurar no back/forward).
- Consertar `RouteTransition`: usar `flushSync` no callback do `startViewTransition` para o novo outlet commitar antes do snapshot, e corrigir o path de fallback (navegadores sem `startViewTransition`).

## Capabilities

### New Capabilities

<!-- Nenhuma capability nova. -->

### Modified Capabilities

- `core/setup`: a navegação entre rotas SHALL resetar o scroll para o topo, sem "salto" (o conteúdo não deve aparecer deslocado para baixo).

## Impact

- **Código:** `src/shared/components/ui/route-transition.tsx` (flushSync + fallback), `src/App.tsx` ou `src/routes.tsx` (adicionar `<ScrollRestoration />`).
- **Testes:** caso de componente/hook cobrindo o reset de scroll na navegação.
- **Sem mudança** de contrato de API, regra de negócio ou dependências novas (react-router-dom já é dependência).
