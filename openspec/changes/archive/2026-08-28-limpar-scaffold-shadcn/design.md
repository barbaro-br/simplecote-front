## Context

Ver `proposal.md` — Why. Estado atual:

- Raiz do repo tem `./@/components/ui/button.tsx` (usa `@base-ui/react` + `class-variance-authority`, importa `@/lib/utils`) e `./@/lib/utils.ts` (`cn`). Nenhum arquivo de `src/` importa desses caminhos.
- `src/shared/components/ui/button.tsx` — `Button` hand-rolled (variantes via objeto `clsx`), e **também exporta `cn`**.
- `src/shared/components/ui/input.tsx` — `import { cn } from "./button"`.
- App importa `Button`/`Input` de `@/shared/components/ui/*` (`EmpresasPage`, `ProdutosPage`, `EmpresaForm`, `ProdutoForm`, `LoginPage` usa `<input>` puro).
- Alias `@` → `src/` em `tsconfig.app.json` (`paths`), `vite.config.ts` e `vitest.config.ts`.
- `components.json`: `aliases.components = "@/components"`, `utils = "@/lib/utils"`, `ui = "@/components/ui"`, `lib = "@/lib"`, `hooks = "@/hooks"` → com `@`→`src`, resolvem para `src/components/ui`, `src/lib/utils` (inexistentes). Foi isso que levou o `init` a gravar a pasta literal `./@/`.
- `spec.md` §5 desenha a árvore com `shared/components/` — não `components/` na raiz de `src/`.
- `src/App.css` existe (184 linhas) mas `App.tsx` não o importa; `src/assets/react.svg`, `vite.svg` não referenciados.
- `.gitignore` já cobre `dist`, `node_modules`, `*.local`, `.env` **não** está listado explicitamente (mas `*.local` sim) — conferir antes de commitar `.env.example`.

## Goals / Non-Goals

**Goals:**
- Uma única definição de `cn` e um único `Button`.
- `components.json` que reflete a árvore real, para `shadcn add` futuro cair certo.
- Repo sem a pasta `./@/` e sem boilerplate morto.
- `.env.example` documentando a config exigida pela spec §6.

**Non-Goals:**
- Trocar o `Button`/`Input` hand-rolled pelos gerados via `shadcn` agora (funcionam e estão fiados). Quando uma tela precisar de um componente shadcn de verdade, `shadcn add` o gera no lugar já corrigido.
- Remover `@base-ui/react`/`class-variance-authority` do `package.json` (a spec §3 pede shadcn/ui, que os usa).
- Qualquer mudança visual ou de comportamento.

## Decisions

### 1. Home dos componentes de UI: `src/shared/components/ui/` (alinha com spec §5)
Manter onde já está e onde o app já importa. `components.json.aliases` passa a:
`components: "@/shared/components"`, `ui: "@/shared/components/ui"`, `utils: "@/shared/lib/utils"`, `lib: "@/shared/lib"`, `hooks: "@/shared/hooks"`.

- Alternativa — adotar o default do shadcn (`src/components/ui`, `src/lib/utils`) e migrar os imports em ~6 arquivos: mais churn e contraria a árvore da `spec.md` §5.

### 2. `cn` em `src/shared/lib/utils.ts`
Novo módulo com a implementação canônica (`twMerge(clsx(inputs))`). `button.tsx` e `input.tsx` passam a `import { cn } from "@/shared/lib/utils"`. `button.tsx` deixa de reexportar `cn`.

- `shared/lib/` é uma adição mínima à árvore da §5 (que hoje tem `shared/api|components|hooks|format`); é o alvo natural do alias `utils`/`lib` do `components.json`.
- Alternativa — `src/shared/components/ui/utils.ts`: prende um util genérico dentro de `ui/`.

### 3. Apagar `./@/` inteiro
Inclui o `Button` base-ui+cva não usado. Some sem substituto; a re-geração futura via `shadcn add` usará o `components.json` já corrigido.

### 4. MSW compartilhado nos testes de página
`empresas.test.tsx` e `produtos.test.tsx`: remover o `setupServer(...)` local e os `beforeAll/afterEach/afterAll` próprios; importar `{ server } from '@/setupTests'` (ou caminho relativo) e declarar os handlers com `server.use(http.get(...), http.post(...))` dentro de cada teste (ou num `beforeEach` do arquivo). Padrão idêntico ao de `api-client.test.ts`. Os handlers e asserts não mudam.

### 5. `msw.test.ts` → `src/shared/test/msw-smoke.test.ts`
É um teste de fumaça do scaffolding ("MSW intercepta chamada"). Mover para fora da raiz de `src/` e nomear com sufixo `-smoke` para não se confundir com teste de feature. Mantido (documenta que a infra funciona).

## Risks / Trade-offs

- **Algum import esquecido de `./@/`** — improvável (nada referencia), mas rodar `grep -rn "@/components\|@/lib/utils" src` e `npx tsc -b` após apagar. Se algo quebrar, ajustar o import para `@/shared/...`.
- **`.env.example` vs `.gitignore`** — `.gitignore` ignora `*.local`, não `.env*`; `.env.example` deve ser versionado. Conferir que `.env.example` não casa nenhum padrão do `.gitignore` antes do commit (`git check-ignore .env.example` deve não retornar nada).
- **Mover `msw.test.ts`** pode exigir ajuste do import de `./setupTests` → `../setupTests` (um nível acima). Rodar a suíte.
- **`components.json` alias `hooks`/`lib`** apontam para pastas que ainda não existem (`src/shared/hooks`, `src/shared/lib`) — `src/shared/lib` passa a existir nesta change; `src/shared/hooks` a spec §5 já prevê e será criada quando o primeiro hook (`useDebounce`) nascer. Alias apontando para pasta futura é inócuo.
