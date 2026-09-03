## Why

No card do representante, a caixa do P.CX (preço da embalagem) e a caixa do
P.UN (preço unitário) têm larguras diferentes e inconsistentes. Confirmado
em `ItemLanceCard.tsx`: a caixa do P.CX tem largura efetivamente fixa (o
`<input>` interno usa `w-14`, sempre a mesma largura), mas a caixa do P.UN
não tem largura nenhuma definida — fica exatamente do tamanho do texto
(`—`, `calculando…`, `R$ 12,50` são bem diferentes entre si), então ela
muda de tamanho conforme o valor muda e nunca fica visualmente alinhada com
a caixa do P.CX ao lado.

Reportado ao vivo: "o campo do preço de caixa está de um tamanho e o preço
unitário está de outro tamanho".

## What Changes

- A caixa do P.UN passa a ter uma largura mínima consistente com a caixa do
  P.CX, para as duas ficarem visualmente alinhadas independente do
  conteúdo (vazio, "calculando…" ou um valor formatado).

## Capabilities

### Modified Capabilities

- `representante/cotacao`: requirement "Visualização da Cotação por token"
  — adiciona a garantia de largura consistente entre as duas caixas de
  preço.

## Impact

- `src/representante/cotacao/ItemLanceCard.tsx`
