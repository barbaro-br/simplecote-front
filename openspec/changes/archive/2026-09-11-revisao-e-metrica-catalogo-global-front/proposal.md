## Why

O back implementou revisão manual e métrica de uso do catálogo global (change `revisao-e-metrica-catalogo-global` em `simplecote-back`), com endpoints em `/api/admin/catalogo-global`. Sem tela, essas duas lacunas ficam sem jeito de usar de verdade: um analista não tem onde ver/corrigir uma entrada errada, e ninguém enxerga a métrica de reaproveitamento.

## What Changes

- Nova tela no backoffice, **Catálogo Global** (`/backoffice/catalogo-global`, nav própria): métricas no topo (produtos no catálogo, reaproveitamentos, lojas que reaproveitaram, aguardando revisão), depois lista paginada e ordenada da mais recente pra mais antiga, com busca por nome/código e filtro "só não revisados". Cada linha tem "Editar" (corrige nome/marca inline) e "Marcar revisado" (some quando já revisado, vira um selo).
- O **Resumo do SaaS** ganha uma seção com as mesmas 4 métricas e um link "Ver e revisar →" pra tela nova — visibilidade sem precisar navegar pra saber se tem algo pra revisar.

## Capabilities

### Modified Capabilities

- `backoffice`: nova tela de catálogo global (lista/revisão/métrica) e seção de métrica no Resumo.

## Impact

- `src/backoffice/backoffice.schema.ts`: `catalogoGlobalItemSchema`, `paginaCatalogoGlobalSchema`, `metricasCatalogoGlobalSchema`.
- `src/backoffice/backoffice.api.ts`: `useCatalogoGlobal` (paginado, busca, filtro), `useMetricasCatalogoGlobal`, `useCorrigirCatalogoGlobal`, `useMarcarRevisadoCatalogoGlobal`.
- `src/backoffice/CatalogoGlobalPage.tsx` (nova): métricas + tabela paginada com busca/filtro/edição inline/revisão.
- `src/backoffice/ResumoPage.tsx`: seção nova com as métricas + link pra tela de catálogo global.
- `src/backoffice/BackofficeLayout.tsx` + `src/routes.tsx`: nav e rota `/backoffice/catalogo-global`.
- Testes em `backoffice.test.tsx`: métricas e lista aparecem; editar chama `PUT`; marcar revisado chama `POST /revisar`; item já revisado mostra selo em vez do botão; busca manda o termo pra API. `ResumoPage` ganhou mock do endpoint de métricas nos testes existentes (a seção nova busca isso ao montar).
- Sem dependência nova.
- Contrato com o `simplecote-back`: `GET /api/admin/catalogo-global` (paginado), `GET /api/admin/catalogo-global/metricas`, `PUT /api/admin/catalogo-global/{id}`, `POST /api/admin/catalogo-global/{id}/revisar` — todos já implementados e em produção (change `revisao-e-metrica-catalogo-global`).
