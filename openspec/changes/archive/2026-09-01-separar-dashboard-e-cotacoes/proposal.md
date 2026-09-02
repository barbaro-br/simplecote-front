## Why

Hoje o monitor (dashboard) e a lista de cotações vivem juntos em `/admin`. O usuário quer o dashboard como **página inicial** (`/admin`) e as cotações numa aba própria (`/admin/cotacoes`), com filtros melhorados que possam ser acessados por link direto a partir do dashboard (ex.: clicar em "encerradas sem apurar" leva à lista já filtrada).

## What Changes

- Nova página **Dashboard** em `/admin` (landing), renderizando o `PainelDashboard`; as ações "precisa de ação" e o pipeline passam a **navegar** para `/admin/cotacoes?status=<STATUS>`.
- A lista de cotações passa a viver em `/admin/cotacoes` (sem o dashboard no topo).
- Menu ganha o item **"Dashboard"** (`/admin`) e **"Cotações"** passa a apontar para `/admin/cotacoes`.
- Filtro de status da lista vira **URL-driven** (`?status=`), permitindo deep-link; a busca por título permanece local.

## Capabilities

### New Capabilities

<!-- Nenhuma capability nova. -->

### Modified Capabilities

- `admin/painel-insights`: o dashboard deixa de ser uma faixa acima da lista e vira a página inicial `/admin`; seus atalhos navegam para a lista filtrada.
- `admin/cotacoes`: a lista de cotações fica em `/admin/cotacoes` e o filtro por status passa a ser refletido na URL (`?status=`).

## Impact

- **Código front:** novo `src/admin/analise/DashboardPage.tsx`; `src/routes.tsx` (rota index → Dashboard, nova rota `cotacoes`); `src/admin/layout/AdminLayout.tsx` (item de menu); `src/admin/cotacoes/CotacoesPage.tsx` (remove o dashboard, filtro via `useSearchParams`).
- **Testes:** `AdminLayout.test.tsx`, `CotacoesPage.test.tsx` (remove o caso do dashboard, cobre filtro por URL), novo `DashboardPage.test.tsx`.
- **Sem mudança** de contrato de API ou de backend.
