## Context

Consome o back já desenhado em `aba-pedidos-e-condicao-pagamento` (`simplecote-back`): `GET /api/pedidos` (agregado, agrupado por Cotação + avulsos), catálogo `/api/condicoes-pagamento`, `PUT /public/cotacoes/{token}/condicoes`, e os campos novos em `GET /api/cotacoes/{id}/resultado`/`POST /api/cotacoes`/`POST /api/pedidos/avulsos`/`GET /public/cotacoes/{token}`. `admin/empresas` (`EmpresasPage.tsx`) é o padrão de referência pra CRUD simples por-Comprador. `admin/pedidos-avulsos` (`NovoPedidoAvulsoPage.tsx`) e `representante/cotacao` (`CotacaoPorTokenPage.tsx`/`LinhaPreco.tsx`) já existem e ganham campos, não telas novas.

## Goals / Non-Goals

**Goals:**
- Aba "Pedidos" como ponto de entrada rápido, sem esperar entrar numa Cotação específica.
- Condição de pagamento com uma única fonte de opções (o catálogo) reaproveitada em Cotação, resposta do representante, e Pedido avulso — sem widget diferente em cada lugar.
- Zero mudança visual/comportamental pra quem nunca usa os campos novos.

**Non-Goals:**
- Filtro/busca avançada na aba Pedidos (é uma listagem simples na v1; adicionar filtro por status/período fica pra depois, se sentir falta).
- Editar condição de pagamento/prazo de entrega depois que o Pedido `AVULSO` fecha, ou depois que a Cotação apura — são snapshots de texto (design.md do back, Decisão 1), não editáveis por essas telas após esse ponto.
- Mudar o `ResultadoPage` além de adicionar os dois campos na linha — layout e ações continuam como estão.

## Decisions

### Decisão 1: `PedidosPage.tsx` nova, componente de resumo compartilhado com `ResultadoPage`

A aba nova (`admin/pedidos/PedidosPage.tsx`) usa o mesmo componente visual de "linha de pedido resumida" (Empresa/status/total/condição/prazo) que `ResultadoPage.tsx` já tem — extrair um componente compartilhado (`LinhaPedidoResumo` ou nome equivalente) em vez de duplicar o markup, já que os dois DTOs (`PedidoResumoDTO` do endpoint agregado, e os itens de `GET /api/cotacoes/{id}/resultado`) trazem os mesmos campos de resumo.

### Decisão 2: combobox de condição de pagamento com opção de "criar nova" só no Pedido avulso

`admin/condicoes-pagamento` é um catálogo simples (mesmo componente de combobox usado em outros lugares do projeto, ex. "Cotação de origem" na duplicação). No Pedido avulso, o combobox aceita digitar um valor que não está na lista e usá-lo como texto ad-hoc (sem chamar `POST /api/condicoes-pagamento` — o back já aceita `condicaoPagamentoTexto` direto no `CriarPedidoAvulsoRequest`, design.md do back - Decisão 1). Na Cotação e na resposta do representante, o combobox só oferece as opções existentes — sem criar ad-hoc ali (mantém o catálogo como fonte única nesses dois pontos, que são os que mais se beneficiam de consistência).

### Decisão 3: campos do representante ficam numa seção própria, fora dos cards de item

Como valem pra resposta inteira (não por item), entram como uma seção compacta acima da lista de itens roláveis — não dentro do card de nenhum item, e não na barra fixa inferior (que já está cheia: título, saudação, prazo, botão finalizar, progresso). Autosave com o mesmo padrão de debounce dos preços (não salva a cada tecla).

### Decisão 4: nav — "Pedido avulso" some do menu "Mais", vira "Pedidos"

`BottomNavBar.tsx`: o item `{ to: '/admin/pedidos-avulsos/novo', label: 'Pedido avulso', ... }` em `ITENS_MAIS` é substituído por `{ to: '/admin/pedidos', label: 'Pedidos', ... }`. A rota `/admin/pedidos-avulsos/novo` continua existindo (link "Novo pedido" de dentro da aba Pedidos, e alcançável diretamente por URL) — só o atalho direto no menu principal muda de destino.

## Risks / Trade-offs

- **Duas fontes de "resumo de pedido"** (o endpoint agregado novo e o `GET /api/cotacoes/{id}/resultado` existente) precisam ficar visualmente consistentes — mitigado pelo componente compartilhado (Decisão 1), mas é um ponto de atenção se um dos dois DTOs divergir no futuro.
- **Combobox com texto livre no avulso** pode gerar variações de grafia ("10 dias", "10 dias direto") que o catálogo não captura — aceito conscientemente (é uma anotação de ligação telefônica, não dado estruturado — mesmo trade-off já aceito no back).
