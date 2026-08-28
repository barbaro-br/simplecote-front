## 1. Definições e Comunicação com API

- [x] 1.1 Criar `src/admin/produtos/produtos.schema.ts` exportando o tipo `Produto` e o validador zod `produtoSchema`. Verificar sem erros de tipo.
- [x] 1.2 Criar `src/admin/produtos/produtos.api.ts` contendo hooks do React Query (`useProdutos`, `useCriarProduto`, `useInativarProduto`) que fazem chamadas à API unificada. Verificar sem erros de compilação.

## 2. Componentes e Página

- [x] 2.1 Desenvolver o formulário `ProdutoForm.tsx` utilizando `react-hook-form` e o validador `zod` criado. Verificar que os erros de validação aparecem na tela (ex: nome vazio, qtd = 0).
- [x] 2.2 Desenvolver `ProdutosPage.tsx` para exibir a listagem de produtos retornados da API, botão de inativar por item e exibir o `ProdutoForm` condicionalmente. Verificar sem erros de compilação.

## 3. Roteamento e Mock de Teste

- [x] 3.1 Registrar a página `/admin/produtos` no arquivo de rotas globais `src/routes.tsx` apontando para o componente `ProdutosPage`, e atualizar o `AdminLayout.tsx` se necessário para garantir o menu de navegação. Verificar navegação funcionando no dev mode.
- [x] 3.2 Criar `src/admin/produtos/produtos.test.tsx` configurando interceptações MSW locais para as rotas (`GET /api/produtos`, `POST /api/produtos`, etc). Escrever testes que listem os dados, e simulem a abertura e preenchimento com sucesso do formulário. Verificar rodando `npm test`.
