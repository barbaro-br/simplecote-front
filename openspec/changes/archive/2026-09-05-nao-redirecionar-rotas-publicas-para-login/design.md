## Context

Ver proposal.md (Why) para a motivação. Resumo do que importa aqui: o `ConfiguracaoLojaProvider` (em `App.tsx`, fora do router) chama `useConfiguracaoLoja()` → `GET /api/configuracoes`, rota `hasRole("ADMIN")` no back. Nas rotas públicas (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`) não há JWT, o back responde `401`, e o `api-client` trata qualquer `401` como "sessão expirada" → `SessaoExpiradaBridge` navega para `/login`.

Estado atual do código: o `api-client` já ganhou (numa change anterior, `fix: rotas públicas não enviam JWT...`) a função `isPublicRequest` que evita enviar JWT para `/public/**` e evita redirecionar nesses casos. Mas isso **não** cobre `/api/configuracoes` (não é `/public/**`) disparado por uma página anônima.

## Goals / Non-Goals

**Goals:**

- Rotas públicas abrem a tela do token sem cair no `/login`.
- Preservar o comportamento de sessão expirada para chamadas **autenticadas** (token presente → 401 → redireciona).

**Non-Goals:**

- Não expõe branding (nome/cor) nas telas públicas/login — isso exigiria endpoint público no back (outra change).
- Não muda o `SecurityConfig` do back.

## Decisions

- **`401` só é "sessão expirada" quando a requisição carregava token.** A condição do ramo 401 em `fetchWrapper` passa a exigir `token` (truthy). Requisição anônima que recebe `401` cai no caminho normal de erro → `ApiError` (com `ProblemDetail`), sem limpar sessão e sem redirecionar. Alternativa considerada: estender `isPublicRequest` com mais prefixos — rejeitada (não escala e não cobre `/api/configuracoes`); o teste por `token` é mais geral e correto ("sessão expirada" pressupõe que havia sessão). A condição atual `!publico` fica redundante (já que `publico` zera `token`), mas é inofensiva; manter para não ampliar o diff.

- **`ConfiguracaoLojaProvider` só busca a config quando autenticado.** O provider (bootstrap global) usa `useAuth().isAutenticado` e passa `enabled: isAutenticado` ao `useConfiguracaoLoja`, deixando de disparar a chamada ADMIN em rotas públicas. Isso elimina o `401` inútil (e o ruído de console) que aconteceria a cada abertura de link público mesmo após o item anterior. O hook ganha um parâmetro `enabled` (default `true`) para não afetar os demais consumidores (`AdminLayout`, `ConfiguracoesPage`, `LoginPage`).

- **Nenhuma mudança de contrato/back.** O `LoginPage` continua usando `useConfiguracaoLoja()` sem `enabled`; hoje ele já recebe `401` e mostra fallback — comportamento inalterado (fora do escopo desta change).

## Risks / Trade-offs

- [Regressão em sessão expirada autenticada] → a condição só acrescenta `token`; com token presente, o comportamento é idêntico ao anterior. Mitigação: o teste unitário de 401 com token (já existente) continua verde.
- [Chamada autenticada que perde o token da memória antes do envio] → improvável (o token é lido do `sessionStorage` no mesmo `fetchWrapper`); mesmo que aconteça, o 401 viraria `ApiError` em vez de redirecionar — aceitável (sem sessão, não há "sessão expirada").
- [Fetch de `/api/configuracoes` ainda ocorre no `/login`] → `LoginPage` continua disparando; é um `401` anônimo que agora vira `ApiError` sem redirecionar (melhora: hoje isso ainda chama o handler mesmo sem token). Sem impacto funcional.

## Migration Plan

Sem migração de dados. Deploy normal (front only, sem dependência de back). Rollback: redeploy da versão anterior.

## Open Questions

(nenhuma — a causa raiz e a abordagem estão confirmadas no código e alinhadas ao que já existe no working tree.)
