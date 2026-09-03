## MODIFIED Requirements

### Requirement: Visualização e confirmação do pedido por token
O sistema SHALL, em `/pedido/:token`, carregar `GET /public/pedidos/:token`, permitir baixar o PDF (`GET /public/pedidos/:token.pdf`) e confirmar o pedido (`POST /public/pedidos/:token/confirmar`). A tela SHALL ser mobile-first e sem a navegação do painel. Quando o `status` do pedido for `GERADO` (o Comprador ainda não enviou), o botão "Confirmar" NÃO SHALL ser exibido — em seu lugar, a tela SHALL mostrar uma mensagem indicando que o pedido ainda está aguardando envio. "Baixar PDF" continua disponível independente do `status`.

#### Scenario: Ver e baixar o pedido
- **WHEN** o representante acessa `/pedido/:token` com token válido
- **THEN** os dados do pedido são exibidos e o PDF pode ser baixado

#### Scenario: Confirmar o pedido
- **WHEN** o representante aciona "Confirmar"
- **THEN** o sistema chama a API de confirmação e a tela reflete o pedido confirmado; um erro `ProblemDetail` é exibido se a API recusar

#### Scenario: Pedido ainda não enviado não oferece confirmação

- **WHEN** o representante acessa `/pedido/:token` de um pedido com `status` `GERADO`
- **THEN** o botão "Confirmar" não aparece; a tela mostra uma mensagem informando que o pedido está aguardando envio pelo comprador, e "Baixar PDF" continua disponível
