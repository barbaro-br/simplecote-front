## Why

Hoje ver os pedidos de uma Cotação exige entrar na Cotação específica (3 cliques, só funciona depois de `PEDIDOS_GERADOS`) e não existe visão nenhuma que junte todos os pedidos do lojista (apurados + avulsos) num lugar só. Além disso, condição de pagamento e prazo de entrega — hoje combinados por telefone/WhatsApp fora do sistema — não têm nenhum campo pra registrar. Este change consome o back já desenhado em `aba-pedidos-e-condicao-pagamento` (`simplecote-back`).

## What Changes

- Nova aba "Pedidos" (`/admin/pedidos`), substituindo o atalho "Pedido avulso" do menu "Mais": lista os pedidos agrupados por Cotação (mais os avulsos à parte), mostrando de cada um — antes de abrir — valor total, quantidade de itens, condição de pagamento e prazo de entrega. Tem um botão "Novo pedido" que abre a tela de pedido avulso já existente. Não substitui a visão de dentro da Cotação (`ResultadoPage`) — só complementa.
- Nova tela de catálogo de condições de pagamento (`admin/condicoes-pagamento`), mesmo padrão de Empresas: cadastrar, listar, inativar/reativar.
- Criação de Cotação ganha campo opcional "Condição de pagamento preferencial".
- Resultado da apuração (`ResultadoPage`) passa a mostrar a condição de pagamento e o prazo de entrega do Representante vencedor em cada linha de pedido.
- Tela do representante (`/cotacao/:token`) ganha uma seção para escolher a condição de pagamento (do catálogo da loja) e digitar o prazo de entrega estimado (texto livre) — vale pra resposta inteira, não por item.
- Pedido avulso (`NovoPedidoAvulsoPage`) ganha os mesmos dois campos: condição de pagamento (escolher do catálogo ou digitar uma nova) e prazo de entrega.

## Capabilities

### New Capabilities
- `admin/pedidos`: aba agregada de Pedidos (apurados agrupados por Cotação + avulsos), consumindo `GET /api/pedidos`.
- `admin/condicoes-pagamento`: CRUD do catálogo de condições de pagamento por loja.

### Modified Capabilities
- `admin/cotacoes`: "Criar e duplicar Cotação" ganha o campo de condição de pagamento preferencial; "Resultado da apuração e pedidos" passa a mostrar condição de pagamento e prazo de entrega por pedido.
- `admin/pedidos-avulsos`: formulário ganha os dois campos novos.
- `representante/cotacao`: nova seção para escolher condição de pagamento e informar prazo de entrega.

## Impact

- **Front**: rota `/admin/pedidos` nova + `PedidosPage.tsx`; `admin/condicoes-pagamento/` novo (mesmo formato de `admin/empresas/`); `BottomNavBar.tsx` (remove o atalho "Pedido avulso", adiciona "Pedidos"); `CotacoesPage.tsx`/formulário de Nova Cotação (campo novo); `ResultadoPage.tsx` (exibição dos dois campos por pedido); `CotacaoPorTokenPage.tsx`/`LinhaPreco.tsx`-adjacente (nova seção, não é por item — fica fora do card do item); `NovoPedidoAvulsoPage.tsx` (dois campos novos no formulário).
- **Depende de**: `aba-pedidos-e-condicao-pagamento` (`simplecote-back`) em produção antes desta change entrar em uso real — os endpoints/campos novos precisam existir.
- **Sem breaking change**: campos novos são opcionais; loja que nunca cadastra condição de pagamento não vê diferença de comportamento em nenhuma tela existente, só a aba nova.
