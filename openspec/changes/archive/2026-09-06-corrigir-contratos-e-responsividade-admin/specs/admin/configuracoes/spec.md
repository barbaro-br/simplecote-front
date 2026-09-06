## REMOVED Requirements

### Requirement: Alternar destaque do menor preço na grade ao vivo

## MODIFIED Requirements

### Requirement: Editar dados da loja

A tela de Configurações SHALL permitir editar nome da loja, cor de marca, telefone da loja, o layout de e-mail usado nas comunicações aos representantes e o tema do painel (`Claro`/`Escuro`), e SHALL persistir essas alterações via `PUT /api/configuracoes` (contrato real do backend; `linkColaboradorToken` NÃO é enviado no corpo — é somente leitura). A tela SHALL carregar os valores atuais de `GET /api/configuracoes`, indicar o estado de salvamento em andamento, e exibir a mensagem de erro do backend quando a gravação falhar. A tela SHALL também exibir, em modo somente leitura, a URL completa do link do colaborador, montada a partir do `linkColaboradorToken` retornado pelo `GET` (nunca um placeholder fixo), com um botão para copiá-la à área de transferência.

#### Scenario: Salvar alteração com sucesso

- **WHEN** o admin altera o nome da loja e confirma o salvamento
- **THEN** a alteração é persistida no backend e a tela reflete o novo valor (e sobrevive a um recarregamento)

#### Scenario: Falha ao salvar

- **WHEN** a API rejeita a alteração
- **THEN** a tela exibe a mensagem de erro do backend e mantém os valores anteriores visíveis

#### Scenario: Trocar o tema do painel

- **WHEN** o admin seleciona "Escuro" nas Configurações e salva
- **THEN** a alteração é persistida via API e o painel passa a exibir o tema escuro para todos os usuários dessa loja

#### Scenario: Copiar o link do colaborador

- **WHEN** o admin clica no botão de copiar ao lado do link do colaborador
- **THEN** a URL completa (`{origin}/colaborador/{linkColaboradorToken}`) é escrita na área de transferência, com retorno visual temporário de confirmação

#### Scenario: Link do colaborador vem da API

- **WHEN** o admin abre a tela de Configurações de uma loja com token real no backend
- **THEN** o link exibido usa o `linkColaboradorToken` retornado pelo `GET /api/configuracoes` — não um valor de exemplo embutido no front

#### Scenario: Sem preferência de destaque de menor preço no formulário

- **WHEN** o admin abre a tela de Configurações
- **THEN** não existe a opção "Destacar menor preço na grade ao vivo" no formulário (a grade mantém o destaque ligado por padrão, conforme o requirement da grade em `admin/cotacoes`)
