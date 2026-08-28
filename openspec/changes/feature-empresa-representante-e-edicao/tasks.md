## 1. Ajustes de API e Schemas

- [x] 1.1 Em `empresas.schema.ts`, modificar `empresaSchema` para aceitar opcionalmente os dados do Representante (nome do rep, email, whatsapp). O form usará os campos de representante só na criação. Verificar tipagem de `EmpresaFormValues`.
- [x] 1.2 Em `empresas.api.ts`, criar o hook `useAtualizarEmpresa` (`PUT /api/empresas/{id}`). Criar `useCriarRepresentante` (`POST /api/representantes`). Exportar função para criar ambos sequencialmente. Verificar exportação correta.
- [x] 1.3 Em `produtos.api.ts`, adicionar o hook `useAtualizarProduto` (`PUT /api/produtos/{id}`) e o hook `useLookupProduto` (`GET /api/produtos/lookup?gtin=`). Verificar compilação.

## 2. Formulários e Edição

- [x] 2.1 Refatorar `EmpresaForm.tsx` para aceitar a prop `empresaParaEditar`. Se não estiver editando, mostrar os inputs de Representante. No submit, chamar a atualização ou a orquestração de criação dupla. Verificar exibição condicional.
- [x] 2.2 Refatorar `ProdutoForm.tsx` para aceitar a prop `produtoParaEditar` e exibir um botão "Buscar Nome" ao lado do código de barras que usa o `useLookupProduto`. Modificar o submit para atualizar ou criar dependendo da prop. Verificar UI e chamadas de API do form.

## 3. Listagens e Integração

- [x] 3.1 Em `EmpresasPage.tsx`, adicionar o botão de "Editar" na coluna de ações da tabela. Ao clicar, setar o estado `empresaParaEditar` e renderizar o `EmpresaForm`. Verificar se a troca para o form ocorre.
- [x] 3.2 Em `ProdutosPage.tsx`, adicionar o botão de "Editar" na coluna de ações da tabela. Ao clicar, setar o estado `produtoParaEditar` e renderizar o `ProdutoForm`. Verificar renderização e fechamento.

## 4. Testes (Mock)

- [x] 4.1 Atualizar `empresas.test.tsx` com as rotas mockadas de `POST /api/representantes` e `PUT /api/empresas/:id`. Testar a submissão orquestrada e a edição. Verificar sucesso de `npm test`.
- [x] 4.2 Atualizar `produtos.test.tsx` com `PUT /api/produtos/:id` e `GET /api/produtos/lookup?gtin=`. Testar o preenchimento de nome pela busca. Verificar sucesso de `npm test`.
