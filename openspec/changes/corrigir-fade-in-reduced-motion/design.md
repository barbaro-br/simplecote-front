## Context

`CotacoesPage.tsx` usa `<tr className="... fade-in opacity-0" style={{ animationDelay }}>` para um fade escalonado. `index.css` define `@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }` e `.fade-in { animation: fadeIn 0.3s ease forwards }`. O `opacity-0` existe só para segurar o elemento escondido durante o `animationDelay` (o `forwards` só preenche após o fim da animação, não durante o delay). A regra `@media (prefers-reduced-motion: reduce) { .fade-in { animation: none !important } }` desliga a animação e deixa o `opacity-0` ativo → linha invisível.

## Goals / Non-Goals

**Goals:**
- Conteúdo sempre visível sob `prefers-reduced-motion: reduce`.
- Remover a necessidade de `opacity-0` externo (e o branch `isTest`).

**Non-Goals:**
- Não mexer no efeito de fade escalonado no cenário normal.

## Decisions

### D1 — `animation-fill-mode: both` em vez de remover só o `opacity-0`

- **Escolhido:** trocar `forwards` por `both`. O `backwards` faz o `from { opacity: 0 }` valer durante o `animationDelay`, dispensando o `opacity-0`; o `forwards` continua garantindo `opacity: 1` ao final. Sob `animation: none`, o elemento fica no `opacity` natural (1).
- **Alternativa 1:** só remover o `opacity-0` mantendo `forwards` — corrige o bug, mas causa "flash" de conteúdo durante o delay (elemento visível antes do fade começar).
- **Alternativa 2:** adicionar `opacity: 1 !important` no bloco de reduced-motion — corrige, mas só para `.fade-in` com `opacity-0` e deixa o padrão frágil para futuros usos.

`both` é a raiz correta: o fade escalonado passa a ser auto-contido na utility.

## Risks / Trade-offs

- [Outros usos de `.fade-in` mudam de comportamento] → os demais usos (dialog, route-transition, etc.) não têm `animationDelay` nem `opacity-0`, então `both` não altera nada visível (sem delay, `backwards` não tem efeito).
- [jsdom não roda animação] → em teste o elemento fica no `opacity` natural (1); a guarda de regressão apenas verifica a ausência de `opacity-0`.
