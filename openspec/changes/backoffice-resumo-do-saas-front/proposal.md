## Why

Par do back `backoffice-resumo-do-saas`: hoje o `/backoffice` abre direto na lista plana de lojas. O `SUPER_ADMIN` não tem um painel de conjunto — quantas lojas, quantas ativas, cotações no mês, GMV, cadastros recentes, funil de ativação.

## What Changes

- **`/backoffice` (index)** passa a ser um **dashboard**: cards de KPI (lojas por estado, lojas ativas 30d, cotações no mês, GMV total), um mini-gráfico de cadastros dos últimos 30 dias, e o funil de ativação (cadastrou → verificou → 1ª cotação → apurou) como barras.
- **A lista de lojas move** para `/backoffice/lojas` (`CompradoresPage` inalterada, só troca a rota). O dashboard tem um link "Ver todas as lojas".
- `BackofficeLayout` ganha navegação entre "Resumo" e "Lojas".
- **Não** muda o guard, o modo suporte, nem `/backoffice/compradores/:id`.

## Capabilities

### Modified Capabilities

- `backoffice`: a entrada do backoffice passa a ser um painel com KPIs do SaaS (lojas, atividade, cotações do mês, GMV, cadastros recentes, funil); a listagem de lojas ganha rota própria.

## Impact

- `src/backoffice/backoffice.api.ts`: `useResumoSaas()` → `GET /api/admin/resumo`.
- `src/backoffice/backoffice.schema.ts`: `ResumoSaas` (lojas, lojasAtivas30d, cotacoesNoMes, gmvTotal, cadastros30d, funil).
- `src/backoffice/ResumoPage.tsx` (novo): cards + mini-gráfico (SVG/CSS simples, sem lib) + funil; estados carregando/erro.
- `src/routes.tsx`: `index` → `ResumoPage`; nova rota `lojas` → `CompradoresPage`; `/backoffice/compradores/:id` mantém.
- `src/backoffice/BackofficeLayout.tsx`: nav "Resumo" / "Lojas".
- `src/backoffice/CompradoresPage.tsx`: só ajustar links internos que apontam para `/backoffice` (voltar) → `/backoffice/lojas` se necessário.
- Testes: `backoffice.test.tsx` — dashboard mostra os KPIs (mock do resumo) e o link para a lista; `/backoffice/lojas` renderiza a lista.
- Sem dependência nova. Seção 0 = o back (`backoffice-resumo-do-saas`).
