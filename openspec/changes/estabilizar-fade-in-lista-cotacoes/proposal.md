## Why

Auditoria visual achou que a lista de `/admin/cotacoes` "pisca vazia" toda vez que o admin digita na busca ou troca o filtro de status: linhas que deveriam aparecer ficam invisíveis por ~1-2s antes de surgir. Causa raiz: cada linha usa `fade-in` + `animationDelay` calculado pelo índice na lista **filtrada** (`CotacoesPage.tsx:237`) — quando uma busca/filtro é ampliado (ex.: apagar parte do texto buscado) e uma linha que estava fora do filtro volta a aparecer, ela é montada como novo elemento no DOM e replay a animação de entrada do zero, com o mesmo delay escalonado pensado só para a carga inicial da página.

## What Changes

- A animação de entrada (`fade-in` + delay escalonado) passa a rodar **apenas na carga inicial** da lista (quando os dados chegam da API pela primeira vez), não mais a cada mudança de busca/filtro.
- Mudanças de busca/filtro continuam re-renderizando a lista normalmente, só sem o replay da animação de entrada.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/cotacoes`: novo requirement — a animação de entrada das linhas ocorre só na carga inicial da lista, não a cada busca/filtro.

## Impact

- `src/admin/cotacoes/CotacoesPage.tsx` — apenas lógica de quando aplicar a classe/delay de animação; nenhuma mudança de dado ou filtro em si.
- Achado durante a auditoria visual; baixo risco, escopo pequeno e isolado.
