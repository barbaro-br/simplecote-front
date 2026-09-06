# admin/cotacoes-live-stream Specification

## Purpose
Real-time Server-Sent Events (SSE) stream for instantaneous quotation updates.

## Requirements

### Requirement: SSE Endpoint
The system SHALL provide an SSE endpoint to stream events for a specific quotation.

#### Scenario: Subscribing to the stream
- **WHEN** a client connects to the SSE endpoint for an `ABERTA` quotation
- **THEN** the stream opens and pushes quotation update events

#### Scenario: Receiving an update event
- **WHEN** an RCA places or changes a bid
- **THEN** the system pushes an update event (e.g. `LanceAtualizado`) through the active SSE stream so connected clients can update immediately

### Requirement: Linhas compactas na grade ao vivo

A grade ao vivo SHALL renderizar suas linhas de forma compacta, minimizando o espaço vertical ocioso por item, de modo a maximizar a quantidade de itens visíveis na tela sem rolar — preservando, ainda assim, um alvo de toque/clique utilizável em cada célula de preço.

#### Scenario: Cotação com muitos itens

- **WHEN** o admin abre a grade ao vivo de uma cotação com muitos itens
- **THEN** mais itens ficam visíveis na tela sem precisar rolar, comparado ao espaçamento anterior

#### Scenario: Célula de preço continua clicável

- **WHEN** o admin clica numa célula de preço para corrigir um lance, incluindo em um dispositivo touch
- **THEN** o clique/toque acerta a célula de forma confiável, sem exigir precisão excessiva

### Requirement: Feedback visual de atualização em tempo real
A grade ao vivo SHALL aplicar um efeito visual transiente (*flash* ou *highlight* sutil) nas células de preço que forem atualizadas (novos lances ou alterações) via *SSE (Server-Sent Events)* ou *streaming*, para chamar a atenção do comprador para a mudança sem interromper sua navegação.

#### Scenario: Novo lance recebido na grade
- **WHEN** um representante submete um preço e a grade atualiza seu valor automaticamente
- **THEN** a célula correspondente exibe uma rápida transição de cor (ex: verde piscando sutilmente) antes de retornar ao estado padrão

#### Scenario: Mudança de liderança (Menor Preço)
- **WHEN** uma atualização de preço faz com que uma célula passe a ser o menor preço daquele item
- **THEN** o destaque visual de menor preço é aplicado não apenas de forma estática, mas acompanhado de uma leve transição para evidenciar a nova liderança

### Requirement: Feedback de item adicionado pelo colaborador

O sistema SHALL notificar o Comprador, em tempo real, quando um colaborador adiciona um item a uma cotação aberta, exibindo uma notificação transiente (toast) na tela de acompanhamento, sem exigir refresh manual — em complemento ao destaque visual de lances já existente.

#### Scenario: Colaborador adiciona item com a grade aberta
- **WHEN** um colaborador adiciona um item via link e o Comprador está com a grade ao vivo (ou o detalhe) daquela cotação aberto
- **THEN** o Comprador recebe um toast transiente informando a inclusão (ex.: "Colaborador adicionou um item"), e a grade passa a refletir o novo item

#### Scenario: Item adicionado em outra aba
- **WHEN** o colaborador adiciona um item enquanto a tela do Comprador está aberta mas em segundo plano (aba inativa)
- **THEN** a notificação é exibida quando a aba volta a ficar ativa, sem perder o item da grade
