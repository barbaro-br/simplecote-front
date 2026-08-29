## 1. Hook de lookup

- [x] 1.1 Conferir no Swagger do back (`/swagger-ui`) o shape de `DadosProdutoExternoDTO`. Em `produtos.api.ts`, criar `useLookupProdutoPorGtin` — `useMutation` chamando `api.get<DadosProdutoExternoDTO | null>('/api/produtos/lookup?gtin=' + encodeURIComponent(gtin), { lookup: true })`. Verificar: `npx tsc -b` 0.

## 2. Reordenar o ProdutoForm

- [x] 2.1 `ProdutoForm.tsx`: mover o campo **código de barras pro topo**, com `<Button type="button">Buscar</Button>` ao lado (desabilitado se vazio) e um slot de status (idle/buscando/sugerido/não encontrado). Verificar: `npm run build` ok.
- [x] 2.2 Fiar o "Buscar" ao `useLookupProdutoPorGtin`: sucesso com dados → `form.setValue('nome', data.nome, { shouldDirty: true })` + status "nome sugerido pelo código de barras"; `null` ou `onError` → status "não encontrado — preencha manualmente", form segue editável. Nome permanece editável e validado por `zod` como hoje. Verificar: `npx tsc -b` 0.

## 3. Testes

- [x] 3.1 `produtos.test.tsx` — (a) MSW `GET */api/produtos/lookup` → `{ nome: 'Arroz Tio João 5kg' }`: digitar código, clicar Buscar → campo Nome preenchido + texto "sugerido"; (b) MSW → `404`: Buscar → "não encontrado", form ainda salvável preenchendo o nome à mão; (c) sem código de barras → botão Buscar desabilitado, salvar produto sem código funciona igual a hoje. Verificar: `npx vitest run src/admin/produtos` verde.

## 4. Fechamento

- [x] 4.1 `npx vitest run` verde, `npx tsc -b` 0, `npm run build` completa.
- [x] 4.2 `openspec validate produto-codigo-de-barras-primeiro` sem erros.
