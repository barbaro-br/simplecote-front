## MODIFIED Requirements

### Requirement: Editar dados da loja

A tela de Configurações SHALL permitir editar nome da loja, cor de marca, telefone da loja e o layout de e-mail usado nas comunicações aos representantes, e SHALL persistir essas alterações via API. A tela SHALL exibir os valores atuais ao carregar, indicar o estado de salvamento em andamento, e exibir a mensagem de erro do backend quando a gravação falhar. A tela SHALL também exibir, em modo somente leitura, a URL completa do link do colaborador (montada a partir de `linkColaboradorToken`), com um botão para copiá-la à área de transferência.

#### Scenario: Salvar alteração com sucesso

- **WHEN** o admin altera o nome da loja e confirma o salvamento
- **THEN** a alteração é persistida e a tela reflete o novo valor

#### Scenario: Falha ao salvar

- **WHEN** a API rejeita a alteração
- **THEN** a tela exibe a mensagem de erro do backend e mantém os valores anteriores visíveis

#### Scenario: Copiar o link do colaborador

- **WHEN** o admin clica no botão de copiar ao lado do link do colaborador
- **THEN** a URL completa (`{origin}/colaborador/{linkColaboradorToken}`) é escrita na área de transferência, com retorno visual temporário de confirmação
