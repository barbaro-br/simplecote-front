## Why

A apuração já desempata corretamente (por ordem de resposta, com precisão suficiente pra não confundir arredondamento com empate de verdade), mas a tela de resultado não mostra isso — uma Empresa vencendo vários itens parece arbitrário pra quem olha, quando parte foi vitória clara e parte foi empate resolvido por critério de desempate. O backend (`sinalizar-desempate-na-apuracao`, repositório `simplecote-back`) vai expor um campo `decididoPorDesempate` em cada item do pedido pra resolver isso.

## What Changes

- `ItemPedido` (schema) ganha o campo `decididoPorDesempate: boolean`.
- `ResultadoPage.tsx`: quando um item foi decidido por empate, exibir um indicador visual (badge "Empate" com tooltip explicando "preço igual a outro concorrente; decidido por quem respondeu primeiro") ao lado do preço desse item.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/cotacoes`: novo requirement — a tela de resultado indica quando um item foi decidido por empate de preço.

## Impact

- `src/admin/cotacoes/cotacoes.schema.ts` — novo campo em `ItemPedido`.
- `src/admin/cotacoes/ResultadoPage.tsx` — indicador visual.
- **Depende do backend** (`sinalizar-desempate-na-apuracao`, `simplecote-back`) já ter o campo `decididoPorDesempate` disponível em `GET /api/cotacoes/{id}/resultado`. Se ainda não estiver pronto, dá pra construir a UI com o campo opcional/mockado e trocar depois — mas o ideal é aplicar essa change depois da do back.
