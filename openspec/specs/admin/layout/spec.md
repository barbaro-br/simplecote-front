# admin/layout Specification

## Purpose

Define o shell do painel administrativo: a sidebar de navegação e o container principal que exibe o conteúdo das rotas internas, com o conteúdo centralizado horizontalmente dentro da área útil da página.

## Requirements

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

### Requirement: Painel utilizável em larguras estreitas

O shell administrativo SHALL permanecer utilizável, sem texto cortado ou elementos sobrepostos, em larguras comuns de tablet (a partir de ~768px) e celular. Abaixo de 768px, a sidebar SHALL iniciar colapsada (modo ícone) para preservar espaço para o conteúdo.

#### Scenario: Dashboard em 768px

- **WHEN** o admin abre `/admin` numa tela de ~768px de largura
- **THEN** os cards do dashboard (incluindo "Gastos") exibem seu conteúdo por completo, sem texto cortado ou sobreposto

#### Scenario: Sidebar inicia colapsada em tela estreita

- **WHEN** o admin abre qualquer rota `/admin/**` numa tela abaixo de 768px
- **THEN** a sidebar aparece no modo ícone (colapsada), sem consumir a largura total do modo expandido

### Requirement: Estilo de navegação configurável

O shell administrativo SHALL renderizar a navegação no estilo definido pela Configuração da loja (`admin/configuracoes`): sidebar lateral ou barra inferior. Independentemente do estilo escolhido, o shell SHALL manter o conteúdo centralizado (requirement "Conteúdo centralizado na área útil do painel") e a navegação sempre visível durante o scroll (requirement "Navegação permanece visível durante o scroll"). Na barra inferior, a quantidade de itens mostrados diretamente (fora do agrupamento "Mais") SHALL se ajustar ao espaço disponível, em vez de aplicar sempre o mesmo limite pensado para tela estreita.

#### Scenario: Navegação equivalente entre estilos

- **WHEN** o admin usa o painel com o estilo "Inferior" configurado
- **THEN** o conteúdo continua centralizado e a barra de navegação continua visível ao rolar, do mesmo jeito que no estilo "Lateral"

#### Scenario: Mais itens do que cabem na barra inferior

- **WHEN** o estilo "Inferior" está ativo numa tela estreita (abaixo de 768px) e há mais itens de menu do que cabem confortavelmente na barra
- **THEN** os itens menos acessados ficam agrupados atrás de uma ação "Mais", sem que nenhum item de navegação fique inacessível

#### Scenario: Espaço suficiente para todos os itens (tela larga)

- **WHEN** o estilo "Inferior" está ativo numa tela larga (768px ou mais), onde há espaço para todos os itens de menu
- **THEN** todos os itens aparecem diretamente na barra, sem a ação "Mais"
