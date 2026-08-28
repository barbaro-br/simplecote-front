## 1. Configuração de tipos de teste

- [x] 1.1 Em `tsconfig.app.json`, trocar `"types": ["vite/client"]` por `["vite/client", "vitest/globals", "@testing-library/jest-dom"]`. Verificar: `npx tsc -b --force` não reporta mais `TS2304`/`TS2593` (`Cannot find name 'test'/'expect'/'beforeAll'/...`) em `src/admin/**/*.test.tsx`.

## 2. Fatia de referência (produtos)

- [x] 2.1 `src/admin/produtos/produtos.schema.ts`: trocar `z.coerce.number().int().min(1, ...)` por `z.number().int().min(1, 'A quantidade por embalagem deve ser no mínimo 1')` em `quantidadePorEmbalagem`. Verificar: `npx vitest run src/admin/produtos/produtos.test.tsx` verde.
- [x] 2.2 `src/admin/produtos/ProdutoForm.tsx`: manter `useForm<ProdutoFormValues>` e registrar o campo como `form.register('quantidadePorEmbalagem', { valueAsNumber: true })`. Verificar: `npx tsc -b --force` não reporta `TS2322`/`TS2345` em `ProdutoForm.tsx`.
- [x] 2.3 `src/admin/produtos/produtos.test.tsx`: remover o `import { vi } from 'vitest'` não utilizado (linha 7). Verificar: `npx tsc -b --force` não reporta `TS6133` no arquivo.

## 3. Fechamento

- [x] 3.1 `npx tsc -b --force` sai com código 0 e `npx vitest run` continua verde (todos os arquivos de teste). Se sobrar erro de tipo em `src/`, corrigir dentro do escopo (build verde) ou pausar e sinalizar se for mudança estrutural.
  - Sobrou `EmpresaForm.tsx` (`TS2322`/`TS2345`): `.transform()` em `whatsappRepresentante` no schema divergia input/output do `Resolver<>` — mesma classe do `coerce`. Corrigido com o padrão da Decisão 2b: `empresas.schema.ts` → `z.string().optional()` (sem `transform`); `EmpresaForm` normaliza com `apenasNumeros()` no submit. proposal/design/Impact atualizados. `tsc -b --force` → exit 0; `vitest run` → 17/17 verde.
- [x] 3.2 `npm run build` completa (tsc + `vite build`) e gera `dist/`. Confirmar que `dist/` não fica rastreado pelo git (`git status` limpo em `dist/`).
  - `npm run build` → exit 0, `dist/` gerado; `.gitignore` já ignora `dist` → `git status` limpo.
- [x] 3.3 Atualizar `spec.md` §16 (blocos `produtos/produtos.schema.ts` e `produtos/ProdutoForm.tsx`) para o padrão corrigido: `z.number()` no schema e `register(..., { valueAsNumber: true })` no formulário.
