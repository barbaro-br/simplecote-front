## ADDED Requirements

### Requirement: Navegação permanece visível durante o scroll

O shell administrativo SHALL manter a sidebar de navegação visível na tela durante todo o scroll do conteúdo de qualquer rota `/admin/**`, em vez de permitir que ela role para fora da área visível junto com o conteúdo.

#### Scenario: Rolar uma tela com conteúdo mais alto que o viewport

- **WHEN** o admin abre uma rota `/admin/**` cujo conteúdo é mais alto que a altura da janela e rola a tela para baixo
- **THEN** a sidebar de navegação continua visível e utilizável, sem sair da área visível

#### Scenario: Navegar após rolar

- **WHEN** o admin rolou o conteúdo de uma tela longa para baixo
- **THEN** ele consegue clicar em qualquer item da sidebar sem precisar rolar de volta ao topo primeiro

### Requirement: Scroll delimitado à área de conteúdo

O scroll vertical de uma rota `/admin/**` SHALL ocorrer dentro da área de conteúdo (ao lado da sidebar), e não no documento inteiro, de modo que o shell (sidebar e qualquer cabeçalho fixo do shell) nunca role para fora da tela.

#### Scenario: Conteúdo mais alto que o viewport

- **WHEN** o conteúdo de uma rota é mais alto que a altura disponível da tela
- **THEN** aparece uma barra de rolagem própria da área de conteúdo, e o restante do shell permanece fixo
