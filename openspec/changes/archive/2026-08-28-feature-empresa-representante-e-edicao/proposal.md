## Why

Atualmente, o frontend cadastra a Empresa mas não possui o fluxo para cadastrar o Representante, que é obrigatório para a comunicação de e-mails e lances. Como um Representante não existe sem Empresa, o fluxo mais fluído para o usuário é criá-los juntos. Além disso, a gestão de catálogos carece da funcionalidade de edição e consulta de código de barras (GTIN) para Produtos, e de edição para Empresas.

## What Changes

- O formulário de Nova Empresa passará a incluir campos do Representante (nome, e-mail, whatsapp). Ao salvar, o frontend fará o fluxo orquestrado: criar Empresa -> extrair ID -> criar Representante vinculado.
- Adição do botão "Editar" na listagem de Empresas, reusando o formulário para fazer o `PUT /api/empresas/{id}`.
- Adição do botão "Editar" na listagem de Produtos, reusando o formulário para fazer o `PUT /api/produtos/{id}`.
- Adição da busca por código de barras no cadastro/edição de Produto (via `GET /api/produtos/lookup?gtin=`).

## Capabilities

### New Capabilities

### Modified Capabilities
- `admin/empresas`: Modificaremos o requisito de cadastro para englobar a criação do Representante no mesmo fluxo, e adicionaremos o requisito de Atualização de Empresa.
- `admin/produtos`: Adicionaremos os requisitos de Atualização de Produto e Consulta de Código de Barras (GTIN).

## Impact

- `src/admin/empresas/*`: Formulário orquestrará duas requisições API sequenciais.
- `src/admin/produtos/*`: Formulário de Produto será expandido para modo de edição e busca externa via GTIN.
- Dependência de transações: A criação da Empresa e Representante precisa gerenciar caso a segunda requisição falhe (se criar a Empresa e o Representante falhar, podemos exibir erro mas a Empresa já estará criada, o que é aceitável, o usuário pode inativar ou o backend lida, mas idealmente o design tratará isso).
