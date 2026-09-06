## ADDED Requirements

### Requirement: Excluir o contato (Representante) de uma Empresa

No catálogo de fornecedores, uma Empresa que tem Representante SHALL oferecer uma ação "Excluir contato", sempre precedida por um diálogo de confirmação que nomeia os dois desfechos possíveis, decididos pelo back: se o Representante nunca participou de cotação, os dados são apagados e a Empresa fica sem contato (não pode ser convidada até cadastrar outro); se já participou, os dados pessoais são anonimizados e o histórico de cotações é preservado. Ao confirmar, o front SHALL chamar `DELETE /api/representantes/{id}` e SHALL exibir um retorno conforme o campo `resultado` da resposta (`REMOVIDO` ou `ANONIMIZADO`). Erro da API SHALL ser exibido a partir de `ApiError.message`.

#### Scenario: Ação disponível só com Representante

- **WHEN** o catálogo lista uma Empresa que tem Representante
- **THEN** a ação "Excluir contato" aparece para essa Empresa; para uma Empresa sem Representante, não aparece

#### Scenario: Confirmação nomeando os dois desfechos

- **WHEN** o usuário aciona "Excluir contato"
- **THEN** um diálogo explica que, sem histórico, os dados são apagados e a Empresa fica sem contato, e que, com histórico, os dados pessoais são anonimizados e o histórico é preservado; a exclusão só ocorre após confirmar

#### Scenario: Retorno reflete o que o back fez

- **WHEN** a confirmação chama `DELETE /api/representantes/{id}` e a resposta traz `resultado: "ANONIMIZADO"`
- **THEN** o front informa que os dados foram anonimizados e o histórico mantido; para `resultado: "REMOVIDO"`, informa que o contato foi removido

#### Scenario: Cancelar não chama a API

- **WHEN** o usuário aciona "Excluir contato" e cancela o diálogo
- **THEN** nenhuma chamada de exclusão é feita
