## Context

Ver `proposal.md` — Why. Estado atual relevante:

- `build` script = `tsc -b && vite build`. `tsc -b` hoje sai 2.
- `tsconfig.app.json`: `include: ["src"]`, `types: ["vite/client"]`, `noUnusedLocals`/`noUnusedParameters`, `strict` (via `erasableSyntaxOnly` e afins). Os `*.test.tsx` moram em `src/` → entram no compile.
- `vitest.config.ts` tem `globals: true` e `setupFiles: './src/setupTests.ts'` (que importa `@testing-library/jest-dom`). Em runtime os globais existem; o TS não os conhece.
- Stack de formulário: `react-hook-form` ^7.86 + `@hookform/resolvers` ^5.9 + `zod` ^4.4. `zodResolver(schema)` infere o *input type* do schema. `z.coerce.number()` tem input `unknown` → `Resolver<{...quantidadePorEmbalagem: unknown}, any, {...number}>`, que não é atribuível ao `Resolver` esperado por `useForm<ProdutoFormValues>` quando `ProdutoFormValues = z.infer<typeof schema>` (output, com `number`). Sem o type param no `useForm`, `TFieldValues` cai para `FieldValues` e o `SubmitHandler` também quebra.
- `empresas.schema.ts` não usa `z.coerce`, mas tem `.transform()` em `whatsappRepresentante` (`z.string().optional().transform(...)`). O `.transform()` torna a chave opcional no *input type* (`whatsappRepresentante?`) e obrigatória no *output type* (`whatsappRepresentante: string | undefined`) → mesma divergência input≠output que quebra o `Resolver<>` do `useForm<EmpresaFormValues>` (`TS2322`/`TS2345` em `EmpresaForm.tsx`).

## Goals / Non-Goals

**Goals:**
- `npx tsc -b` sai 0.
- `npx vitest run` continua verde.
- A fatia de referência (`admin/produtos/`) volta a ser um molde que compila e pode ser copiado ao pé da letra.

**Non-Goals:**
- Migrar todos os testes para `import { test, expect, ... } from 'vitest'` — habilitar os globais no `tsconfig` é suficiente e alinhado com `globals: true`.
- Trocar `@hookform/resolvers`/`zod`/`react-hook-form` de versão.
- Qualquer mudança de comportamento de runtime dos formulários além da coerção numérica de um campo.

## Decisions

### 1. Globais de teste via `tsconfig`, não via import por arquivo
`compilerOptions.types` em `tsconfig.app.json` passa a ser `["vite/client", "vitest/globals", "@testing-library/jest-dom"]`.

- Alternativa (import explícito de `vitest` em cada `*.test.tsx`): mais verboso, contraria `globals: true` já configurado, e não resolve `@testing-library/jest-dom` (o matcher `toBeInTheDocument`).
- Trade-off: declarar `types` explicitamente remove os `@types/*` ambientais implícitos (ex.: `@types/node`). `src/` só usa `import.meta.env` (coberto por `vite/client`); `@types/node` fica para os arquivos de config, que estão em `tsconfig.node.json` (fora deste escopo). Se algum arquivo de `src/` quebrar por falta de tipo de `node`, adicionar `"node"` à lista.

### 2. `z.number()` + `valueAsNumber` em vez de `z.coerce.number()`
`produtoSchema.quantidadePorEmbalagem`: `z.number().int().min(1, 'A quantidade por embalagem deve ser no mínimo 1')`.
`ProdutoForm`: `<Input type="number" {...form.register('quantidadePorEmbalagem', { valueAsNumber: true })} />`, mantendo `useForm<ProdutoFormValues>({ resolver: zodResolver(produtoSchema), ... })`.

Com isso input e output do schema são ambos `number` → `Resolver<>` casa e o `SubmitHandler` fica bem tipado.

- Alternativa A — manter `z.coerce.number()` e tipar `useForm<z.input<typeof s>, unknown, z.output<typeof s>>`: funciona, mas espalha um genérico de 3 parâmetros por toda fatia copiada; mais frágil a upgrades.
- Alternativa B — `zodResolver(produtoSchema) as Resolver<ProdutoFormValues>`: cast que esconde o problema.
- `valueAsNumber` é o mecanismo idiomático do RHF para `<input type="number">` e já entrega `number` (ou `NaN` em campo vazio, tratado pela regra `min(1)` do zod).

### 2b. Mesmo padrão em `empresaSchema.whatsappRepresentante`
Mesma regra da Decisão 2 (input == output, sem `transform`/`coerce` no schema de formulário): `empresas.schema.ts` passa a `whatsappRepresentante: z.string().optional()` e o `EmpresaForm` normaliza com `apenasNumeros()` no submit, antes de chamar `criarRepresentante.mutateAsync`. Input e output do schema voltam a coincidir → `Resolver<>` casa com `useForm<EmpresaFormValues>`.

- Comportamento observável inalterado: o WhatsApp continua sendo enviado só com dígitos para `/api/representantes` (campo vazio → `undefined`).
- `emailRepresentante` (`.email().optional().or(z.literal(''))`) não diverge input/output → fica como está.

### 3. Sincronizar `spec.md` §16
O documento manda copiar a fatia de referência "exatamente nesta forma". Atualizar os blocos de `produtos.schema.ts` e `ProdutoForm.tsx` na §16 para o padrão corrigido, senão a próxima feature nasce com o mesmo bug.

## Risks / Trade-offs

- `valueAsNumber` em campo limpo → `NaN` → `z.number()` falha com a mensagem de `min(1)` em vez de "obrigatório". Aceitável (mesma UX de "valor inválido"); `defaultValues.quantidadePorEmbalagem = 1` evita o caso comum. → Teste cobre submit após limpar o campo.
- Corrigir o `types` do tsconfig pode revelar erros latentes em outros `*.test.tsx`/`*.ts` que hoje o `tsc` nem chega a analisar a fundo. → Rodar `tsc -b` ao final e tratar o remanescente dentro do escopo do achado 1 (build verde); se surgir algo estrutural fora de tipagem trivial, pausar e sinalizar. → Materializado: sobrou o `EmpresaForm.tsx` (`.transform()` no schema), tratado na Decisão 2b — mesma classe de bug do `coerce`, mesma correção; proposal/design/Impact atualizados para incluir `admin/empresas/`.
- `dist/` versionado por engano — `.gitignore` já ignora `dist`; conferir no fechamento.
