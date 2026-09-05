## Why

Os links públicos enviados ao representante (`/cotacao/:token`, `/pedido/:token`) e ao colaborador (`/colaborador/:token`) estão caindo na tela de login em vez de abrir a tela do token. Causa raiz: o `ConfiguracaoLojaProvider` (montado globalmente em `App.tsx`) dispara `GET /api/configuracoes` — rota administrativa (ADMIN) — em toda página. Nas rotas públicas não há JWT de admin, o back responde `401`, e o `api-client` trata **qualquer** `401` como "sessão expirada", acionando o `SessaoExpiradaBridge` que navega para `/login`.

## What Changes

- **`api-client`** — `401` só vira "sessão expirada" (limpa token + redireciona) quando a requisição **de fato carregava um token**. Uma requisição anônima (sem token) que recebe `401` vira `ApiError` normal, **sem redirecionar**. O `401` de `POST /api/auth/login` (credencial inválida) continua sendo `ApiError` normal.
- **`ConfiguracaoLojaProvider`** — só busca `/api/configuracoes` quando há sessão autenticada (`enabled: isAutenticado`), deixando de disparar chamada ADMIN nas rotas públicas.
- **Sem mudança de comportamento autenticado** — token expirado numa chamada autenticada continua limpando a sessão e redirecionando para `/login`.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `core/setup`: a requirement "Cliente HTTP unificado" passa a distinguir `401` de requisição **autenticada** (sessão expirada → redireciona) de `401` de requisição **anônima** (não autorizado → `ApiError`, sem redirecionar).

## Impact

- **Front (este repo):** `src/shared/api/api-client.ts` (semântica do `401`), `src/admin/configuracoes/configuracoes.api.ts` (parâmetro `enabled` no `useConfiguracaoLoja`), `src/admin/configuracoes/ConfiguracaoLojaProvider.tsx` (gate por `isAutenticado`), e testes correspondentes.
- **Sem impacto no back** — o `SecurityConfig` já deixa `/public/**` e `/api/auth/**` permitidos; a correção é 100% front.
- **Fora do escopo:** exibir nome/cor de marca nas telas públicas e de login exigiria um endpoint público de configuração no back (outra change) — hoje essas telas já não recebem essa config (o `401` a anula), então não há regressão.
