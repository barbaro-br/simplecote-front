## Context

Similar à feature de Produtos, estamos construindo um módulo de cadastro (CRUD) para um recurso vital. A infraestrutura de componentes já existe (Button, Input). Precisamos apenas reproduzir o formato e introduzir validação de CPF/CNPJ no Zod.

## Goals / Non-Goals

**Goals:**
- Implementar a página de Empresas com base na arquitetura e estilo visual da de Produtos.
- Implementar um mock simples no MSW para simular o endpoint de lookup do CNPJ.

**Non-Goals:**
- A integração com provedores da Receita de fato no backend não é problema nosso aqui, nós apenas chamaremos a URL da API relativa para o lookup (`/api/empresas/lookup?cnpj=`).

## Decisions
- **Validação de CNPJ:** O `zod` não tem validação matemática de CNPJ embutida. Usaremos um Regex simples ou algoritmo rápido local para validar as restrições antes do envio para polir a UX. 
- **Endpoint Lookup:** Criaremos um helper hook `useLookupCNPJ` via React Query disparado on-demand, sem cache agressivo, via um botão adjacente ao input de CNPJ.

## Risks / Trade-offs
- A busca do CNPJ acoplada ao form. Se a API falhar ou estiver sem licença (ex: sem credencial configurada no backend como diz a spec lá), nós ignoraremos a falha silenciosamente permitindo ao usuário digitar na mão, para não travar o cadastro.
