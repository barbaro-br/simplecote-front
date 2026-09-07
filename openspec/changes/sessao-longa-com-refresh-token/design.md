## Context

Ver `proposal.md` — Why. Hoje: `AuthContext` lê/escreve `simplecote_token` em `sessionStorage`; `api-client` anexa `Authorization` a partir daí e, no `401` autenticado, chama `sessaoExpiradaHandler` (injetado por `App.tsx`) ou faz `window.location.assign('/login')`. Não há renovação.

## Goals / Non-Goals

**Goals**
- Renovação transparente sem acoplar `api-client` ao React/router (o handler injetável continua sendo o contrato).
- Sessão que sobrevive a reload e a expiração do access token.

**Non-Goals**
- Trocar o esquema de auth por Clerk/Auth0.
- "Lembrar deste dispositivo" / múltiplas sessões nomeadas / revogação por dispositivo na UI — evolução posterior.
- Rotação de refresh token a cada uso (o back pode adotar; o front não precisa saber).

## Decisions

- **Access token em memória; refresh token em cookie `httpOnly`.** Tirar o access token de `sessionStorage` reduz a superfície de XSS; o refresh, sendo `httpOnly`, não é acessível a JS. Alternativa considerada: manter tudo em `sessionStorage` com refresh manual — rejeitada por não melhorar a segurança e ainda exigir a fila de refresh. Trade-off aceito: uma aba nova não "herda" a sessão instantaneamente — ela faz o refresh no boot (uma ida ao servidor), o que é imperceptível.
- **Refresh único em voo (single-flight).** Um `Promise<string|null>` compartilhado no módulo do `api-client`; o primeiro `401` cria, os demais aguardam. Sem isso, uma tela com 5 queries dispararia 5 refreshes e provavelmente invalidaria o token no back (se houver rotação).
- **Repetição só uma vez.** A requisição repetida que receber `401` de novo não tenta outro refresh — cai direto no fluxo de sessão expirada. Evita laço infinito.
- **Boot bloqueante com estado `carregando`.** `AuthContext` expõe `carregando: true` até o refresh do boot resolver; `AuthGuard` renderiza `RouteLoadingFallback` nesse meio-tempo em vez de decidir `/login`. Sem isso, o usuário veria um flash da tela de login a cada reload.
- **`credentials: 'include'` nas chamadas de auth.** O cookie do refresh só vai e volta se o front pedir e o back permitir (`Access-Control-Allow-Credentials: true`, origin explícita — não `*`).

## Risks / Trade-offs

- **CORS + cookies entre `*.vercel.app` e `*.herokuapp.com` (domínios de site diferentes)** → o cookie do refresh precisa de `SameSite=None; Secure`; validar no ambiente de deploy real, não só local. Já há domínio custom (`api.simplecote.com.br`) — usar um sufixo comum quando possível simplifica.
- **Multi-subdomínio (`tenant-por-subdominio`)** → o cookie do refresh é **da API** (`api.simplecote.com.br`, `Domain` de `.simplecote.com.br`), não do app; o app fica em `<slug>.simplecote.app` (ver `RISCOS-TRANSVERSAIS.md` §0) e envia o cookie para a API via `SameSite=None` + `credentials: 'include'` — funciona em qualquer subdomínio sem novo login. O back valida a origem com regex `^https://([a-z0-9-]+\.)?simplecote\.(com\.br|app)$` (nunca `*`, porque `Allow-Credentials` exige origem explícita). Perfil dev/teste: `SameSite=Lax`, sem `Secure`, sem `Domain`.
- **Relógio/tolerância**: não tentar prever a expiração no cliente (evita depender do relógio local); reagir ao `401` é mais simples e robusto. Trade-off: sempre há uma chamada que "gasta" o `401` antes do refresh — custo desprezível.
- **Testes de concorrência são chatos** → cobrir o single-flight com duas chamadas iniciadas antes de o refresh resolver e assertar um único hit no handler do MSW.

## Migration Plan

1. Back entrega `/api/auth/refresh` e `/api/auth/logout` e passa a setar o cookie no `login` (retrocompatível: o corpo com `token` continua).
2. Front: access token em memória + refresh no boot + single-flight no `api-client`.
3. Como o `login` ainda retorna `token` no corpo, dá para lançar o front antes de o back cortar o `sessionStorage` — durante a transição, ausência de cookie só significa "cai no `/login` como hoje".
4. Rollback: reverter o front para ler `sessionStorage`; o cookie extra no back é inócuo.
