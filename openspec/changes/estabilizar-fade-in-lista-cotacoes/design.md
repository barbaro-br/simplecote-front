## Context

Ver `proposal.md`. `CotacoesPage.tsx:237`: `<tr key={c.id} className="... fade-in" style={{ animationDelay: \`${Math.min(i * 50, 500)}ms\` }}>`, onde `i` é o índice na lista já filtrada (`.filter(...)`, linhas 94-97). Como o `fade-in` (definido em `src/index.css`, ver `corrigir-fade-in-reduced-motion`) usa `animation-fill-mode: both`, qualquer elemento que monta do zero começa em `opacity: 0` até o delay passar — correto na carga inicial, mas errado quando o elemento só está remontando por causa de um filtro.

## Goals / Non-Goals

**Goals:**
- Eliminar o "piscar vazio" ao buscar/filtrar.
- Preservar a animação de entrada agradável na carga inicial da página (não é objetivo remover a animação, só limitar quando ela roda).

**Non-Goals:**
- Não mexe na correção já feita em `corrigir-fade-in-reduced-motion` (fill-mode `both`, `prefers-reduced-motion`) — só limita quando a classe é aplicada.
- Não trata o mesmo padrão de animação no menu de contexto (⋮) de cada linha, mencionado de passagem na auditoria mas sem o mesmo problema (não há filtro ali) — fora de escopo aqui.

## Decisions

- **Gate via `ref` (não via estado)**: usar um `useRef(true)` (ex. `primeiraCargaRef`) que começa `true` e vira `false` após o primeiro render com dados carregados; a classe `fade-in`/`animationDelay` só é aplicada quando `primeiraCargaRef.current` é `true` no momento do render daquela linha. Alternativa considerada: um `useState` equivalente. Rejeitada — mudar esse estado dispararia um re-render extra só para "desligar" a animação, sem necessidade; um ref é suficiente porque a decisão é lida na hora de montar a linha, não precisa disparar re-render.

## Risks / Trade-offs

- [Risco] Se a lista inicial vier vazia (Comprador sem cotações) e a primeira cotação for criada logo em seguida, a nova linha pode não ganhar a animação de entrada (já que a "carga inicial" já passou) → Mitigação: comportamento aceitável — o caso comum que a auditoria reportou (buscar/filtrar) é resolvido; entrada de item novo sem animação não é um problema reportado, e forçar animação em toda inserção reintroduziria o risco original de forma diferente.
