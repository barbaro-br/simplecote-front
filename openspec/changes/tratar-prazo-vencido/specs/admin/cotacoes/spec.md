## ADDED Requirements

### Requirement: Aviso de prazo vencido na Cotação

Quando uma Cotação está `ABERTA` e a API indica `prazoVencido` verdadeiro, o sistema SHALL sinalizar isso ao admin: na tela de detalhe, um aviso destacado acima do conteúdo dizendo que os representantes não podem mais responder e que a Cotação precisa ser encerrada para ser apurada, com o botão "Encerrar" em evidência; na lista de Cotações, um indicador na linha correspondente. O aviso e o indicador SHALL sumir quando a Cotação deixa de estar `ABERTA`. As ações (Encerrar/Reabrir) não mudam — o aviso é apenas orientação.

#### Scenario: Detalhe de cotação com prazo vencido

- **WHEN** a tela de detalhe abre uma Cotação `ABERTA` com `prazoVencido` verdadeiro
- **THEN** um aviso destacado aparece orientando a encerrar, e o botão "Encerrar" fica em evidência

#### Scenario: Cotação aberta dentro do prazo não mostra aviso

- **WHEN** a Cotação está `ABERTA` com `prazoVencido` falso
- **THEN** nenhum aviso de prazo vencido é exibido

#### Scenario: Indicador some após encerrar

- **WHEN** o admin encerra uma Cotação que estava com prazo vencido
- **THEN** o aviso da tela de detalhe e o indicador da lista deixam de aparecer para ela
