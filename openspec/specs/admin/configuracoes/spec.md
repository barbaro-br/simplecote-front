# admin/configuracoes Specification

## Purpose
Tela onde o dono/administrador da loja configura a identidade e os dados básicos da loja (nome, cor de marca, telefone, layout de e-mail) usados em toda a aplicação, em vez de valores fixos no código.

## Requirements

### Requirement: Acesso às Configurações

O sistema SHALL exibir um item de menu identificado por um ícone de engrenagem na sidebar administrativa, levando à rota `/admin/configuracoes`.

#### Scenario: Acessar Configurações pela sidebar

- **WHEN** o admin clica no item de engrenagem na sidebar
- **THEN** o sistema navega para `/admin/configuracoes` e exibe o formulário de configuração da loja

### Requirement: Editar dados da loja

A tela de Configurações SHALL permitir editar nome da loja, cor de marca, telefone da loja, o layout de e-mail usado nas comunicações aos representantes e o tema do painel (`Claro`/`Escuro`), e SHALL persistir essas alterações via API. A tela SHALL exibir os valores atuais ao carregar, indicar o estado de salvamento em andamento, e exibir a mensagem de erro do backend quando a gravação falhar. A tela SHALL também exibir, em modo somente leitura, a URL completa do link do colaborador (montada a partir de `linkColaboradorToken`), com um botão para copiá-la à área de transferência.

#### Scenario: Salvar alteração com sucesso

- **WHEN** o admin altera o nome da loja e confirma o salvamento
- **THEN** a alteração é persistida e a tela reflete o novo valor

#### Scenario: Falha ao salvar

- **WHEN** a API rejeita a alteração
- **THEN** a tela exibe a mensagem de erro do backend e mantém os valores anteriores visíveis

#### Scenario: Trocar o tema do painel

- **WHEN** o admin seleciona "Escuro" nas Configurações e salva
- **THEN** a alteração é persistida via API e o painel passa a exibir o tema escuro para todos os usuários dessa loja

#### Scenario: Copiar o link do colaborador

- **WHEN** o admin clica no botão de copiar ao lado do link do colaborador
- **THEN** a URL completa (`{origin}/colaborador/{linkColaboradorToken}`) é escrita na área de transferência, com retorno visual temporário de confirmação

### Requirement: Nome e cor da loja aplicados em toda a interface

O nome da loja configurado SHALL substituir qualquer identidade de marca fixa hoje embutida no código (tela de login, cabeçalho da sidebar). A cor de marca configurada SHALL ser aplicada como a cor primária (`--primary`) de toda a aplicação.

#### Scenario: Nome refletido no login e na sidebar

- **WHEN** o nome da loja está configurado como "Sara Supermercado"
- **THEN** a tela de login e o cabeçalho da sidebar exibem "Sara Supermercado" em vez de um nome fixo no código

#### Scenario: Cor refletida em toda a aplicação

- **WHEN** a cor de marca é alterada nas Configurações
- **THEN** botões, estados de foco e destaques em toda a aplicação passam a usar a nova cor

### Requirement: Escolher estilo de navegação

A tela de Configurações SHALL permitir escolher o estilo de navegação do painel entre `Lateral` (sidebar, padrão atual) e `Inferior` (barra fixa na parte de baixo da tela), persistindo a escolha via API. O estilo escolhido SHALL se aplicar em todas as rotas `/admin/**` para todos os usuários dessa loja (não é uma preferência por usuário).

#### Scenario: Trocar para estilo inferior

- **WHEN** o admin seleciona "Inferior" nas Configurações e salva
- **THEN** o painel passa a exibir a navegação como barra fixa na parte inferior da tela em todas as rotas

#### Scenario: Trocar de volta para lateral

- **WHEN** o admin seleciona "Lateral" nas Configurações e salva
- **THEN** o painel volta a exibir a sidebar lateral, com o comportamento de expandir/recolher já existente
