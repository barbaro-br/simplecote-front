## Why

No modal "Adicionar Produtos", quando a busca não acha nada no catálogo do próprio Comprador, a sugestão do catálogo global aparecia num painel com layout diferente do resto da lista (caixa com borda, texto corrido "código — clique pra cadastrar e adicionar"), quebrando a consistência visual da tela. Além disso, a lista (tanto do próprio catálogo quanto da sugestão global) não tinha navegação por teclado (seta cima/baixo + Enter), obrigando a usar o mouse mesmo com a busca já filtrando pra um item só.

## What Changes

- A sugestão do catálogo global passa a usar o mesmo layout de linha do próprio catálogo (ícone, nome, subtítulo, botão "Adicionar" à direita), como `<li>` da mesma lista — só o ícone (`Sparkle` em vez de `Package`) e a ação (cadastra e adiciona, em vez de adicionar direto) diferem.
- Navegação por teclado no campo de busca: seta cima/baixo move um item ativo (destacado) na lista visível — o próprio catálogo quando tem resultado, senão a base compartilhada — e Enter aciona esse item (adiciona/remove no próprio catálogo, cadastra e adiciona na base compartilhada). Mesmo padrão já usado em `ProdutoForm.tsx`.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a sugestão do catálogo global no modal "Adicionar Produtos" usa o mesmo layout de linha do próprio catálogo, e a lista (própria ou sugerida) ganha navegação por teclado.

## Impact

- `src/admin/cotacoes/AdicionarItemModal.tsx`: layout da sugestão global reaproveita a linha do próprio catálogo; `indiceAtivo`/`aoTeclarNaBusca`/`selecionarNoIndice` pra navegação por teclado.
- `src/admin/cotacoes/AdicionarItemModal.test.tsx`: layout da sugestão global (ícone + nome + botão "Adicionar"), seta+Enter no próprio catálogo, Enter na base compartilhada.
- Sem dependência nova. Sem mudança de contrato com o back.
