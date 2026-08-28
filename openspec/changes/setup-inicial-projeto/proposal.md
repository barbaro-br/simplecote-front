## Why

O projeto front-end do SimpleCote (React 19 + Vite + TypeScript) acabou de ser criado e precisa das suas fundações estabelecidas conforme a Fase 1 definida na especificação (`spec.md`). É necessário inicializar a arquitetura base, roteamento isolado, configuração de requisições HTTP e tipos do domínio para sustentar as telas subsequentes.

## What Changes

- Configuração do projeto com alias de paths (`@/*`), utilitários básicos e integrações iniciais do React Router e TanStack Query.
- Implementação de um client HTTP (`api-client.ts`) centralizado que consome variáveis de ambiente (`VITE_API_BASE_URL`) e lida com respostas em formato `ProblemDetail`.
- Criação das duas árvores de rotas independentes exigidas (`/admin/**` e rotas públicas de representante por token `/cotacao/:token`, `/pedido/:token`).
- Tipagens base (DTOs comuns, Enum de status).
- Componentes compartilhados base e estrutura de pastas em `src/`.

## Capabilities

### New Capabilities
- `core/setup`: Setup fundamental do app, definição das cascas de rotas e cliente API para sustentar o resto do sistema.

### Modified Capabilities
*(nenhuma - projeto recém-iniciado)*

## Impact

Cria a fundação do aplicativo, permitindo que funcionalidades de domínio (Produtos, Empresas, etc.) sejam integradas na sequência seguindo a mesma arquitetura de pastas (feature-sliced).
