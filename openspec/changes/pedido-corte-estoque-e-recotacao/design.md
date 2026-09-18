## Context

Ver `proposal.md`. A ideia original de "Repassar para o 2º menor preço" foi descartada em favor de uma recotação unificada por ser mais previsível sistemicamente, evitando gerenciar modificações tardias e aceitação de novos pedidos para empresas que já haviam faturado os seus originais.

## Goals / Non-Goals

**Goals:**
- Adicionar uma forma do Representante excluir um item por "ruptura de estoque" na tela de Pedido dele.
- Atualizar o backend para aceitar os itens cortados no endpoint `/confirmar`.
- Atualizar a função do Backend de "Recotar" para considerar a união de `Itens Sem Lance + Itens Cortados no Pedido`.
- Implementar Loading states visuais em requisições demoradas (Confirmar/PDF).

**Non-Goals:**
- Não iremos re-apurar o pedido automaticamente chamando o 2º colocado.
- Não iremos lidar com "corte parcial" (ex: Fornecedor só tem 5 de 10 pacotes de arroz). Para esta primeira versão, será um corte binário (Entrega o Item ou Não Entrega o Item), visando a simplicidade de uso mobile.

## Decisions

**1. Botões de Corte no Mobile**
- *Por que:* O fluxo é mobile-first, voltado ao polegar. 
- *Como:* Usar um botão (ícone de lixeira ou 'x' vermelho) ou um toggle simples em cada linha da grade do pedido na UI do Representante. A linha fica acinzentada/riscada e o array `itensCortados` vai engordando no estado local. Ao bater na API, enviamos o array `[itemCotacaoId]`.

**2. O Endpoint de Confirmar**
- *Como:* O endpoint `POST /public/pedidos/{token}/confirmar` hoje recebe apenas `{ observacao }`. Passará a receber `{ observacao, itensCortados: UUID[] }`. O Backend cuidará de processar a remoção no pedido, zerar a quantidade entregue, e recalcular o total do pedido.

**3. O Recotar Desassistidos**
- *Como:* A chamada já existente no Painel do Comprador (`POST /api/cotacoes/{id}/recotar-sem-vencedor`) será modificada (ou um novo endpoint será criado, ex: `/recotar-falhas`) no Backend, instruindo-o a procurar: 
  A. Itens sem vencedor na `apuracaoService`.
  B. Itens que pertencem a Pedidos confirmados dessa Cotação que contenham quantidade cortada/rejeitada.
  Ambos serão injetados numa cotação limpa com sufixo " - Faltas e Cortes".

**4. Spinner e Feedback**
- *Como:* Todo botão primário na `PedidoPorTokenPage` ganhará o estado `isPending` e renderizará a classe de spinner do pacote `@phosphor-icons/react` rodando em CSS puro.

## Risks / Trade-offs

- **Backend em Conjunto**: Como a lógica toda depende do Backend aceitar cortes no Pedido e unificar o Recotar, o desenvolvedor (Agente de API) precisará alterar a Entidade de `ItemPedido` no banco e os endpoints de apuração.
- **Abandono do Pedido original**: Se um fornecedor cortar o Arroz, o Arroz estará 100% solto para Recotação. Isso joga a responsabilidade da decisão de preço futuro inteiramente no novo leilão da Cotação Rascunho.
