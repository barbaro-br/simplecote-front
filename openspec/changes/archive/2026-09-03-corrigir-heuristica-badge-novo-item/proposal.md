## Why

O indicador "Novo" no card do representante (`itemEhNovo` em
`cotacao-token.derivados.ts`) marca um item como novo sempre que ele está
`PENDENTE` enquanto **qualquer outro item da mesma cotação** já tem
`statusLance` diferente de `PENDENTE` — não só quando o item foi realmente
adicionado pelo comprador depois que o representante começou a responder.

Reproduzido ao vivo nesta sessão: cotação com 2 itens criados juntos desde o
início (nenhum "adicionado depois"); ao precificar o item 1, o item 2
imediatamente ganhou o badge "Novo", mesmo nunca tendo sido adicionado
tardiamente. Isso acontece em **qualquer** cotação com 2+ itens onde o
representante preenche um de cada vez — comportamento normal e quase
universal — tornando o badge essencialmente sem sentido na maioria das
cotações reais.

## What Changes

- `itemEhNovo` deixa de inferir "novo" a partir do `statusLance` dos outros
  itens. Passa a comparar contra o conjunto de `itemCotacaoId` presentes no
  **primeiro carregamento bem-sucedido** da cotação nesta sessão do
  representante (capturado uma vez, em memória, ao montar a página) — um
  item é "novo" só se o id dele não estava nesse conjunto inicial.
- Continua sem exigir nenhum campo adicional do backend (mesma restrição do
  requirement atual) — a mudança é só na fonte do dado usado para decidir.

## Capabilities

### Modified Capabilities

- `representante/cotacao`: requirement "Indicador de item novo" — muda a
  regra de derivação do indicador.

## Impact

- `src/representante/cotacao/cotacao-token.derivados.ts` — assinatura e
  lógica de `itemEhNovo`.
- `src/representante/cotacao/CotacaoPorTokenPage.tsx` — captura do conjunto
  de ids conhecidos no primeiro load e repasse para `itemEhNovo`.
- Nenhuma mudança de backend.
