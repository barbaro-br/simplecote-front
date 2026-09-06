## ADDED Requirements

### Requirement: Remover item pela grade ao vivo

Com a Cotação `ABERTA`, a grade ao vivo SHALL oferecer, por linha de item, uma ação de remover o item, sempre atrás de um diálogo de confirmação que nomeia a consequência (os lances já registrados para aquele item serão descartados). Ao confirmar, o front SHALL chamar o endpoint de remoção de item e, no sucesso, atualizar a grade e a cotação para que o item deixe de aparecer. Erro da API SHALL ser exibido a partir de `ApiError.message`. Em `RASCUNHO` a remoção continua pela seção de itens; nos demais status não há ação de remover.

#### Scenario: Remover item com a cotação aberta

- **WHEN** a Cotação está `ABERTA` e o admin aciona remover numa linha da grade ao vivo e confirma no diálogo
- **THEN** o item é removido via API e a grade deixa de listá-lo

#### Scenario: Confirmação obrigatória

- **WHEN** o admin aciona remover mas cancela o diálogo
- **THEN** nenhuma chamada de remoção é feita

#### Scenario: Ação ausente fora de ABERTA

- **WHEN** a Cotação está `ENCERRADA` ou `PEDIDOS_GERADOS`
- **THEN** a grade ao vivo não mostra a ação de remover item
