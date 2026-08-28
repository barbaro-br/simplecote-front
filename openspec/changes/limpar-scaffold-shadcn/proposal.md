## Why

O `shadcn init` gravou componentes usando o alias `@` como caminho de disco: existe uma pasta literal `./@/` na raiz do repo, paralela a `src/`. Isso deixou o `Button` e a função `cn` duplicados e desalinhados, `components.json` apontando para caminhos que não existem, e mais um punhado de boilerplate morto do template Vite. Nada disso quebra o runtime hoje, mas confunde qualquer um que abra o projeto e faz o próximo `shadcn add` cair no lugar errado.

## What Changes

- **Apagar a pasta `./@/`** da raiz (`@/components/ui/button.tsx`, `@/lib/utils.ts`) — é código gerado que nunca foi importado (o app usa `@/shared/components/ui/*`).
- **Consolidar `cn`** num único módulo (`src/shared/lib/utils.ts`); `src/shared/components/ui/button.tsx` para de exportar `cn` e passa a importá-lo; `src/shared/components/ui/input.tsx` importa `cn` de lá em vez de `"./button"`.
- **Alinhar `components.json`** com a árvore real (`aliases` apontando para `@/shared/components`, `@/shared/components/ui`, `@/shared/lib/utils`, `@/shared/hooks`) para que `npx shadcn add <x>` futuro caia em `src/shared/components/ui/`.
- **Remover boilerplate morto**: `src/App.css` (184 linhas, não importado), `src/assets/react.svg`, `src/assets/vite.svg`.
- **Adicionar `.env.example`** com `VITE_API_BASE_URL=http://localhost:8080` (spec §6) e documentá-lo no README; adicionar `.env.development` se necessário para o fluxo local.
- **Padronizar os testes de página no MSW compartilhado**: `admin/empresas/empresas.test.tsx` e `admin/produtos/produtos.test.tsx` passam a usar o `server` de `src/setupTests.ts` (`server.use(...)` por caso), como já faz `src/shared/api/api-client.test.ts`, em vez de subir um `setupServer` próprio.
- Mover `src/msw.test.ts` (smoke test de scaffolding) para `src/shared/test/` e renomear para deixar claro que não é teste de feature.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Reorganização de scaffolding, deduplicação e limpeza — sem mudança de comportamento observável: os mesmos componentes renderizam o mesmo HTML, os mesmos testes cobrem os mesmos caminhos. `.openspec.yaml` declara `skip_specs: true`.

## Impact

- Remoção: `./@/` (pasta inteira), `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`.
- Novo: `src/shared/lib/utils.ts`, `.env.example`, `src/shared/test/msw-smoke.test.ts` (movido).
- Edição: `src/shared/components/ui/button.tsx`, `src/shared/components/ui/input.tsx`, `components.json`, `README.md`, `src/admin/empresas/empresas.test.tsx`, `src/admin/produtos/produtos.test.tsx`.
- Verificação: `npx vitest run` verde, `npx tsc -b` 0, `npm run build` ok, nenhuma referência pendente a `./@/` ou a `App.css`.
