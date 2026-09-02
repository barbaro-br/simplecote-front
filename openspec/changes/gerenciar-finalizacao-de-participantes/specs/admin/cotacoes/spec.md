## MODIFIED Requirements

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação que nomeie a consequência antes de `cancelar` e `apurar` (operações irreversíveis, regra 8 do `spec.md`). O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida. Quando existirem participantes em status `VISUALIZOU` (engajaram mas não finalizaram a resposta), o diálogo de confirmação de `apurar` SHALL listar seus nomes como aviso informativo, sem bloquear a confirmação.

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

### Requirement: Correção de lance e reabertura de resposta pelo admin

O sistema SHALL permitir ao Comprador corrigir diretamente o lance de um participante para um item (`PUT /api/participantes/{participanteId}/lances/{itemId}`), reabrir a resposta de um participante `RESPONDIDO` (`POST /api/participantes/{participanteId}/reabrir`) e finalizar em nome de um participante `VISUALIZOU` (`POST /api/participantes/{participanteId}/finalizar`), a partir da tela de detalhe da Cotação. A grade de respostas é lida de `GET /api/cotacoes/{id}/ao-vivo` sem polling (o polling é Fase 2). Uma seção de participantes SHALL listar cada participante com seu status (`Convidado`/`Visualizou`/`Respondido`) e as ações de finalizar/reabrir aplicáveis a cada status.

#### Scenario: Admin corrige um lance

- **WHEN** o Comprador edita o preço (ou marca não cotado) de um lance de um participante e confirma
- **THEN** o sistema chama a API de correção e a grade de respostas reflete o novo valor

#### Scenario: Admin reabre a resposta de um participante

- **WHEN** o Comprador aciona "Reabrir resposta" num participante `RESPONDIDO`
- **THEN** o sistema chama a API e o participante volta a aparecer como editável pelo representante

#### Scenario: Admin finaliza a resposta de um participante que não finalizou

- **WHEN** o Comprador aciona "Finalizar em nome do participante" num participante `VISUALIZOU`
- **THEN** o sistema chama `POST /api/participantes/{participanteId}/finalizar` e a seção de participantes passa a mostrar esse participante como `Respondido`

#### Scenario: Seção de participantes reflete o status de cada um

- **WHEN** o Comprador abre o detalhe de uma Cotação `ABERTA` ou `ENCERRADA` com participantes em status diferentes
- **THEN** cada participante aparece com seu status atual e só o botão de ação aplicável àquele status (`Finalizar` para `Visualizou`, `Reabrir resposta` para `Respondido`, nenhum para `Convidado`)
