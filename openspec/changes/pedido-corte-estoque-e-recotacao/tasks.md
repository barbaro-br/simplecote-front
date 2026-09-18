## 1. Backend: Itens Cortados e Recotação de Falhas

- [ ] 1.1 `simplecote-back`: Adicionar suporte a corte no modelo `ItemPedido` (ex: `quantidade_cortada` ou uma flag boolean `cortado`). 
- [ ] 1.2 Atualizar o controller e service de `/confirmar` do pedido público para receber um payload DTO que liste os IDs dos itens cortados, validá-los e abater do valor total do pedido.
- [ ] 1.3 Renomear a rota/serviço ou expandir a lógica do `CotacaoService.recotarSemVencedor` para varrer também os `pedidos` daquela cotação e recuperar os itens marcados como cortados, injetando-os no rascunho de recotação resultante.

## 2. Frontend: Tela do Representante (Mobile-first)

- [ ] 2.1 Em `src/representante/pedido/pedido-token.api.ts`, alterar a tipagem da requisição de `useConfirmarPedido` para incluir a lista de `itensCortados: string[]`.
- [ ] 2.2 Na `PedidoPorTokenPage.tsx`, adicionar um estado local para mapear os itens que sofreram ruptura de estoque.
- [ ] 2.3 Atualizar o componente da `GradeDados` (ou sua renderização de linhas) para incluir um botão de Ação "Informar falta" em cada item. Itens marcados devem ganhar um estilo visual de linha riscada/acinzentada (strikethrough).
- [ ] 2.4 Amarrar o envio: ao clicar no botão "Confirmar", passar o estado de `itensCortados` na `mutation`.
- [ ] 2.5 Refinar a UX: Modificar o `BotaoPrimario` (ou botão local de baixar PDF e Confirmar) para usar ícones de carregamento animados durante as mutations assíncronas do React Query, bloqueando duplo clique (`disabled={isPending}`).

## 3. Frontend: Painel do Comprador (Admin)

- [ ] 3.1 Na aba de Pedidos (ou na visualização de Cotação), ao exibir o botão que chama o antigo `POST /api/cotacoes/{id}/recotar-sem-vencedor`, alterar o *label* (nome do botão) para algo mais claro como "Recotar Itens sem lance ou em falta", refletindo a nova capacidade de negócio expandida pelo backend.
- [ ] 3.2 Opcional: Adicionar uma flag visual na tabela/card do Comprador se o pedido houver cortes reportados.
