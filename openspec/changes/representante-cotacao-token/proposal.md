## Why

A tela do representante (`/cotacao/:token`) é o ponto de maior risco do MVP e hoje é um `<div>` placeholder. É a única superfície do front com responsabilidade própria: **não perder o preço que o representante já digitou** mesmo com 3G ruim, via a fila de sincronização do `spec.md` §10.2. Sem ela não há ciclo de cotação de ponta a ponta para demonstrar.

## What Changes

- **`/cotacao/:token`** (`GET /public/cotacoes/:token`): tela mobile-first, sem `AdminLayout`, tema claro forçado (`spec.md` §13). Cabeçalho saudando a pessoa pelo `representanteNome` com contexto de `empresaNome`/`compradorNome`. Lista de itens com os dados de snapshot e o lance daquele participante, incluindo `precoUnitario` derivado (vem pronto da API). Editável só quando `podeEditar` (vem pronto).
- **Autosave + fila de sincronização** (`spec.md` §10.2, normativo): por item, `digitando → (debounce 800ms) → enviando → sincronizado | falhou`. Cada item grava uma entrada em `localStorage` (`simplecote:fila:{token}` → mapa `itemCotacaoId → { preco?, naoCotado?, tentativas, ultimaTentativaEm }`) e dispara `PUT /public/cotacoes/:token/lances` **com um item por vez**. Sucesso remove a entrada; falha de rede mantém e incrementa `tentativas`. `setInterval` de 10s (só com fila não-vazia) retenta na ordem; evento `online` força retry imediato; no mount, fila não-vazia dispara retry na hora.
- **Finalizar** (`POST /public/cotacoes/:token/finalizar`): botão desabilitado com "Sincronizando N preço(s)…" enquanto a fila do token não estiver vazia; a fila só é apagada inteira quando o `finalizar` retorna 204.
- **`/pedido/:token`** (`GET /public/pedidos/:token`): ver o pedido, baixar PDF (`GET /public/pedidos/:token.pdf`), confirmar (`POST /public/pedidos/:token/confirmar`).
- Feature-folder `src/representante/` (fora da árvore `admin/`), com testes MSW cobrindo: render por token, autosave feliz, falha de rede → fila persiste → retry esvazia, `finalizar` bloqueado com fila pendente, reconciliação ao remontar.

## Capabilities

### New Capabilities
- `representante/cotacao`: tela pública por token para o representante responder uma Cotação — visualização, registro de preços com autosave e fila de sincronização resiliente a rede ruim, finalização com trava, e visualização/confirmação do pedido.

### Modified Capabilities
Nenhuma.

## Impact

- Novo: `src/representante/**` (`cotacao/`, `pedido/`), rotas em `src/routes.tsx` (substituindo os placeholders `/cotacao/:token` e `/pedido/:token`), possivelmente um hook `src/shared/hooks/useDebounce.ts` e a lógica de fila em `src/representante/cotacao/fila-sincronizacao.ts`.
- Leitura: `api-client` (as rotas `/public/**` não levam `Authorization`; confirmar que o client não anexa o header quando não há sessão — já é o caso).
- Depende de `ligar-front-ao-backend` (API acessível) para a verificação e2e. Independente de `admin-cotacoes` no código, mas o teste de ponta a ponta precisa de uma cotação aberta (criada pelo painel ou pelo seed).
