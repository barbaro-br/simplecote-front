## MODIFIED Requirements

### Requirement: Identidade de marca consistente
A tela de login SHALL apresentar o nome da loja configurado (via `admin/configuracoes`), lido de dado, em vez de uma marca fixa embutida no código. A tela de login e o rodapé da sidebar administrativa SHALL exibir um crédito de desenvolvedor discreto (texto pequeno, cor de baixo contraste), definido numa única constante compartilhada para fácil edição. No rodapé da sidebar, o crédito SHALL seguir o mesmo comportamento de recolher/expandir já usado pelos demais rótulos da sidebar (escondido quando a sidebar está no modo ícone).

#### Scenario: Tela de login com marca correta
- **WHEN** o usuário abre a tela de login
- **THEN** o título exibe o nome da loja configurado (ex.: "Sara Supermercado"), lido da Configuração da loja, em vez de um valor fixo no código

#### Scenario: Configuração ainda carregando
- **WHEN** a tela de login abre antes de a configuração da loja terminar de carregar
- **THEN** a tela exibe um estado de carregamento aceitável (ex.: skeleton), sem quebrar o layout ou expor um nome incorreto

#### Scenario: Crédito de desenvolvedor na tela de login

- **WHEN** o usuário abre a tela de login
- **THEN** um texto discreto de crédito de desenvolvedor aparece abaixo do link "Esqueci minha senha", sem competir visualmente com o formulário

#### Scenario: Crédito de desenvolvedor no rodapé da sidebar

- **WHEN** o admin visualiza a sidebar expandida
- **THEN** um texto discreto de crédito de desenvolvedor aparece abaixo do botão "Sair"

#### Scenario: Crédito some com a sidebar recolhida

- **WHEN** a sidebar está recolhida no modo ícone
- **THEN** o crédito de desenvolvedor não é exibido (mesmo comportamento do rótulo "Sair" nesse estado)
