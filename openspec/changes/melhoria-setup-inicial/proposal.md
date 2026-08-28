## Why

Após cruzar o `spec.md` do backend com o do front-end, percebemos que o setup inicial do front precisa acomodar elementos vitais descritos pelo backend, especificamente: o tratamento padrão de erros (RFC 7807), a formatação estrita de tipos base (datas ISO-8601 UTC para pt-BR e moedas) e a infraestrutura de testes com MSW (Mock Service Worker) simulando os contratos definidos na especificação do backend.

## What Changes

- Configuração da infraestrutura de testes unitários/componentes (Vitest + React Testing Library + MSW) respeitando a Regra 4 de não gerar código de domínio sem testes.
- Criação dos formatadores padrão (Intl.NumberFormat e Intl.DateTimeFormat) para centralizar a apresentação de dinheiro (BRL) e data/hora (America/Sao_Paulo).
- Definição do utilitário `api-client` com interceptação de `ProblemDetail` traduzido para um `ApiError` tipado.
- Criação dos DTOs base e Enums de status que o backend envia como string.

## Capabilities

### New Capabilities
- `core/test-infra`: Estabelece a infraestrutura de testes da aplicação (MSW + RTL + Vitest)
- `core/domain-types`: Estabelece os tipos de base e formatadores do domínio em paridade com as regras do backend

### Modified Capabilities
*(nenhuma)*

## Impact

Essas adições garantem que as próximas fatias (Produtos, Cotações) já terão a malha de testes pronta, o formatador de preços correto e a camada de rede traduzindo corretamente os erros do backend.
