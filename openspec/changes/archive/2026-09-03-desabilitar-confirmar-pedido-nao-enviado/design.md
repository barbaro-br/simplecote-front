## Context

`PedidoDTO.status` (back) já vem com um dos três valores
`GERADO`/`ENVIADO`/`CONFIRMADO` (`Pedido` só permite confirmar a partir de
`ENVIADO` — `PedidoService`/`Pedido.confirmar()`). O front só usa esse campo
pra decidir o estado final (`CONFIRMADO`); não distingue `GERADO` de
`ENVIADO`.

## Goals / Non-Goals

**Goals:**
- O representante nunca vê um erro cru de backend ao tentar confirmar um
  pedido que ainda não foi enviado — a tela já deixa isso visualmente claro
  antes de qualquer clique.

**Non-Goals:**
- Não muda a regra de negócio em si (`ENVIADO` continua sendo o único status
  de onde dá pra confirmar) — só a apresentação no front.

## Decisions

- **`aguardandoEnvio = p.status === 'GERADO'`**: quando verdadeiro, o botão
  "Confirmar" (e o campo de observação, que só faz sentido junto da
  confirmação) somem, substituídos por uma mensagem curta explicando que o
  pedido ainda está sendo preparado pelo comprador. "Baixar PDF" continua
  disponível nos três estados (já funciona hoje independente do status).

## Risks / Trade-offs

- Nenhum — é estritamente reduzir a chance de erro, sem remover nenhuma
  capacidade do estado `ENVIADO` (que continua exatamente como está).
