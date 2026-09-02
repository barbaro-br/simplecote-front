## Purpose

Tela onde o dono/administrador da loja configura a identidade e os dados básicos da loja (nome, cor de marca, telefone, layout de e-mail) usados em toda a aplicação, em vez de valores fixos no código.

## ADDED Requirements

### Requirement: Acesso às Configurações

O sistema SHALL exibir um item de menu identificado por um ícone de engrenagem na sidebar administrativa, levando à rota `/admin/configuracoes`.

#### Scenario: Acessar Configurações pela sidebar

- **WHEN** o admin clica no item de engrenagem na sidebar
- **THEN** o sistema navega para `/admin/configuracoes` e exibe o formulário de configuração da loja

### Requirement: Editar dados da loja

A tela de Configurações SHALL permitir editar nome da loja, cor de marca, telefone da loja e o layout de e-mail usado nas comunicações aos representantes, e SHALL persistir essas alterações via API. A tela SHALL exibir os valores atuais ao carregar, indicar o estado de salvamento em andamento, e exibir a mensagem de erro do backend quando a gravação falhar.

#### Scenario: Salvar alteração com sucesso

- **WHEN** o admin altera o nome da loja e confirma o salvamento
- **THEN** a alteração é persistida e a tela reflete o novo valor

#### Scenario: Falha ao salvar

- **WHEN** a API rejeita a alteração
- **THEN** a tela exibe a mensagem de erro do backend e mantém os valores anteriores visíveis

### Requirement: Nome e cor da loja aplicados em toda a interface

O nome da loja configurado SHALL substituir qualquer identidade de marca fixa hoje embutida no código (tela de login, cabeçalho da sidebar). A cor de marca configurada SHALL ser aplicada como a cor primária (`--primary`) de toda a aplicação.

#### Scenario: Nome refletido no login e na sidebar

- **WHEN** o nome da loja está configurado como "Sara Supermercado"
- **THEN** a tela de login e o cabeçalho da sidebar exibem "Sara Supermercado" em vez de um nome fixo no código

#### Scenario: Cor refletida em toda a aplicação

- **WHEN** a cor de marca é alterada nas Configurações
- **THEN** botões, estados de foco e destaques em toda a aplicação passam a usar a nova cor
