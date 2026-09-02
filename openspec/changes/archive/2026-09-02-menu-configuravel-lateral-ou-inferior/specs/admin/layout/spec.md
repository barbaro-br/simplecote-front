## ADDED Requirements

### Requirement: Estilo de navegação configurável

O shell administrativo SHALL renderizar a navegação no estilo definido pela Configuração da loja (`admin/configuracoes`): sidebar lateral ou barra inferior. Independentemente do estilo escolhido, o shell SHALL manter o conteúdo centralizado (requirement "Conteúdo centralizado na área útil do painel") e a navegação sempre visível durante o scroll (requirement "Navegação permanece visível durante o scroll").

#### Scenario: Navegação equivalente entre estilos

- **WHEN** o admin usa o painel com o estilo "Inferior" configurado
- **THEN** o conteúdo continua centralizado e a barra de navegação continua visível ao rolar, do mesmo jeito que no estilo "Lateral"

#### Scenario: Mais itens do que cabem na barra inferior

- **WHEN** o estilo "Inferior" está ativo e há mais itens de menu do que cabem confortavelmente na barra
- **THEN** os itens menos acessados ficam agrupados atrás de uma ação "Mais", sem que nenhum item de navegação fique inacessível
