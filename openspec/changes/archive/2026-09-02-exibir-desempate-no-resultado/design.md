## Context

`ResultadoPage.tsx` deriva `vencedores` de `resultado.data.pedidos[].itens[]` (tipo `ItemPedido`, `cotacoes.schema.ts`). O backend (`sinalizar-desempate-na-apuracao`, `simplecote-back`) vai adicionar `decididoPorDesempate: boolean` em `ItemPedidoDTO`, populado a partir do critério de desempate já existente (mesmo preço unitário na escala 4). O front só precisa consumir e exibir esse campo — nenhuma lógica de comparação de preço é replicada aqui (regra já estabelecida: "o front NÃO recalcula preço, vencedor ou menor preço").

## Goals / Non-Goals

**Goals:**
- Deixar visualmente claro, item a item, quando a vitória foi por empate decidido por critério de desempate (não só "menor preço isolado").
- Não fazer o front recalcular ou inferir o empate — só refletir o campo que a API já entrega.

**Non-Goals:**
- Não expõe qual critério específico decidiu o desempate (respondidoEm/atualizadoEm/id) — só o fato de ter havido empate, espelhando o escopo do backend.
- Não altera a lógica de seleção de vencedor nem o XLSX/PDF exportados (fora de escopo; pode ser change futura se pedido).

## Decisions

- **Badge inline ao lado do preço, com tooltip explicativo**, em vez de uma coluna nova ou seção separada — mantém a densidade da tela de resultado (já otimizada por `compactar-grade-ao-vivo`) e some naturalmente quando `decididoPorDesempate` é `false`.
- **Campo opcional no schema (`decididoPorDesempate?: boolean`, tratado como `false` quando ausente)** — evita quebrar a tela caso o front seja aplicado antes do backend estar disponível em produção; quando o backend responder o campo, o comportamento passa a refletir a realidade automaticamente.

## Risks / Trade-offs

- [Risco] Se essa change for aplicada antes de `sinalizar-desempate-na-apuracao` estar em produção, nenhum badge aparece (campo sempre ausente/`false`) — comportamento degrada de forma segura, sem erro.
