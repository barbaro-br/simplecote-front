## Why

Ao testar o fluxo do representante, o toast "Preço removido / Desfazer"
(disparado em `ItemLanceCard.tsx` quando o preço de um item é apagado)
ficou visível por muito mais tempo do que o esperado — ainda aparecia na
tela depois de várias interações seguintes e sobreviveu até a tela de
sucesso "Cotação enviada!", uma transição de rota completa depois do clique
que o disparou. Não há `duration` configurada explicitamente na chamada
`toast('Preço removido', { position: 'top-center', action: {...} })` nem no
`<Toaster>` global (`App.tsx`), então ele usa o padrão do `sonner`
(tipicamente ~4s) — o comportamento observado sugere algo além do padrão,
mas a causa exata não foi confirmada nesta rodada de teste manual.

**Nota de retratação**: uma segunda suspeita anotada na mesma rodada — "o
layout do representante não se adapta a telas largas, conteúdo cola no
canto superior esquerdo" — foi reexaminada ao escrever este change e não se
confirmou: `CotacaoPorTokenPage.tsx` e `PedidoPorTokenPage.tsx` já usam
`mx-auto max-w-2xl`/`max-w-md`, centralizando e limitando a largura do
conteúdo corretamente; a impressão de "conteúdo colado no topo" era só o
espaço vertical vazio normal de uma página mobile-first curta em viewport
alto, não falta de centralização horizontal. Nenhuma mudança necessária
nesse ponto.

## What Changes

- Investigar a causa exata da persistência do toast (chamada duplicada,
  ausência de dedup por `id`, ou só o padrão do `sonner` sendo mais longo do
  que pareceu na observação manual).
- Definir explicitamente uma duração razoável (ex.: 4000ms) e um `id` fixo
  por item (ex. `preco-removido-${item.itemCotacaoId}`) na chamada de
  `toast(...)`, para que limpar o preço do mesmo item duas vezes seguidas
  substitua o toast anterior em vez de empilhar.

## Capabilities

### Modified Capabilities

- `representante/cotacao`: requirement "Gesto de deslizar para limpar o
  preço" — adiciona cenário sobre a duração do toast de desfazer.

## Impact

- `src/representante/cotacao/ItemLanceCard.tsx`
