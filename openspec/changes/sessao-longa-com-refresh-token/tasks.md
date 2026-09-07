## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `POST /api/auth/refresh` — valida o cookie `httpOnly` do refresh token e devolve um novo access token
- [ ] 0.2 `POST /api/auth/logout` — invalida o refresh token no servidor
- [ ] 0.3 `POST /api/auth/login` passa a setar o cookie `httpOnly` do refresh (`SameSite=None; Secure` em produção)
- [ ] 0.4 CORS: `Access-Control-Allow-Credentials: true` e origin explícita para as rotas de auth

## 1. Access token em memória

- [ ] 1.1 `api-client.ts`: substituir `getToken`/`limparToken` sobre `sessionStorage` por um valor em módulo (memória) com setter injetável; remover a chave `simplecote_token`
- [ ] 1.2 `AuthContext.tsx`: `login` guarda o access token em memória e injeta o setter no `api-client`; remover `salvarTokenNaSessao`/`lerTokenDaSessao`
- [ ] 1.3 `baixarArquivo` (download binário) usa o mesmo token em memória

## 2. Refresh transparente no api-client

- [ ] 2.1 Função `renovarSessao()` com single-flight (um `Promise` compartilhado no módulo)
- [ ] 2.2 No `fetchWrapper`: `401` autenticado → `renovarSessao()` → sucesso: repetir a requisição original uma vez com o novo token; falha ou 2º `401`: fluxo de sessão expirada atual
- [ ] 2.3 `401` anônimo e `401` de `POST /api/auth/login` seguem virando `ApiError` (sem refresh)
- [ ] 2.4 `POST /api/auth/refresh` e `/logout` usam `credentials: 'include'`

## 3. Boot e guarda

- [ ] 3.1 `AuthContext.tsx`: estado `carregando` iniciado `true`; no mount, `renovarSessao()` uma vez → popula ou não a sessão → `carregando = false`
- [ ] 3.2 `auth-context.ts` / `useAuth.ts`: expor `carregando`
- [ ] 3.3 `AuthGuard.tsx`: enquanto `carregando`, renderizar `RouteLoadingFallback`; só decidir `/login` depois
- [ ] 3.4 `logout` chama `POST /api/auth/logout` antes de limpar o estado local

## 4. Testes

- [ ] 4.1 `api-client.test.ts`: `401` → refresh ok → requisição original repetida e resolvida
- [ ] 4.2 `api-client.test.ts`: `401` → refresh falha → `SessaoExpiradaError` + handler acionado
- [ ] 4.3 `api-client.test.ts`: dois `401` concorrentes → um único hit em `/api/auth/refresh`
- [ ] 4.4 `AuthContext.test.tsx`: boot com refresh ok restaura a sessão sem `/login`
- [ ] 4.5 `AuthContext.test.tsx`: boot sem cookie → estado deslogado após `carregando`
- [ ] 4.6 `sessao-expirada.test.tsx`: ajustar expectativas ao novo fluxo (redirect só após refresh falhar)
- [ ] 4.7 `logout` chama `/api/auth/logout`

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: login, esperar o access token expirar, agir no painel (renova sem cair no login); recarregar a página (mantém sessão); "sair" (refresh posterior é rejeitado)
