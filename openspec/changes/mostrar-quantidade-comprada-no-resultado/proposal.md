## Why

A tela de Resultado da apuração (`ResultadoPage`) mostra bastante informação por item — produto, preço da embalagem, preço unitário, margem, preço de venda e subtotal — mas **não mostra a quantidade que está sendo comprada** de cada item. Essa informação só existe hoje no XLSX e no PDF exportados, obrigando o Comprador a baixar um arquivo só para conferir quantidades.

## What Changes

- **Front** — na tabela expandida de itens de um pedido (tela de Resultado), exibir a coluna **Quantidade** (a quantidade a comprar do item), que já vem pronta da API em `ItemPedido.quantidade`.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `admin/cotacoes`: a requirement "Resultado da apuração e pedidos" passa a exibir a quantidade comprada de cada item na lista expandida de pedidos.

## Impact

- **Front (este repo):** `src/admin/cotacoes/ResultadoPage.tsx` (nova coluna "Quantidade" na tabela de itens expandidos) e testes.
- **Sem impacto no back** — `ItemPedido.quantidade` (e `quantidadePorEmbalagemSnapshot`) já é retornado pelo `GET /api/cotacoes/{id}/resultado`; é só exibição no front.
