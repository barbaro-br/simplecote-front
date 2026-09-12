## 1. Cliente de API

- [x] 1.1 `pedidos-avulsos.api.ts`: `useCriarPedidoAvulso` (`POST /api/pedidos/avulsos`), `useAdicionarItemPedidoAvulso` (`POST /api/pedidos/avulsos/{id}/itens`), `useFecharPedidoAvulso` (`POST /api/pedidos/avulsos/{id}/fechar`), `usePedidoAvulso` (`GET /api/pedidos/avulsos/{id}`) — mesmo padrão de `produtos.api.ts` (TanStack Query); verificar com a suíte de teste que cada hook chama o endpoint certo (mock via MSW)

## 2. Tela de montagem

- [x] 2.1 Rota `/admin/pedidos-avulsos/novo` + entrada de navegação; verificar que a rota abre a página vazia
- [x] 2.2 Formulário de item: busca de produto reaproveitando `useSugestoesCadastro`/`useMaisSugestoesDoCatalogoGlobal`, campo de preço da embalagem, campo de quantidade de embalagens, preço unitário e total de linha calculados ao vivo antes de confirmar (spec - "Item do pedido deriva preço unitário e total da linha"); teste cobrindo a derivação com embalagem >1 e com "Unidade"
- [x] 2.3 Lista de itens confirmados + contagem/total geral atualizados a cada item (spec - "Lista de itens acumulados e total geral"); teste cobrindo a soma ao adicionar um segundo item
- [x] 2.4 Primeiro item confirmado chama `useCriarPedidoAvulso`; itens seguintes chamam `useAdicionarItemPedidoAvulso` no id já criado (design.md - Decisão 2); teste cobrindo que o id do pedido criado no primeiro item é reaproveitado nos seguintes
- [x] 2.5 Fechamento: confirmação nomeando total e contagem, chama `useFecharPedidoAvulso`, tela final mostra a confirmação do pedido fechado (spec - "Fechamento do pedido avulso"); teste cobrindo a confirmação e o estado pós-fechamento sem aceitar novo item

## 3. Testes de integração da tela

- [x] 3.1 Teste de componente cobrindo o fluxo completo: buscar produto → confirmar item (embalagem >1) → buscar outro produto → confirmar item (Unidade) → conferir total geral → fechar pedido → conferir confirmação final
