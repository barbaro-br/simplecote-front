## ADDED Requirements

### Requirement: Animação de entrada só na carga inicial

A animação de entrada escalonada das linhas da lista de Cotações SHALL ocorrer apenas na carga inicial da lista (quando os dados chegam pela primeira vez), e SHALL NOT se repetir quando o admin altera a busca por título ou o filtro de status.

#### Scenario: Ampliar a busca não faz linhas reaparecerem com delay

- **WHEN** o admin digita uma busca que esconde algumas cotações e depois apaga parte do texto, trazendo-as de volta
- **THEN** as linhas que voltam a aparecer ficam visíveis imediatamente, sem um novo delay escalonado de entrada

#### Scenario: Trocar o filtro de status não reanima a lista

- **WHEN** o admin troca o filtro de status
- **THEN** a lista atualizada aparece sem o efeito de fade-in escalonado que só deve ocorrer na carga inicial da página
