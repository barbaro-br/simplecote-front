## MODIFIED Requirements

### Requirement: Editar dados da loja

A tela de Configurações SHALL permitir editar nome da loja, cor de marca, telefone da loja, o layout de e-mail usado nas comunicações aos representantes e o tema do painel (`Claro`/`Escuro`), e SHALL persistir essas alterações via API. A tela SHALL exibir os valores atuais ao carregar, indicar o estado de salvamento em andamento, e exibir a mensagem de erro do backend quando a gravação falhar.

#### Scenario: Salvar alteração com sucesso

- **WHEN** o admin altera o nome da loja e confirma o salvamento
- **THEN** a alteração é persistida e a tela reflete o novo valor

#### Scenario: Falha ao salvar

- **WHEN** a API rejeita a alteração
- **THEN** a tela exibe a mensagem de erro do backend e mantém os valores anteriores visíveis

#### Scenario: Trocar o tema do painel

- **WHEN** o admin seleciona "Escuro" nas Configurações e salva
- **THEN** a alteração é persistida via API e o painel passa a exibir o tema escuro para todos os usuários dessa loja
