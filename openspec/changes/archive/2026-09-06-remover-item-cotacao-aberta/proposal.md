## Why

Complementa a change de mesmo nome no `simplecote-back`, que passa a aceitar `DELETE /api/cotacoes/{id}/itens/{itemId}` com a Cotação `ABERTA`. Hoje o front só mostra o botão de remover item em `RASCUNHO` (`ItensSection` recebe `editavel={status === 'RASCUNHO'}`); em `ABERTA` a seção de itens dá lugar à grade ao vivo, sem ação de remoção. Um item colocado por engano numa cotação aberta fica preso.

## What Changes

- Na grade ao vivo, com `status === 'ABERTA'`, cada linha de item ganha uma ação de **remover**, sempre atrás de um diálogo de confirmação que nomeia a consequência ("Os lances já dados para este item serão descartados.") — segue a regra do `AGENTS.md §8` (operação irreversível nomeia a consequência).
- Reusa `useRemoverItem`; no sucesso, invalida a grade ao vivo e a cotação (o item some da grade).
- `RASCUNHO` continua igual (remoção pela `ItensSection`); nos demais status não há ação de remover.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a montagem/edição de itens passa a cobrir a remoção de item também com a Cotação `ABERTA`, pela grade ao vivo, com confirmação nomeando o descarte de lances.

## Impact

- `GradeAoVivoTabela.tsx`: ação de remover por linha (ícone lixeira), visível só quando `status === 'ABERTA'`, abrindo um `ConfirmarDialog` com o texto do descarte.
- `CotacaoDetalhePage.tsx` / `GradeAoVivoContainer`: fiar `useRemoverItem(id)` e a invalidação de `useGradeAoVivo`/`useCotacao` no sucesso.
- `cotacoes.api.ts`: `useRemoverItem` já existe — garantir que invalida `['grade-ao-vivo', id]` além de `['cotacao', id]`.
- Testes: `GradeAoVivoTabela.test.tsx` — a ação aparece só em `ABERTA`; clicar abre o diálogo; confirmar chama a mutação com o `itemId` certo; teste do estado otimista e do rollback em erro (`AGENTS.md §4`).
- Sem dependência nova.
- Depende da change `remover-item-cotacao-aberta` do `simplecote-back` estar mesclada (o endpoint precisa aceitar `ABERTA`).
