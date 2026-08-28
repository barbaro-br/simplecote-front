## 1. Consolidar `cn`

- [x] 1.1 Criar `src/shared/lib/utils.ts` com `export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }` (importando de `clsx` e `tailwind-merge`). Verificar: compila.
- [x] 1.2 `src/shared/components/ui/button.tsx`: remover a definição/reexport de `cn`; `import { cn } from "@/shared/lib/utils"`. `src/shared/components/ui/input.tsx`: trocar `import { cn } from "./button"` por `import { cn } from "@/shared/lib/utils"`. Verificar: `npx tsc -b` sem erro e `npx vitest run` verde.

## 2. Remover a pasta `./@/` e boilerplate morto

- [x] 2.1 `grep -rn "@/components\|@/lib/utils\|@/hooks" src` não retorna nada (nenhum import depende de `./@/`). Se retornar, reapontar para `@/shared/...` antes de apagar.
- [x] 2.2 Apagar `./@/` inteiro (raiz do repo), `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`. Verificar: `npx tsc -b` sai 0, `npx vitest run` verde, `npm run build` completa.

## 3. Alinhar `components.json`

- [x] 3.1 Em `components.json`, ajustar `aliases` para `components: "@/shared/components"`, `ui: "@/shared/components/ui"`, `utils: "@/shared/lib/utils"`, `lib: "@/shared/lib"`, `hooks: "@/shared/hooks"`. Verificar: os caminhos batem com a árvore real (`ui` e `lib` existem após a etapa 1); `npm run build` ok.

## 4. Config de ambiente

- [x] 4.1 Criar `.env.example` com `VITE_API_BASE_URL=http://localhost:8080` (comentário citando spec §6) e, se o fluxo local precisar, `.env.development` com o mesmo valor. Verificar: `git check-ignore .env.example` não retorna nada (será versionado); `npm run dev` sobe consumindo a var.
- [x] 4.2 Atualizar `README.md`: substituir o texto boilerplate do template por instruções mínimas do projeto (scripts `dev`/`test`/`build`, cópia de `.env.example` → `.env.development`). Verificar: README menciona `.env.example` e os scripts reais.

## 5. Padronizar MSW nos testes de página

- [x] 5.1 `src/admin/empresas/empresas.test.tsx` e `src/admin/produtos/produtos.test.tsx`: remover o `setupServer(...)` local e os `beforeAll/afterEach/afterAll` do arquivo; importar `{ server }` de `src/setupTests` e registrar os handlers via `server.use(...)` (por teste ou num `beforeEach`). Handlers e asserts inalterados. Verificar: `npx vitest run src/admin/empresas src/admin/produtos` verde e nenhum `setupServer` restante nesses dois arquivos (`grep -L setupServer`).
- [x] 5.2 Mover `src/msw.test.ts` para `src/shared/test/msw-smoke.test.ts`, ajustando o import de `./setupTests` para `../../setupTests`. Verificar: `npx vitest run src/shared/test/msw-smoke.test.ts` verde.

## 6. Fechamento

- [x] 6.1 `npx vitest run` verde (mesma contagem de testes de antes), `npx tsc -b` sai 0, `npm run build` gera `dist/`.
- [x] 6.2 `grep -rn "App.css\|assets/react.svg\|assets/vite.svg\|from '@/components\|from \"@/components" src` não retorna nada. Pasta `./@/` não existe mais.
- [x] 6.3 `openspec validate limpar-scaffold-shadcn` sem erros.
