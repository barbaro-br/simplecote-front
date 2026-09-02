## 1. Contrato do dashboard (correção)

- [x] 1.1 Reescrever `dashboardSchema` em `analise.schema.ts` para o `DashboardDTO` real (`porStatus` fixo `{rascunho,aberta,encerrada,apurada,cancelada}`, `encerradasSemApurar`/`apuradasSemPedidoEnviado` soltos, `gastoMes`/`gastoMesAnterior`/`economiaEstimada90d` soltos `number`, `proximosPrazos[].cotacaoId`, `topProdutos`/`topEmpresas` com `valor: number`). Remover `variacaoPct`. Verificar: `npm run build` verde.
- [x] 1.2 Adicionar `analiseComprasSchema` para `AnaliseComprasDTO` (`periodo`, `totais[]`, `itemMaisComprado`/`itemMenosComprado` nulos, `ultimosPrecos[]`) e a função `buscarCompras(de, ate)` em `analise.api.ts`. Verificar: `npm run build` verde.
- [x] 1.3 Atualizar os mocks MSW dos testes (dashboard e novos) para o shape real do backend. Verificar: `npm test` verde.

## 2. Monitor (redesign do PainelDashboard)

- [x] 2.1 Reorganizar `PainelDashboard.tsx` para ler o novo contrato: hero de economia (`economiaEstimada90d`), gastos (`gastoMes`/`gastoMesAnterior`), próximos prazos (`cotacaoId`) e top 5 (`valor` numérico). Verificar: teste do `PainelDashboard` verde.
- [x] 2.2 Substituir a "Visão geral" em texto por um pipeline de status segmentado usando `porStatus` (rascunho/aberta/encerrada/apurada/cancelada), com rótulos pt-BR e tokens de cor do `StatusBadge`. Verificar: teste + `npm run lint`.
- [x] 2.3 Faixa "precisa de ação" com CTA acionável para `encerradasSemApurar` e `apuradasSemPedidoEnviado` (mantém `onStatusClick`), e top 5 em barras proporcionais. Verificar: teste do dashboard.
- [x] 2.4 Empty state orientando a criar a primeira cotação quando tudo vier zero. Verificar: teste do estado vazio.

## 3. Aba Análises (`/admin/analises`)

- [x] 3.1 Nova rota `/admin/analises` + item "Análises" na sidebar (`AdminLayout`/`routes.tsx`). Verificar: `npm run build` e navegação no teste.
- [x] 3.2 Componente de seletor de período (7/30/90 dias, este mês, custom) que gera `de`/`ate` (`YYYY-MM-DD`) e dispara `buscarCompras`. Verificar: teste de troca de período.
- [x] 3.3 `AnálisesPage` com: KPI de total gasto (soma de `totais`), ranking de gasto por Empresa (barras), item mais/menos comprado e tabela de últimos preços (`ultimosPrecos`) formatados pt-BR. Verificar: testes da página (dados, vazio, erro).

## 4. Limpeza e verificação final

- [x] 4.1 Remover a instrumentação temporária de debug de `main.tsx` e o log `[route]` de `route-transition.tsx`. Verificar: `npm run lint`.
- [x] 4.2 Rodar `npm run build`, `npm test` e `npm run lint` e confirmar os três verdes (regra AGENTS.md §3).
