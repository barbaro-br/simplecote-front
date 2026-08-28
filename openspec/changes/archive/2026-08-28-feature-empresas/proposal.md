## Why

Para que o Comprador consiga abrir cotações (o core do sistema), primeiro ele precisa ter fornecedores cadastrados na base. Este épico introduz a gestão de Empresas Fornecedoras, permitindo seu cadastro, edição e listagem.

## What Changes

- Criação da tela de listagem de Empresas no Painel Admin.
- Criação do formulário de cadastro/edição de fornecedor, incluindo integração com CNPJ e os campos de contato base (E-mail, Telefone, WhatsApp).
- Validações Zod espelhando os DTOs do backend para garantir que não haja requisições inválidas enviadas (ex: CNPJ inválido).

## Capabilities

### New Capabilities
- `admin/empresas`: Gestão de Empresas (fornecedores) pelo Comprador.

### Modified Capabilities
Nenhuma.

## Impact

- Novos componentes visuais baseados na estrutura de `Produtos` (reuso do design system interno).
- Novos mocks no MSW.
