## Context

O router é `createBrowserRouter` (`src/routes.tsx`) sem `<ScrollRestoration/>`, então o scroll persiste entre navegações SPA. O `RouteTransition` (`src/shared/components/ui/route-transition.tsx`) usa `document.startViewTransition` sem `flushSync`, o que faz o snapshot da transição capturar o outlet antigo e produzir um snap visível. Motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Navegação entre telas do painel abre no topo, sem salto.
- Transição de rota sem snap, mantendo o fade (onde houver suporte).

**Non-Goals:**
- Não mudar a estrutura de rotas, o cliente HTTP ou qualquer tela específica.
- Não adicionar dependências (react-router-dom já é dependência).

## Decisions

### D1 — `<ScrollRestoration/>` no shell do admin
Adicionar `<ScrollRestoration/>` (react-router-dom) dentro de `AdminLayout`, que cobre toda a árvore `/admin/**`. Ele reseta o scroll ao topo em navegação (PUSH/replace) e restaura a posição no back/forward (POP).
- **Alternativa considerada:** `useEffect` + `window.scrollTo(0,0)` manual — descartada por não restaurar no POP e por reinventar o que o react-router já provê.

### D2 — Remover o `startViewTransition` (simplificar o RouteTransition)
O `document.startViewTransition` (mesmo com `flushSync`) mantém um crossfade de snapshot do viewport inteiro que causa o "salto" a cada navegação. A correção é remover o `startViewTransition` e o estado de display (`displayLocation`/`displayOutlet`/`transitionStage`), passando a renderizar o outlet atual com um fade-in leve disparado por `key={location.pathname}` (remonta o wrapper a cada troca de rota).
- **Alternativa considerada:** manter `startViewTransition` só com `flushSync` — testada, não resolveu o salto.

### D3 — Sem fallback de fadeOut/blank
O fallback anterior (fadeOut → swap → fadeIn) tinha um "flash em branco" e dependia de `onTransitionEnd`. Removido junto com o `startViewTransition`; resta apenas o fade-in do novo conteúdo.

## Risks / Trade-offs

- **[R1] `ScrollRestoration` precisa estar dentro do router** → colocado em `AdminLayout` (elemento de rota), não ao lado de `RouterProvider`.
- **[R2] `flushSync` pode gerar render extra síncrona** → aceitável: ocorre só na troca de rota.
- **[R3] Testes em jsdom não simulam scroll real** → teste cobre a renderização/sem crash e, quando possível, o comportamento do componente.

## Migration Plan

- Sem migração de dados/API. Rollback: reverter o working tree; o sintoma do salto volta (sem quebra funcional).
