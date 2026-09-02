## Context

Hoje `/admin` renderiza `CotacoesPage`, que embute o `PainelDashboard` no topo e mantém o filtro de status em estado local (`useState`). O usuário quer o dashboard como landing (`/admin`) e a lista em `/admin/cotacoes`, com filtro de status endereçável por URL. Motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Dashboard como página inicial; cotações como aba própria.
- Filtro de status deep-linkável (URL).

**Non-Goals:**
- Não mudar o contrato do dashboard nem o `PainelDashboard` em si (só onde ele é hospedado).
- Não mover a busca por título para a URL (permanece local).

## Decisions

### D1 — Nova rota index + rota `cotacoes`
`routes.tsx`: `path: ''` (index de `/admin`) → `DashboardPage`; adicionar `path: 'cotacoes'` → `CotacoesPage`. As rotas `cotacoes/nova`, `cotacoes/:id` e `cotacoes/:id/resultado` permanecem inalteradas.

### D2 — `DashboardPage` reusa o `PainelDashboard`
`PainelDashboard` mantém a prop `onStatusClick(status)`; o `DashboardPage` passa uma função que navega para `/admin/cotacoes?status=${status}`. Nenhuma mudança no componente do dashboard.

### D3 — Filtro de status via `useSearchParams`
`CotacoesPage` lê `status` de `useSearchParams`; as pills do filtro escrevem/removem o parâmetro. Valor ausente ou fora de `StatusCotacao` → `TODOS`. A busca (`busca`) continua em `useState`.

## Risks / Trade-offs

- **[R1] Menus/rotas que apontavam para `/admin`** → conferir `AdminLayout` (item "Cotações") e qualquer `Link to="/admin"`; atualizar os consumidores.
- **[R2] Teste do `CotacoesPage` dependia do dashboard** → remover/reescrever esses casos.

## Migration Plan

- Sem migração de dados/API. Rollback: reverter o working tree.
