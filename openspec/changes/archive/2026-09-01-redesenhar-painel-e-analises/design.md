## Context

O `PainelDashboard` lê `GET /api/analises/dashboard` com um `dashboardSchema` construído contra um contrato errado (campos aninhados + `variacaoPct` inexistente), então a validação zod falha e o painel cai em `null` (o "salto"). O back (`simplecote-back`) já expõe `GET /api/analises/dashboard` (`DashboardDTO`), `GET /api/analises/compras?de=&ate=` (`AnaliseComprasDTO`), `/produtos/insight` e `/empresas/{id}/insight`. Motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Dashboard com o contrato real, sem falha de validação.
- Painel vira um "monitor" com hierarquia (hero + ação + pipeline + barras).
- Nova aba `/admin/analises` explorando `GET /compras`.

**Non-Goals:**
- Não recalcular derivados no front (sem `variacaoPct`, sem ticket médio — ficam pro back).
- Não mexer nos hover-cards de insight de produto/empresa (já existem e funcionam).
- Não alterar o backend nesta change.

## Decisions

### D1 — Contrato real no schema
Reescrever `dashboardSchema` para o `DashboardDTO` (campos soltos, `porStatus` fixo, `number` em vez de `string`), e criar `analiseComprasSchema` para o `AnaliseComprasDTO` (`totais[]`, `itemMaisComprado`/`itemMenosComprado` nulos, `ultimosPrecos[]`). `BigDecimal` → `z.number()` (serialização padrão do Jackson é número; regra AGENTS.md §4.2: preço é number).

### D2 — Monitor com hierarquia (sem variacaoPct)
Reorganizar o `PainelDashboard` em: hero (`economiaEstimada90d`), faixa de ação (`encerradasSemApurar` + `apuradasSemPedidoEnviado` → filtro), próximos prazos (`cotacaoId`), gastos (`gastoMes`/`gastoMesAnterior`), pipeline de status (`porStatus` → barra segmentada) e top 5 em barras. O `variacaoPct` é **removido** (não existe no back; re-adicionar quando o back fornecer).

### D3 — Aba Análises sobre `GET /compras`
Nova rota `/admin/analises` + item de menu. Seletor de período com presets (7/30/90 dias, este mês) calculados no cliente (`de`/`ate` como `YYYY-MM-DD` — só data de filtro, não regra de negócio). Componentes: KPI de total gasto, ranking de Empresas (barras), item mais/menos comprado, tabela de últimos preços. Recharts onde fizer sentido; caso contrário, barras em CSS.

### D4 — Cores semânticas
Economia (`economiaEstimada90d`) usa `success`; valores e rankings usam tokens do tema, sem cor fixa. `tabular-nums` em todo número.

### D5 — Estado de falha do monitor preservado
Manter o comportamento atual: se o dashboard falhar, o monitor desaparece (não derruba a lista). A aba Análises mostra erro discreto e permanece navegável.

## Risks / Trade-offs

- **[R1] `BigDecimal` vir `number` pode perder precisão em valores grandes** → valores de gasto ficam abaixo de centenas de milhares; `number` (double) é seguro e o `moeda()` já formata 2 casas.
- **[R2] Pipeline de status precisa de cores por status** → reutilizar os tokens do `StatusBadge` (`primary`/`warning`/`success`/`destructive`/`muted`) para consistência.
- **[R3] Testes MSW mentem o contrato** → atualizar os mocks para o shape real (senão a mudança não é validada de verdade).

## Migration Plan

- Sem migração de dados/API. Rollback: reverter o working tree; o painel volta a cair em `null` (bug atual) até a correção ser reaplicada.
