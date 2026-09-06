## ADDED Requirements

### Requirement: Feedback de item adicionado pelo colaborador

O sistema SHALL notificar o Comprador, em tempo real, quando um colaborador adiciona um item a uma cotação aberta, exibindo uma notificação transiente (toast) na tela de acompanhamento, sem exigir refresh manual — em complemento ao destaque visual de lances já existente.

#### Scenario: Colaborador adiciona item com a grade aberta
- **WHEN** um colaborador adiciona um item via link e o Comprador está com a grade ao vivo (ou o detalhe) daquela cotação aberto
- **THEN** o Comprador recebe um toast transiente informando a inclusão (ex.: "Colaborador adicionou um item"), e a grade passa a refletir o novo item

#### Scenario: Item adicionado em outra aba
- **WHEN** o colaborador adiciona um item enquanto a tela do Comprador está aberta mas em segundo plano (aba inativa)
- **THEN** a notificação é exibida quando a aba volta a ficar ativa, sem perder o item da grade
