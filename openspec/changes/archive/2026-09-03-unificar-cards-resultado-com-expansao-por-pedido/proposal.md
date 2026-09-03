## Why

A tela de Resultado hoje mostra a mesma informação duas vezes em dois
cards separados: "Pedidos Gerados" (uma linha por Empresa, com status,
total e ações de PDF/Enviar) e "Vencedor por item" (uma linha por item
vencido, com produto, empresa, preços e subtotal — a mesma informação já
presente dentro de cada pedido, só detalhada). O usuário pediu para juntar
os dois num só, com uma seta de "mais informações" por linha que expande
e mostra os itens daquele pedido.

## What Changes

- Os dois cards viram um só ("Pedidos Gerados"). Cada linha de Empresa
  ganha um controle de expandir/recolher; ao expandir, mostra inline os
  itens daquele pedido (produto, preço da embalagem, preço unitário — com
  o indicador de empate quando aplicável — e subtotal), sem navegar pra
  outro lugar.
- A lista de "Itens sem vencedor" (itens sem nenhum lance, portanto sem
  pedido/empresa associada) continua existindo, como um bloco à parte
  abaixo da lista de pedidos — não cabe dentro de nenhuma linha expandida,
  já que não pertence a nenhum pedido.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Resultado da apuração e pedidos" — os
  vencedores por item passam a aparecer dentro da linha expandida do
  pedido correspondente, não numa tabela separada.

## Impact

- `src/admin/cotacoes/ResultadoPage.tsx`
