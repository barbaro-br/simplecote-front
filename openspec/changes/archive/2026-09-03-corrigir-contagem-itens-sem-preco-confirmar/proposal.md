## Why

O modal "Enviar cotação?" pode mostrar uma contagem de itens sem preço
desatualizada — inclusive itens que já foram precificados e salvos com
sucesso. Reproduzido ao vivo nesta sessão: precifiquei os 2 itens de uma
cotação (confirmado via `GET /public/cotacoes/:token`, que retornou os 2
como `COTADO` com preço correto), mas ao clicar "Finalizar" o modal alertou
"1 item sem preço será enviado em branco" — e o aviso ficou parado nesse
valor errado mesmo bem depois do `✓ salvo` aparecer nas duas linhas.

Causa raiz: em `CotacaoPorTokenPage.tsx`, `temPrecoLocal` é **re-semeado do
zero** toda vez que a referência de `cotacao.data` muda
(`if (cotacao.data !== fonteSemeada) setTemPrecoLocal(...)`). Como
`useCotacaoPorToken` (`cotacao-token.api.ts`) não define `staleTime` nem
desliga `refetchOnWindowFocus`, o React Query pode refazer o fetch a
qualquer momento — inclusive enquanto o autosave de um item ainda está em
voo (debounce). Se esse refetch trouxer um snapshot do servidor **anterior**
à gravação do preço, o re-semeio sobrescreve `temPrecoLocal` com o valor
antigo, e como nenhum novo keystroke acontece naquele item depois disso, o
valor errado nunca é corrigido — mesmo o preço estando corretamente salvo no
servidor.

Isso é sério por ser a última tela antes de enviar a resposta definitiva ao
comprador.

## What Changes

- `temPrecoLocal` deixa de ser **substituído** a cada nova resposta da API;
  passa a ser **mesclado**: uma nova resposta só adiciona entradas para
  itens que ainda não têm entrada local nenhuma (ex.: item novo trazido por
  um refetch), nunca sobrescreve uma entrada que o próprio representante já
  tocou nesta sessão.

## Capabilities

### Modified Capabilities

- `representante/cotacao`: requirement "Confirmação antes de enviar a
  resposta" — adiciona cenário cobrindo o caso de atualização em segundo
  plano durante a edição.

## Impact

- `src/representante/cotacao/CotacaoPorTokenPage.tsx`
