## ADDED Requirements

### Requirement: Busca no Catálogo
A tela de Catálogo de produtos SHALL exibir um campo de busca no topo, acima da tabela, com placeholder indicando que a busca é por nome ou código de barras. Digitar no campo SHALL filtrar a lista exibida, em tempo real (sem necessidade de confirmar/pressionar Enter), comparando o texto digitado (sem diferenciar maiúsculas/minúsculas, nem acentuação) contra o nome do produto e contra o código de barras. A busca SHALL operar sobre a lista de produtos já carregada pela tela (client-side), sem disparar nova chamada de API. Limpar o campo SHALL restaurar a lista completa. Quando nenhum produto corresponder ao termo buscado, a tabela SHALL exibir um estado vazio informando que nenhum produto foi encontrado para aquele termo, distinto do estado vazio de "nenhum produto cadastrado".

#### Scenario: Buscar por nome
- **WHEN** o usuário digita parte do nome de um produto no campo de busca
- **THEN** a tabela passa a exibir apenas os produtos cujo nome contém o termo digitado

#### Scenario: Buscar por código de barras
- **WHEN** o usuário digita um código de barras (completo ou parcial) no campo de busca
- **THEN** a tabela passa a exibir apenas os produtos cujo código de barras contém o termo digitado

#### Scenario: Busca sem diferenciar maiúsculas/minúsculas ou acentos
- **WHEN** o usuário digita um termo sem acentuação ou com capitalização diferente do nome cadastrado (ex.: "acucar" para "Açúcar")
- **THEN** os produtos correspondentes aparecem normalmente na lista filtrada

#### Scenario: Limpar a busca restaura a lista completa
- **WHEN** o usuário apaga o conteúdo do campo de busca
- **THEN** a tabela volta a exibir todos os produtos do catálogo

#### Scenario: Nenhum resultado para o termo buscado
- **WHEN** o termo digitado não corresponde a nenhum produto do catálogo
- **THEN** a tabela exibe um estado vazio específico informando que nenhum produto foi encontrado para a busca
