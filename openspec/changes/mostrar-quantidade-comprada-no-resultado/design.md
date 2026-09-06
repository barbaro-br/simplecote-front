## Context

`ResultadoPage` expande os itens de cada pedido numa tabela inline com colunas: Produto, Preço embalagem, Preço unitário, Margem (%), Preço de venda, Subtotal. O tipo `ItemPedido` (em `cotacoes.schema.ts`) já carrega `quantidade` e `quantidadePorEmbalagemSnapshot` do back — a tela só não os exibe. Ver proposal.md (Why).

## Goals / Non-Goals

**Goals:**

- Exibir a quantidade comprada de cada item no resultado, sem obrigar o Comprador a baixar XLSX/PDF.

**Non-Goals:**

- Não muda apuração, vencedor, margem ou exportações.
- Não recalcula nada — `quantidade` vem pronta da API.

## Decisions

- **Nova coluna "Quantidade"** na tabela expandida de itens, renderizando `item.quantidade` (inteiro). Posição sugerida: entre "Produto" e "Preço embalagem", refletindo a leitura natural "o que → quanto → por quanto". A embalagem (`quantidadePorEmbalagemSnapshot`) já aparece no preço/descrição quando relevante; não duplicar.

## Risks / Trade-offs

- [Coluna quebra layout em telas estreitas] → a tabela de itens já vive dentro de `overflow-x-auto`; apenas adicionar o `<th>`/`<td>`.

## Migration Plan

Sem migração. Deploy normal.

## Open Questions

(nenhuma)
