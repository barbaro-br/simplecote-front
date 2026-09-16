## Purpose

Encapsula a etapa de pré-configuração de um pedido avulso (seleção de empresa, condição de pagamento e prazo de entrega) em um modal dedicado, separando-a visualmente da grade de itens.

## ADDED Requirements

### Requirement: Modal de pré-configuração obrigatório antes de criar o pedido

O sistema DEVE (SHALL) exibir um modal de pré-configuração quando o usuário aciona "Novo pedido avulso". O pedido NÃO é criado no back antes de o modal ser confirmado.

#### Scenario: Abrir modal via botão "Novo pedido avulso"
- **WHEN** o usuário clica em "Novo pedido avulso" na tela de pedidos
- **THEN** o modal de pré-configuração abre sem navegar para outra rota

#### Scenario: Confirmar modal com empresa e condição de pagamento
- **WHEN** o usuário seleciona empresa e condição de pagamento e clica em "Abrir pedido"
- **THEN** o sistema cria o pedido (`POST /api/pedidos/avulsos`) e navega para `/admin/pedidos-avulsos/{id}`

#### Scenario: Confirmar modal apenas com empresa (condição opcional)
- **WHEN** o usuário seleciona somente a empresa (sem condição de pagamento) e confirma
- **THEN** o sistema permite a criação com `condicaoPagamentoId` ausente

#### Scenario: Tentar confirmar sem empresa
- **WHEN** o usuário clica em "Abrir pedido" sem selecionar empresa
- **THEN** o modal exibe erro de validação e NÃO faz POST

### Requirement: Auto-preenchimento de representante ao selecionar empresa

Após selecionar a empresa, o sistema DEVE (SHALL) exibir o nome do representante vinculado (se houver) como informação de contexto, sem campo editável.

#### Scenario: Empresa com representante vinculado
- **WHEN** o usuário seleciona uma empresa que possui representante cadastrado
- **THEN** o nome do representante aparece abaixo do seletor de empresa de forma somente-leitura

#### Scenario: Empresa sem representante
- **WHEN** o usuário seleciona uma empresa sem representante cadastrado
- **THEN** nenhuma informação de representante é exibida (sem mensagem de erro)

### Requirement: Criação inline de condição de pagamento no modal

O usuário DEVE (SHALL) poder criar uma nova condição de pagamento diretamente no modal sem sair do fluxo.

#### Scenario: Criar nova condição de pagamento
- **WHEN** o usuário digita um valor não existente na lista de condições e confirma a criação
- **THEN** a nova condição é salva via API e automaticamente selecionada no modal
