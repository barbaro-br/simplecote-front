## ADDED Requirements

### Requirement: Nome da loja truncado tem alternativa de descoberta

A sidebar tem largura fixa, independente da largura da viewport — o cabeçalho (ícone + nome da loja + botão de recolher) SHALL usar o espaço disponível da forma mais justa possível entre o nome e os elementos vizinhos (sem uma largura menor do que o necessário reservada só para o nome), mas nomes de loja mais longos SHALL continuar sendo truncados com reticências quando não couberem nesse espaço fixo — isso é esperado, não um bug. Quando o nome está truncado, o elemento SHALL expor o nome completo via atributo nativo `title`, para que passar o mouse sobre ele revele o nome inteiro.

#### Scenario: Nome curto cabe por completo

- **WHEN** o admin vê a sidebar expandida com um nome de loja curto o suficiente para caber ao lado do ícone e do botão de recolher
- **THEN** o nome aparece por completo, sem reticências

#### Scenario: Nome que não cabe trunca com reticências e tooltip nativo

- **WHEN** o nome da loja não cabe no espaço fixo disponível da sidebar (ex.: "Sara Supermercado", que já é longo o suficiente para não caber ao lado do ícone e do botão de recolher)
- **THEN** o nome é truncado com reticências, sem quebrar o layout do cabeçalho, e passar o mouse sobre ele mostra o nome completo via tooltip nativo (`title`)
