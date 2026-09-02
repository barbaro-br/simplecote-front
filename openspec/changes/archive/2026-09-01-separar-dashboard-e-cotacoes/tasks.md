## 1. Dashboard como página inicial

- [x] 1.1 Criar `src/admin/analise/DashboardPage.tsx` que renderiza `<PainelDashboard onStatusClick={(s) => navigate(`/admin/cotacoes?status=${s}`)} />` com um cabeçalho. Verificar: `npm run build` verde.
- [x] 1.2 Em `routes.tsx`, apontar a rota index de `/admin` para `DashboardPage` e adicionar a rota `cotacoes` → `CotacoesPage`. Verificar: `npm run build` verde.
- [x] 1.3 Em `AdminLayout.tsx`, adicionar o item "Dashboard" (`/admin`, `end:true`) e trocar "Cotações" para `/admin/cotacoes`. Verificar: `npm run build` verde.

## 2. Lista de cotações em `/admin/cotacoes` com filtro por URL

- [x] 2.1 Em `CotacoesPage.tsx`, remover o `PainelDashboard` (import + uso) e passar a ler o filtro de `status` via `useSearchParams` (ausente/inválido → TODOS). Verificar: `npm run build` verde.
- [x] 2.2 As pills do filtro escrevem/removem o parâmetro `status` na URL; a busca por título permanece em estado local. Verificar: `npm run lint` verde.

## 3. Testes

- [x] 3.1 Atualizar `AdminLayout.test.tsx` para o novo menu (Dashboard + Cotações → `/admin/cotacoes`). Verificar: teste verde.
- [x] 3.2 Atualizar `CotacoesPage.test.tsx`: remover os casos que dependiam do dashboard e cobrir o filtro por URL (`?status=`). Verificar: teste verde.
- [x] 3.3 Criar `DashboardPage.test.tsx` (renderiza o monitor e o atalho navega para a lista filtrada). Verificar: teste verde.

## 4. Verificação final

- [x] 4.1 Rodar `npm run build`, `npm test` e `npm run lint` e confirmar os três verdes (regra AGENTS.md §3).
