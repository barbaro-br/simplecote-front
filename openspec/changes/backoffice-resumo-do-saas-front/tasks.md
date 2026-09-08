## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `GET /api/admin/resumo` (`ResumoSaasResponse`: lojas por estado, lojasAtivas30d, cotacoesNoMes, gmvTotal, cadastros30d, funil) — change `backoffice-resumo-do-saas`

## 1. API e schema

- [x] 1.1 `backoffice.schema.ts`: `ResumoSaas` + sub-tipos (`LojasResumo`, `PontoSerie`, `FunilAtivacao`)
- [x] 1.2 `backoffice.api.ts`: `useResumoSaas()` → `GET /api/admin/resumo`

## 2. Dashboard

- [x] 2.1 `ResumoPage.tsx`: cards de KPI — lojas (total + mini-badges por estado), lojas ativas 30d, cotações no mês, GMV total (moeda). Reusa `formatarMoeda`/`formatarData` de `shared/format`
- [x] 2.2 Mini-gráfico de cadastros dos últimos 30 dias — barras em CSS/SVG inline, sem lib; tooltip simples no hover (título nativo basta)
- [x] 2.3 Funil de ativação — 4 barras proporcionais (cadastraram / verificaram / criaramCotacao / apuraram) com rótulo e valor
- [x] 2.4 Estados carregando / erro (reusa o padrão das outras telas do backoffice)

## 3. Rotas e layout

- [x] 3.1 `routes.tsx`: `index` → `ResumoPage`; nova rota `path: 'lojas'` → `CompradoresPage`; `compradores/:id` mantém
- [x] 3.2 `BackofficeLayout.tsx`: navegação "Resumo" (`/backoffice`) e "Lojas" (`/backoffice/lojas`); marca a ativa
- [x] 3.3 Ajustar qualquer link "voltar para a lista" no detalhe/`CompradoresPage` para `/backoffice/lojas`

## 4. Testes

- [x] 4.1 `backoffice.test.tsx`: dashboard renderiza os KPIs do mock e o link "Ver todas as lojas" leva a `/backoffice/lojas`
- [x] 4.2 `backoffice.test.tsx`: `/backoffice/lojas` renderiza a lista (o teste atual da lista passa a montar nessa rota)

## 5. Checagem de saúde

- [x] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: abrir `/backoffice`, conferir os números contra o banco; navegar para "Lojas" e voltar — **pendente**: o back `backoffice-resumo-do-saas` ainda não está no ar
