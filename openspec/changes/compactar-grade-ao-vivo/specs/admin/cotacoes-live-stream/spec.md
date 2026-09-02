## ADDED Requirements

### Requirement: Linhas compactas na grade ao vivo

A grade ao vivo SHALL renderizar suas linhas de forma compacta, minimizando o espaço vertical ocioso por item, de modo a maximizar a quantidade de itens visíveis na tela sem rolar — preservando, ainda assim, um alvo de toque/clique utilizável em cada célula de preço.

#### Scenario: Cotação com muitos itens

- **WHEN** o admin abre a grade ao vivo de uma cotação com muitos itens
- **THEN** mais itens ficam visíveis na tela sem precisar rolar, comparado ao espaçamento anterior

#### Scenario: Célula de preço continua clicável

- **WHEN** o admin clica numa célula de preço para corrigir um lance, incluindo em um dispositivo touch
- **THEN** o clique/toque acerta a célula de forma confiável, sem exigir precisão excessiva
