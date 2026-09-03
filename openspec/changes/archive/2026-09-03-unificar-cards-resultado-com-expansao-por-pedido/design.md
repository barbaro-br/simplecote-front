## Context

`ResultadoPage.tsx` hoje renderiza dois `Card` sequenciais:
1. "Pedidos Gerados" — `listaPedidos.map(pedido => ...)`, colunas
   Empresa/Status/Total/Ações (PDF, Enviar quando `GERADO`).
2. "Vencedor por item" — `vencedores` (achatado de
   `resultado.data.pedidos.flatMap(pedido => pedido.itens.map(...))`),
   colunas Produto/Empresa/Preço embalagem/Preço unitário (com badge
   "Empate" quando `decididoPorDesempate`)/Subtotal, mais o bloco de
   "Itens sem vencedor" abaixo.

Cada `pedido.itens` já tem tudo que a linha expandida precisa —
`vencedores` já é só um achatamento disso pra tabela separada, que deixa
de ser necessário como estrutura própria (os dados continuam vindo do
mesmo `resultado.data.pedidos`, só a apresentação muda).

## Goals / Non-Goals

**Goals:**
- Cada Empresa aparece uma vez só na tela; ver os itens dela é uma ação
  explícita (expandir), não duas listas pra cruzar mentalmente.
- Nenhuma informação se perde: status do pedido, total, ações (PDF/Enviar),
  itens com preço/subtotal/indicador de empate, itens sem vencedor.

**Non-Goals:**
- Não muda os dados/queries (`useResultado`, `usePedidos`) nem os
  endpoints chamados.
- Não muda o comportamento de "Baixar XLSX" (card/botão no topo da
  página, fora dos dois cards que estão sendo unificados).
- Não implementa edição de quantidade pós-apuração (avaliado à parte
  nesta mesma conversa e descartado — a Cotação é imutável após apurada).

## Decisions

- **Um card, uma tabela de pedidos, expansão inline por linha**: cada
  linha de pedido ganha um botão/ícone de expandir (chevron) à esquerda
  ou direita da linha; ao clicar, uma linha adicional (`colSpan` completo)
  aparece logo abaixo com uma tabela aninhada dos itens daquele pedido
  (Produto, Preço da embalagem, Preço unitário + badge de empate quando
  aplicável, Subtotal) — mesmas colunas que "Vencedor por item" tinha,
  menos "Empresa" (já é a linha pai).
- **Estado de expansão em memória local** (`useState<Set<string>>` de ids
  de pedido expandidos), sem persistir nem afetar URL — comportamento
  puramente de apresentação, resetado ao recarregar a página.
- **"Itens sem vencedor" continua como bloco à parte**, abaixo da tabela
  de pedidos (dentro do mesmo card agora, não um card próprio) — esses
  itens não têm pedido/empresa, não cabem numa linha expandida.

## Risks / Trade-offs

- Nenhum risco relevante — é reorganização de apresentação sobre os
  mesmos dados já carregados, sem mudança de contrato com o backend.
