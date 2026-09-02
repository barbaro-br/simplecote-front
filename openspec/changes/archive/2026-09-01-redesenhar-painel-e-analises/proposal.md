## Why

O dashboard do painel (`/admin`) está quebrado contra o backend real: o `dashboardSchema` foi escrito contra um contrato fictício (campos aninhados e `variacaoPct` que não existem), então `GET /api/analises/dashboard` falha validação, o `PainelDashboard` cai em `null` e a tela dá um "salto". Além disso, o painel é uma grade plana de números sem hierarquia — e o back já oferece endpoints de análise (`/compras`, insights) que o front não aproveita numa superfície de análise dedicada.

## What Changes

- **Corrigir o contrato do dashboard**: reescrever `dashboardSchema` para o `DashboardDTO` real (`porStatus` fixo `{rascunho,aberta,encerrada,apurada,cancelada}`, `encerradasSemApurar` e `apuradasSemPedidoEnviado` soltos, `gastoMes`/`gastoMesAnterior`/`economiaEstimada90d` soltos como `number`, `proximosPrazos[].cotacaoId`, `top*.valor` como `number`). Remover o `variacaoPct` (não existe no back).
- **Redesenhar o cabeçalho como "monitor"**: hero de economia, faixa acionável de "precisa de ação", pipeline de status, gastos mês a mês, top 5 em barras e empty state que guia. Tudo lendo o novo contrato.
- **Nova aba "Análises"** (`/admin/analises`): seletor de período + ranking de gasto por empresa, item mais/menos comprado e últimos preços por produto, sobre `GET /api/analises/compras?de=&ate=` (que o back já implementa).

## Capabilities

### New Capabilities

- `admin/analises`: aba de análise de compras com seletor de período, ranking por Empresa, item mais/menos comprado e últimos preços por produto, lendo `GET /api/analises/compras`.

### Modified Capabilities

- `admin/painel-insights`: o cabeçalho de dashboard passa a ler o contrato real de `GET /api/analises/dashboard` e a ser um "monitor" (hero de economia + ação + pipeline + top 5 em barras + empty state).

## Impact

- **Código front:** `src/admin/analise/analise.schema.ts` (novo `dashboardSchema` + schema de `/compras`), `src/admin/analise/analise.api.ts` (novas chamadas), `src/admin/analise/PainelDashboard.tsx` (redesign), novos componentes da aba Análises, `src/routes.tsx` e `src/admin/layout/AdminLayout.tsx` (rota + item de menu).
- **Testes:** mocks MSW passam a refletir o contrato real; testes do dashboard e da nova aba.
- **Sem mudança no backend** nesta change. As agregações novas (ticket médio, itens por cotação, séries temporais) ficam para uma change separada no `simplecote-back`.
- **Remover** a instrumentação temporária de debug em `main.tsx` e o log de `route-transition.tsx` adicionados durante a investigação.
