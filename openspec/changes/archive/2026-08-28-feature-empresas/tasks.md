## 1. Definições e API

- [x] 1.1 Criar `src/shared/utils/cnpj.ts` com uma função de validação/remoção de máscara de CNPJ para uso no Zod. Verificar rodando um arquivo de teste isolado simples se desejar.
- [x] 1.2 Criar `src/admin/empresas/empresas.schema.ts` exportando `Empresa` e `empresaSchema` validando todos os campos requeridos e o regex de CNPJ. Verificar compilação.
- [x] 1.3 Criar `src/admin/empresas/empresas.api.ts` contendo hooks de mutação/query (`useEmpresas`, `useCriarEmpresa`, `useInativarEmpresa`, `useLookupCNPJ`). Verificar compilação sem erros.

## 2. Interface de Usuário

- [x] 2.1 Desenvolver o formulário `EmpresaForm.tsx`. O campo CNPJ deve ter um botão adjacente "Buscar na Receita". Quando clicado, invoca a API e injeta os valores retornados no formulário. Verificar UI no navegador.
- [x] 2.2 Desenvolver a `EmpresasPage.tsx` com a listagem (tabela similar à de Produtos), botões Inativar/Ativar e invocação condicional do formulário. Verificar UI sem erros.

## 3. Roteamento e Mock

- [x] 3.1 Registrar `/admin/empresas` no `routes.tsx` e injetar a página, além de colocar a URL na navegação do `AdminLayout.tsx`. Verificar roteamento funcional.
- [x] 3.2 Criar os mocks no MSW e o teste `empresas.test.tsx` garantindo renderização inicial e comportamento de busca do CNPJ preenchendo os dados automaticamente e habilitando submissão. Verificar executando `npm test`.
