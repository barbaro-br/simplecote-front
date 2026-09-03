## MODIFIED Requirements

### Requirement: Indicador de item novo

Um item da Cotação SHALL exibir um indicador visual de "Novo" no card quando
o `itemCotacaoId` dele não estava presente no primeiro carregamento
bem-sucedido da cotação nesta visita do representante — sinalizando que ele
foi adicionado pelo comprador depois que o representante já havia começado a
ver a cotação. O indicador SHALL ser inferido só a partir dos dados já
retornados por `GET /public/cotacoes/:token` (o conjunto de ids do primeiro
carregamento), sem exigir nenhum campo adicional do backend. O status de
outros itens da mesma cotação (`statusLance`) NÃO SHALL influenciar se um
item é marcado como novo.

#### Scenario: Item pendente entre itens já respondidos é marcado como novo

- **WHEN** um item está `PENDENTE` enquanto outros itens da mesma cotação já
  estão `COTADO`/`NAO_COTADO`, **e** esse item já estava presente no
  primeiro carregamento da tela (não foi adicionado depois)
- **THEN** o card desse item NÃO exibe o indicador "Novo" — o status dos
  outros itens não tem nenhuma influência na marcação; só importa se o
  próprio item estava ou não presente no primeiro carregamento

#### Scenario: Item adicionado após o primeiro carregamento é marcado como novo

- **WHEN** o comprador adiciona um item à cotação depois que o representante
  já carregou a tela pela primeira vez, e a tela recebe esse item numa
  atualização seguinte (polling/refetch)
- **THEN** o card desse item exibe o indicador "Novo"

#### Scenario: Primeiro acesso não marca nada como novo

- **WHEN** o representante abre a cotação pela primeira vez nesta visita
- **THEN** nenhum card exibe o indicador "Novo", independente do
  `statusLance` de cada item
