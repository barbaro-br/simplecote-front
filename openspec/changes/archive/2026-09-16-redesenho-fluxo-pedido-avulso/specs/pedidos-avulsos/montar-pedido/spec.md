## MODIFIED Requirements

### Requirement: Formulário de empresa/condição removido da tela de montagem

A tela de montagem (`NovoPedidoAvulsoPage`) NÃO DEVE (SHALL NOT) mais exibir campos de seleção de empresa, condição de pagamento e prazo de entrega. Esses dados DEVEM (SHALL) ser exibidos somente como cabeçalho somente-leitura, populados a partir do pedido já criado.

#### Scenario: Entrar na tela de montagem com pedido já criado
- **WHEN** o usuário chega em `/admin/pedidos-avulsos/{id}` com id existente
- **THEN** a tela exibe empresa, representante, condição e prazo como texto somente-leitura no cabeçalho, sem campos de entrada

#### Scenario: Recarregar a tela (F5) com id na URL
- **WHEN** o usuário recarrega `/admin/pedidos-avulsos/{id}`
- **THEN** os dados do cabeçalho são populados via `usePedidoAvulso(id)` — a tela NÃO exibe formulário de configuração

### Requirement: Visual brutalista na tela de montagem

A tela de montagem DEVE (SHALL) seguir o padrão visual de `CotacoesPageV2`: fundo `#111813`, thead `#17221b`, ícones `size-4 weight="bold"`, sem `rounded-md/lg` (usar `rounded-none`).

#### Scenario: Renderização visual consistente
- **WHEN** a tela de montagem é renderizada
- **THEN** todos os cantos são retos (`rounded-none`), sem bordas de tabela visíveis, e a cor de fundo do cabeçalho de colunas é `#17221b`

### Requirement: Tela de conclusão com ações de PDF e e-mail

Após fechar o pedido, a tela de conclusão DEVE (SHALL) oferecer:
- Botão "Baixar PDF" → `GET /api/pedidos/{id}.pdf`
- Botão "Reenviar e-mail" → `POST /api/pedidos/{id}/enviar`

#### Scenario: Fechar pedido e ver opções de conclusão
- **WHEN** o usuário fecha o pedido com sucesso
- **THEN** a tela exibe total, quantidade de itens, botão "Baixar PDF", botão "Reenviar e-mail" e link para voltar à lista de pedidos

#### Scenario: Falha ao baixar PDF
- **WHEN** a chamada ao endpoint de PDF falha
- **THEN** o sistema exibe o erro via toast usando `ApiError.message`
