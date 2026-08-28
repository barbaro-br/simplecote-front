## Why

O backend já possui as regras de negócio para gestão de produtos prontas (criação, inativação, consulta por código de barras). Precisamos agora construir a interface de administração no frontend para que o Comprador possa povoar seu catálogo e, assim, as demais funcionalidades (cotações, pedidos) possam ser construídas.

## What Changes

- Criação da tela de listagem de Produtos no Painel Admin.
- Integração da tabela com a API para listar os produtos do comprador.
- Criação do formulário "Novo produto" utilizando `react-hook-form` e validação com `zod`.
- Criação de hooks `useQuery` e `useMutation` para fazer interface com a API.
- Testes de ponta a ponta na camada de interface utilizando MSW para simular o backend.

## Capabilities

### New Capabilities
- `admin/produtos`: Gestão do catálogo de produtos do Comprador (listagem, criação, inativação e consulta por GTIN).

### Modified Capabilities
Nenhuma.

## Impact

- Novos componentes visuais.
- Novos schemas Zod baseados no DTO do backend.
- Novos requests HTTP a partir do frontend.
