## Why

`npm run build` (`tsc -b && vite build`) está quebrado: `tsc -b` sai com código 2 e ~24 erros de tipo. Como `vitest run` não faz typecheck (8 testes passam), o problema fica invisível no dia a dia e só aparece na hora de gerar o bundle de produção. A fatia de referência que a `spec.md` §16 manda copiar (`admin/produtos/`) é justamente uma das que não compila.

## What Changes

- `tsconfig.app.json`: incluir os tipos globais de teste (`vitest/globals`, `@testing-library/jest-dom`) em `compilerOptions.types` — hoje `include: ["src"]` puxa os `*.test.tsx` para o `tsc -b`, mas `test`/`expect`/`beforeAll`/`afterEach`/`afterAll` não têm tipo (`TS2304`/`TS2593`, ~20 erros em `empresas.test.tsx` + `produtos.test.tsx`).
- `admin/produtos/produtos.schema.ts` + `admin/produtos/ProdutoForm.tsx`: corrigir a incompatibilidade do `zodResolver` — com zod v4, `z.coerce.number()` produz input type `unknown`, e `useForm` sem tipo explícito assume `FieldValues`, quebrando `Resolver<>` e `SubmitHandler<>` (`TS2322`/`TS2345`). Passa a usar `z.number()` + `register(..., { valueAsNumber: true })`.
- `admin/produtos/produtos.test.tsx`: remover `import { vi }` não utilizado (`TS6133` sob `noUnusedLocals`).
- `admin/empresas/empresas.schema.ts` + `admin/empresas/EmpresaForm.tsx`: mesma classe de erro (`TS2322`/`TS2345` em `EmpresaForm.tsx`), disparada aqui pelo `.transform()` em `whatsappRepresentante` — o `.transform()` torna a chave opcional no *input type* e obrigatória no *output type*, divergindo o `Resolver<>` do `useForm<EmpresaFormValues>`. Remove o `.transform()` do schema (`whatsappRepresentante: z.string().optional()`) e passa a normalizar com `apenasNumeros()` no submit do `EmpresaForm` (mesmo padrão da Decisão 2). Sem mudança de comportamento observável: o WhatsApp continua indo só com dígitos para `/api/representantes`.
- `spec.md` §16: atualizar o bloco da fatia de referência (schema + formulário) para o padrão corrigido, já que o documento manda replicá-lo nas demais features.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Correção de configuração de build e de tipagem, sem mudança de comportamento observável: a UI, as requisições e o payload enviado permanecem idênticos — `quantidadePorEmbalagem` continua indo como número e `whatsapp` do representante continua indo só com dígitos (a normalização apenas sai do `transform` do schema e passa pro submit do `EmpresaForm`). `.openspec.yaml` declara `skip_specs: true`.

## Impact

- `tsconfig.app.json`
- `src/admin/produtos/produtos.schema.ts`, `src/admin/produtos/ProdutoForm.tsx`, `src/admin/produtos/produtos.test.tsx`
- `src/admin/empresas/empresas.schema.ts`, `src/admin/empresas/EmpresaForm.tsx` (mesma classe de erro do `Resolver<>`, via `.transform()`)
- `spec.md` §16 (documentação da fatia de referência)
- Desbloqueia `npm run build` e habilita um futuro gate de CI (`tsc`/`build`).
