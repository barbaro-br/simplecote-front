## Purpose

Define o shell do painel administrativo: a sidebar de navegação e o container principal que exibe o conteúdo das rotas internas, com o conteúdo centralizado horizontalmente dentro da área útil da página.

## ADDED Requirements

### Requirement: Conteúdo centralizado na área útil do painel

O shell administrativo SHALL exibir o conteúdo de todas as rotas internas (`/admin/**`) centralizado horizontalmente dentro da área útil ao lado da sidebar, com uma largura máxima de conteúdo e margens laterais automáticas, em vez de esticar o conteúdo até a borda direita da tela.

#### Scenario: Painel em viewport ultrawide

- **WHEN** o admin abre qualquer rota interna em um viewport largo (ultrawide/alta resolução)
- **THEN** o conteúdo aparece centralizado com espaço simétrico à esquerda e à direita, sem um vão em branco desproporcional no lado direito

#### Scenario: Uniformidade entre rotas

- **WHEN** o admin navega entre `/admin`, `/admin/cotacoes` e `/admin/produtos`
- **THEN** a mesma regra de centralização se aplica em todas as rotas, sem comportamento divergente entre telas

#### Scenario: Conteúdo respeita a largura máxima

- **WHEN** o viewport é mais largo que a largura máxima de conteúdo definida
- **THEN** o conteúdo não cresce além dessa largura e permanece centralizado, em vez de se espalhar por toda a largura disponível

### Requirement: Sidebar permanece responsiva

A centralização do conteúdo SHALL preservar o comportamento existente da sidebar de expandir/recolher com transição, e o container principal SHALL continuar ocupando todo o espaço restante ao lado da sidebar.

#### Scenario: Recolher e expandir a sidebar

- **WHEN** o admin recolhe ou expande a sidebar
- **THEN** o conteúdo permanece centralizado dentro da área restante e a navegação continua funcionando normalmente
