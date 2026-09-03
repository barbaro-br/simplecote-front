## MODIFIED Requirements

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação que nomeie a consequência antes de `cancelar` e `apurar` (operações irreversíveis, regra 8 do `spec.md`). O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida. Quando existirem participantes em status `VISUALIZOU` (engajaram mas não finalizaram a resposta), o diálogo de confirmação de `apurar` SHALL listar seus nomes como aviso informativo, sem bloquear a confirmação. "Cancelar" SHALL ser acionado a partir de um menu overflow ("⋯"), separado dos botões de transição primária (Abrir/Encerrar/Reabrir/Apurar) — nunca um botão de primeiro nível na mesma fileira.

#### Scenario: Abrir a Cotação
- **WHEN** o Comprador informa um `prazo` e confirma "Abrir"
- **THEN** o sistema chama `POST /{id}/abrir` e a tela passa a refletir o status `ABERTA` e o prazo

#### Scenario: Apurar pede confirmação explícita
- **WHEN** o Comprador aciona "Apurar"
- **THEN** um diálogo descreve a consequência (a apuração não pode ser desfeita; itens sem lance ficam sem vencedor) e só após a confirmação a API é chamada

#### Scenario: Cancelar pede confirmação explícita
- **WHEN** o Comprador abre o menu overflow ("⋯") e aciona "Cancelar"
- **THEN** um diálogo nomeia a consequência antes de a API ser chamada

#### Scenario: Transição inválida mostra o erro do backend
- **WHEN** a API rejeita uma transição (ex.: apurar uma cotação ainda `ABERTA` com pendências que o backend não permite)
- **THEN** a mensagem `ProblemDetail` é exibida e o status na tela não muda

#### Scenario: Apurar avisa sobre participantes não finalizados
- **WHEN** o Comprador aciona "Apurar" e há um ou mais participantes em `VISUALIZOU`
- **THEN** o diálogo de confirmação lista os nomes desses participantes como aviso, além da descrição padrão da consequência

#### Scenario: Cancelar fica no menu overflow, não em botão visível

- **WHEN** o Comprador abre o detalhe de uma Cotação em qualquer status onde "Cancelar" é aplicável
- **THEN** "Cancelar" aparece dentro do menu "⋯", não como botão de primeiro nível ao lado das transições de estado
