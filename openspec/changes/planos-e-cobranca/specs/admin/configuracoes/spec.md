## ADDED Requirements

### Requirement: Aba de Plano e cobrança

A tela de Configurações SHALL apresentar uma aba "Plano & cobrança" separada da edição dos dados da loja, servindo de ponto de acesso ao painel de plano e uso do `Comprador` (capability `admin/cobranca`). A aba de dados da loja SHALL continuar funcionando exatamente como antes.

#### Scenario: Acessar plano e cobrança pelas Configurações

- **WHEN** o admin abre `/admin/configuracoes` e seleciona a aba "Plano & cobrança"
- **THEN** vê o plano atual, o estado da assinatura e o uso contra os limites, com as ações de assinar/gerenciar

#### Scenario: Edição de dados da loja não é afetada

- **WHEN** o admin usa a aba de dados da loja para alterar nome, cor, telefone ou tema
- **THEN** o comportamento de salvar e recarregar permanece o mesmo de antes desta change
