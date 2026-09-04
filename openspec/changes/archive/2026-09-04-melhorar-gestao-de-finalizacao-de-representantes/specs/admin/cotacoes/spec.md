## MODIFIED Requirements

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação antes de `encerrar`, `cancelar` e `apurar`, nomeando a consequência de cada uma. O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida. Quando existirem participantes em status `VISUALIZOU` (engajaram mas não finalizaram a resposta), o diálogo de confirmação de `apurar` SHALL listar seus nomes como aviso informativo, sem bloquear a confirmação. O diálogo de confirmação de `encerrar` SHALL, quando existir ao menos um participante com pelo menos um lance `Cotado` (na Grade ao Vivo, já carregada pela tela) que ainda não está `Respondido`, listar esses participantes como aviso e oferecer um botão para finalizar a resposta de todos eles de uma vez, antes de encerrar — sem bloquear a confirmação de "Encerrar" caso o Comprador prefira ignorar o aviso. "Cancelar" SHALL ser exibido como um botão visível (não dentro de um menu overflow), com estilo visual de alerta (ex.: contorno/texto na cor de destrutivo, sem ser um botão preenchido do mesmo peso das transições primárias) e separado espacialmente dos botões de transição primária (Abrir/Encerrar/Reabrir/Apurar) na fileira de ações, para reduzir o risco de clique acidental mesmo estando visível. "Cancelar" SHALL só ser exibido quando `status` é `RASCUNHO` ou `ABERTA` — a única combinação que o backend (`Cotacao.cancelar()`) de fato aceita; em qualquer outro status (`ENCERRADA`, `PEDIDOS_GERADOS`, `CANCELADA`) o botão NÃO SHALL ser exibido. O botão "Representantes" SHALL ficar agrupado visualmente ao lado do botão de transição primária (Abrir/Encerrar/Reabrir+Apurar/Ver resultado), não ao lado de "Cancelar" — "Cancelar" SHALL permanecer sozinho, isolado no extremo oposto da fileira de ações.

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

#### Scenario: Encerrar avisa sobre representantes que preencheram preço mas não finalizaram

- **WHEN** o Comprador aciona "Encerrar" numa Cotação `ABERTA` e há um ou mais participantes com pelo menos um lance `Cotado` que ainda não estão `Respondido`
- **THEN** o diálogo de confirmação lista esses participantes, além da descrição padrão da consequência, e mostra um botão para finalizar a resposta de todos eles antes de encerrar

#### Scenario: Finalizar em massa antes de encerrar

- **WHEN** o Comprador aciona o botão de finalizar em massa no diálogo de "Encerrar"
- **THEN** o sistema chama `POST /api/participantes/{participanteId}/finalizar` para cada participante listado e, ao concluir, a lista de pendentes do diálogo reflete o novo estado (fica vazia se todos foram finalizados com sucesso)

#### Scenario: Encerrar sem pendências não mostra o aviso

- **WHEN** o Comprador aciona "Encerrar" e todos os participantes já estão `Respondido` (ou nenhum tem lance `Cotado` fora de `Respondido`)
- **THEN** o diálogo mostra só a descrição padrão da consequência, sem lista de pendentes nem botão de finalizar em massa

### Requirement: Correção de lance e reabertura de resposta pelo admin

O sistema SHALL permitir ao Comprador corrigir diretamente o lance de um participante para um item (`PUT /api/participantes/{participanteId}/lances/{itemId}`), reabrir a resposta de um participante `RESPONDIDO` (`POST /api/participantes/{participanteId}/reabrir`) e finalizar em nome de um participante `VISUALIZOU` ou `CONVIDADO` (`POST /api/participantes/{participanteId}/finalizar`), a partir da tela de detalhe da Cotação. A grade de respostas é lida de `GET /api/cotacoes/{id}/ao-vivo` sem polling (o polling é Fase 2). O modal de participantes (`RepresentantesModal`, acionado pelo botão "Representantes") SHALL, quando a Cotação está `ABERTA` ou `ENCERRADA`, mostrar em cada linha também o status da resposta (`Convidado`/`Visualizou`/`Respondido`) como badge, junto de um botão de ícone visível (não dentro de um menu overflow) com a ação de finalizar/reabrir aplicável àquele status (`Finalizar` para `Convidado` e para `Visualizou`; `Reabrir` para `Respondido`), posicionado ao lado do badge, logo abaixo do nome do representante. Quando a Cotação não está `ABERTA` nem `ENCERRADA` (ex.: `PEDIDOS_GERADOS`, `CANCELADA`), esse botão de finalizar/reabrir NÃO SHALL ser exibido, mesmo que o participante esteja em `CONVIDADO`/`VISUALIZOU`/`RESPONDIDO` — essas ações não têm efeito útil fora desse intervalo.

#### Scenario: Admin corrige um lance

- **WHEN** o Comprador edita o preço (ou marca não cotado) de um lance de um participante e confirma
- **THEN** o sistema chama a API de correção e a grade de respostas reflete o novo valor

#### Scenario: Admin reabre a resposta de um participante

- **WHEN** o Comprador aciona o botão "Reabrir" exibido junto ao badge de um participante `RESPONDIDO`
- **THEN** o sistema chama a API e o participante volta a aparecer como editável pelo representante

#### Scenario: Admin finaliza a resposta de um participante que não finalizou

- **WHEN** o Comprador aciona o botão "Finalizar" exibido junto ao badge de um participante `VISUALIZOU`
- **THEN** o sistema chama `POST /api/participantes/{participanteId}/finalizar` e a linha desse participante passa a mostrar `Respondido`

#### Scenario: Modal "Representantes" reflete o status de resposta de cada um

- **WHEN** o Comprador abre o modal "Representantes" de uma Cotação `ABERTA` ou `ENCERRADA` com participantes em status de resposta diferentes
- **THEN** cada participante aparece com seu status de resposta atual (badge) e, ao lado, o botão de ação aplicável àquele status (`Finalizar` para `Convidado` e para `Visualizou`, `Reabrir` para `Respondido`)

#### Scenario: Ações de finalizar/reabrir somem fora de ABERTA/ENCERRADA

- **WHEN** o Comprador abre o modal "Representantes" de uma Cotação em `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** nenhuma linha exibe o botão "Finalizar" ou "Reabrir", independentemente do status de resposta de cada participante

#### Scenario: Admin finaliza um participante que nunca visualizou

- **WHEN** o Comprador aciona o botão "Finalizar" exibido junto ao badge de um participante `CONVIDADO` (nunca abriu o link)
- **THEN** o sistema chama `POST /api/participantes/{participanteId}/finalizar`, a linha passa a mostrar `Respondido` e nenhum lance desse participante entra na apuração (nenhum item foi cotado)
