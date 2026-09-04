## MODIFIED Requirements

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação antes de `encerrar`, `cancelar` e `apurar`, nomeando a consequência de cada uma. O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida. Quando existirem participantes em status `VISUALIZOU` (engajaram mas não finalizaram a resposta), o diálogo de confirmação de `apurar` SHALL listar seus nomes como aviso informativo, sem bloquear a confirmação. "Cancelar" SHALL ser exibido como um botão visível (não dentro de um menu overflow), com estilo visual de alerta (ex.: contorno/texto na cor de destrutivo, sem ser um botão preenchido do mesmo peso das transições primárias) e separado espacialmente dos botões de transição primária (Abrir/Encerrar/Reabrir/Apurar) na fileira de ações, para reduzir o risco de clique acidental mesmo estando visível. "Cancelar" SHALL só ser exibido quando `status` é `RASCUNHO` ou `ABERTA` — a única combinação que o backend (`Cotacao.cancelar()`) de fato aceita; em qualquer outro status (`ENCERRADA`, `PEDIDOS_GERADOS`, `CANCELADA`) o botão NÃO SHALL ser exibido. O botão "Representantes" SHALL ficar agrupado visualmente ao lado do botão de transição primária (Abrir/Encerrar/Reabrir+Apurar/Ver resultado), não ao lado de "Cancelar" — "Cancelar" SHALL permanecer sozinho, isolado no extremo oposto da fileira de ações.

#### Scenario: Abrir a Cotação
- **WHEN** o Comprador informa um `prazo` e confirma "Abrir"
- **THEN** o sistema chama `POST /{id}/abrir` e a tela passa a refletir o status `ABERTA` e o prazo

#### Scenario: Apurar pede confirmação explícita
- **WHEN** o Comprador aciona "Apurar"
- **THEN** um diálogo descreve a consequência (a apuração não pode ser desfeita; itens sem lance ficam sem vencedor) e só após a confirmação a API é chamada

#### Scenario: Cancelar pede confirmação explícita
- **WHEN** o Comprador aciona "Cancelar"
- **THEN** um diálogo nomeia a consequência antes de a API ser chamada

#### Scenario: Transição inválida mostra o erro do backend
- **WHEN** a API rejeita uma transição (ex.: apurar uma cotação ainda `ABERTA` com pendências que o backend não permite)
- **THEN** a mensagem `ProblemDetail` é exibida e o status na tela não muda

#### Scenario: Apurar avisa sobre participantes não finalizados
- **WHEN** o Comprador aciona "Apurar" e há um ou mais participantes em `VISUALIZOU`
- **THEN** o diálogo de confirmação lista os nomes desses participantes como aviso, além da descrição padrão da consequência

#### Scenario: Cancelar fica no menu overflow, não em botão visível

- **WHEN** o Comprador abre o detalhe de uma Cotação `RASCUNHO` ou `ABERTA` (status onde "Cancelar" é aplicável)
- **THEN** "Cancelar" aparece como botão visível de estilo de alerta, separado espacialmente do grupo de botões de transição primária — não dentro de um menu overflow

#### Scenario: Encerrar pede confirmação explícita

- **WHEN** o Comprador aciona "Encerrar" numa Cotação `ABERTA`
- **THEN** um diálogo descreve a consequência (a Cotação para de aceitar novas respostas dos representantes; pode ser reaberta depois) e só após a confirmação a API é chamada

#### Scenario: Cancelar não aparece em ENCERRADA

- **WHEN** o Comprador abre o detalhe de uma Cotação `ENCERRADA`
- **THEN** o botão "Cancelar" não é exibido — o backend só aceita cancelar a partir de `RASCUNHO` ou `ABERTA`

#### Scenario: Cancelar não aparece em PEDIDOS_GERADOS ou CANCELADA

- **WHEN** o Comprador abre o detalhe de uma Cotação `PEDIDOS_GERADOS` ou já `CANCELADA`
- **THEN** o botão "Cancelar" não é exibido

#### Scenario: Representantes fica agrupado com a transição primária

- **WHEN** o Comprador abre o detalhe de uma Cotação em qualquer status onde "Representantes" é exibido (todos exceto `CANCELADA`)
- **THEN** o botão "Representantes" aparece visualmente ao lado do botão de transição primária daquele status, e "Cancelar" (quando aplicável) fica isolado no extremo oposto da fileira
