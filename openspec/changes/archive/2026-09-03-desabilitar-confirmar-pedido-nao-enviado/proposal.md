## Why

Em `/pedido/:token`, o botão "Confirmar" fica habilitado assim que o pedido
existe, mesmo antes do Comprador clicar "Enviar" no Resultado da apuração
(status `GERADO`, ainda não `ENVIADO`). `PedidoPorTokenPage.tsx` só calcula
`confirmado = p.status === 'CONFIRMADO' || p.confirmadoEm != null` — não há
nenhum tratamento para o estado intermediário `GERADO`.

Reproduzido ao vivo: com o pedido ainda em `GERADO`, cliquei "Confirmar" e o
backend rejeitou com `IllegalStateException("Só pode confirmar pedido
ENVIADO.")` — essa string crua, técnica, aparece direto pro fornecedor sem
tradução nem contexto, e só depois do clique. A tela deveria já indicar
visualmente, antes do clique, que a confirmação ainda não está disponível.

## What Changes

- `PedidoPorTokenPage.tsx` passa a distinguir três estados:
  `GERADO` (aguardando envio — botão "Confirmar" oculto, mensagem
  explicativa em vez dele), `ENVIADO` (comportamento atual: botão
  habilitado), `CONFIRMADO` (comportamento atual: tela de sucesso).

## Capabilities

### Modified Capabilities

- `representante/cotacao`: requirement "Visualização e confirmação do pedido
  por token" — adiciona cenário para o estado `GERADO`/aguardando envio.

## Impact

- `src/representante/pedido/PedidoPorTokenPage.tsx`
