## Context

Conforme a `proposal.md`, estamos configurando a fundação de um projeto React 19 recém-criado com Vite e TypeScript, preparando-o para acomodar funcionalidades do SimpleCote que seguem um modelo multi-rota e feature-sliced. 

## Goals / Non-Goals

**Goals:**
- Prover infraestrutura para estado global e roteamento limpo.
- Padronizar chamadas a API usando wrapper com tratamento de erro.

**Non-Goals:**
- Criação de autenticação/login, que ocorrerá em fase futura.
- Criação das telas de domínio específicas nesta etapa (apenas o esqueleto será criado).

## Decisions

- **Client HTTP e Cache**: Uso do `TanStack Query` e um simples utilitário wrapper do `fetch` para facilitar o setup e centralizar a manipulação de respotas HTTP para tratamento de `ProblemDetail`. 
- **Estrutura de Pastas**: Uso de pastas feature-sliced, segregadas entre `admin`, `representante` e `shared`, evitando monólitos e refletindo os limites de negócio da plataforma.
- **Formatação de UI Básica**: Adoção do Shadcn UI base e Tailwind CSS v4 já no arranque, centralizado em `src/index.css` (seguindo as definições da spec). 

## Risks / Trade-offs

- **Risk**: Rotas podem se entrelaçar se não forem bem separadas.
  - **Mitigation**: A árvore de rotas deve ser instanciada no `routes.tsx` de forma estrita, garantindo que componentes do admin (`AdminLayout`) não englobem as rotas do representante.
