## 1. API e schemas

- [x] 1.1 `backoffice.schema.ts`: `catalogoGlobalItemSchema`, `paginaCatalogoGlobalSchema`, `metricasCatalogoGlobalSchema`
- [x] 1.2 `backoffice.api.ts`: `useCatalogoGlobal`, `useMetricasCatalogoGlobal`, `useCorrigirCatalogoGlobal`, `useMarcarRevisadoCatalogoGlobal`

## 2. Tela de Catálogo Global

- [x] 2.1 `CatalogoGlobalPage.tsx`: cards de métrica no topo
- [x] 2.2 Tabela paginada (busca com debounce, filtro "só não revisados", ordenado do mais novo — já vem assim do back)
- [x] 2.3 Editar inline (nome/marca) e "Marcar revisado" (vira selo quando já revisado)
- [x] 2.4 Nav (`BackofficeLayout.tsx`) e rota (`routes.tsx`)

## 3. Resumo do SaaS

- [x] 3.1 Seção com as 4 métricas + link "Ver e revisar →" pra `/backoffice/catalogo-global`

## 4. Testes

- [x] 4.1 Métricas e lista aparecem; item revisado mostra selo em vez do botão
- [x] 4.2 Editar chama `PUT` com nome/marca corretos; "Marcar revisado" chama `POST /revisar`
- [x] 4.3 Busca manda o termo (`q`) pra API
- [x] 4.4 Mock do endpoint de métricas nos testes existentes de `ResumoPage` (a seção nova busca isso ao montar)
- [x] 4.5 `npx tsc --noEmit`, `oxlint`, `vitest run` (suíte completa) verdes
