## ADDED Requirements

### Requirement: Indicador de item novo

Quando um item da Cotação tem `statusLance` `PENDENTE` enquanto pelo menos outro item da mesma Cotação já tem `statusLance` diferente de `PENDENTE` (`COTADO` ou `NAO_COTADO`), o card desse item SHALL exibir um indicador visual de "Novo" — sinalizando que ele foi adicionado depois que o representante já havia começado a responder. O indicador SHALL ser inferido só a partir dos dados já retornados por `GET /public/cotacoes/:token`, sem exigir nenhum campo adicional.

#### Scenario: Item pendente entre itens já respondidos é marcado como novo

- **WHEN** o representante abre a cotação e um item está `PENDENTE` enquanto outros já estão `COTADO`/`NAO_COTADO`
- **THEN** o card desse item exibe o indicador "Novo"

#### Scenario: Primeiro acesso não marca nada como novo

- **WHEN** o representante abre a cotação pela primeira vez e todos os itens estão `PENDENTE`
- **THEN** nenhum card exibe o indicador "Novo"
