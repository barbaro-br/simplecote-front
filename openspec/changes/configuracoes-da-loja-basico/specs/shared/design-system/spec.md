## MODIFIED Requirements

### Requirement: Identidade de marca consistente
A tela de login SHALL apresentar o nome da loja configurado (via `admin/configuracoes`), lido de dado, em vez de uma marca fixa embutida no código.

#### Scenario: Tela de login com marca correta
- **WHEN** o usuário abre a tela de login
- **THEN** o título exibe o nome da loja configurado (ex.: "Sara Supermercado"), lido da Configuração da loja, em vez de um valor fixo no código

#### Scenario: Configuração ainda carregando
- **WHEN** a tela de login abre antes de a configuração da loja terminar de carregar
- **THEN** a tela exibe um estado de carregamento aceitável (ex.: skeleton), sem quebrar o layout ou expor um nome incorreto
