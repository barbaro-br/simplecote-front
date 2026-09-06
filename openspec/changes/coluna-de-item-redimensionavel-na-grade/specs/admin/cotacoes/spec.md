## ADDED Requirements

### Requirement: Coluna do item redimensionável na grade ao vivo

Na grade ao vivo da Cotação, a coluna do item (nome do produto) SHALL ter uma alça de redimensionamento na borda direita do cabeçalho. Arrastar a alça SHALL ajustar a largura da coluna, respeitando um mínimo e um máximo. A largura escolhida SHALL ser lembrada no `localStorage` do navegador e reaplicada nas próximas visitas. Um duplo-clique na alça SHALL restaurar a largura padrão. Quando o `localStorage` estiver indisponível, a grade SHALL usar a largura padrão sem erro. O container da grade SHALL continuar com rolagem horizontal quando o conteúdo excede a largura.

#### Scenario: Arrastar ajusta a largura

- **WHEN** o usuário arrasta a alça da coluna do item para a direita
- **THEN** a coluna alarga (até o máximo) e o nome do produto deixa de quebrar

#### Scenario: Largura é lembrada

- **WHEN** o usuário redimensiona a coluna e volta à tela depois
- **THEN** a coluna reabre com a largura que ele deixou

#### Scenario: Duplo-clique restaura o padrão

- **WHEN** o usuário dá duplo-clique na alça
- **THEN** a coluna volta à largura padrão

#### Scenario: Sem localStorage

- **WHEN** o `localStorage` não está disponível
- **THEN** a grade abre com a largura padrão, sem erro, e o redimensionamento ainda funciona na sessão
