## Why

Durante o fluxo de faturamento, é comum que o Representante vencedor de uma cotação perceba, no ato de receber o Pedido, que não tem estoque suficiente para entregar um ou mais itens. Atualmente, o sistema só permite a confirmação "cega" do pedido total, forçando o uso do campo "Observação" para avisar o Comprador, o que mantém o valor do Pedido e o PDF de espelho na Doca desatualizados. 

Além disso, o Comprador fica com o ônus de gerenciar manualmente as falhas (itens que ninguém deu lance na apuração + itens que foram cortados pelo fornecedor pós-pedido), tendo que recriar uma cotação do zero para suprir essas faltas de estoque.

## What Changes

1. **Corte de Pedido pelo Fornecedor:** Na tela do Representante (`/pedido/:token`), ele poderá marcar itens específicos como "Sem Estoque/Corte". Ao Confirmar o pedido, o sistema abaterá esses itens do PDF do Pedido e do Total, garantindo que o Recebimento da loja bata com a Nota Fiscal real que será enviada.
2. **Recotação de Falhas (O Bolsão de Desassistidos):** A função de recotar do Admin será expandida. Ao clicar em "Recotar Itens sem Vencedor/Faltantes" no painel, o sistema irá agregar todos os itens que **não tiveram lance** com os itens que **foram cortados pelos fornecedores** na fase do pedido, e irá gerar uma **nova Cotação em Rascunho**. 
3. Como a Cotação cairá em status de Rascunho, o Comprador poderá incluir novos itens ou ajustar quantidades antes de finalmente abrir o prazo e convidar os fornecedores novamente.
4. **Melhoria de UX (Animações):** Botões críticos de ação (como Confirmar Pedido e Baixar PDF) ganharão estados visuais de `loading` (ícones girando, botões desabilitados) para prevenir cliques duplos e passar segurança ao usuário.

## Capabilities

### New Capabilities
- **pedido/corte-de-estoque**: Habilidade do Representante de alterar o espelho do pedido rejeitando itens específicos por ruptura de estoque.
- **cotacao/recotar-desassistidos**: Habilidade de unificar o cálculo de falhas de apuração com rupturas de entrega para formar um novo rascunho de compras.

### Modified Capabilities
- **pedido/pdf**: O PDF gerado refletirá dinamicamente o corte de itens feito pelo fornecedor e o novo valor total recalculado.

## Impact

- **UX do Comprador:** Redução drástica de atrito e tempo gasto para recomprar produtos em falta. Total precisão do PDF que o setor de doca/recebimento usará.
- **UX do Fornecedor:** Transparência para avisar cortes antes do envio da carga, somado a uma interface que informa visualmente que o sistema está "carregando" em ações pesadas.
