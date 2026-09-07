## Why

Hoje o JWT vive em `sessionStorage` e não é renovado: quando o token expira, a primeira chamada a `/api/**` recebe `401`, a sessão é apagada e o usuário cai no `/login` — no meio do que estava fazendo. Para um SaaS onde o dono do supermercado usa o painel o dia inteiro, isso é atrito constante. Falta um **refresh token** e a renovação transparente da sessão.

## What Changes

- O login passa a devolver, além do **access token** de vida curta, um **refresh token** de vida longa entregue como cookie `httpOnly` (o front não lê nem guarda o refresh — só o navegador o reapresenta).
- O access token deixa de ser persistido em `sessionStorage` e passa a viver **só em memória**. No boot da aplicação, o `AuthContext` tenta `POST /api/auth/refresh` uma vez: se o cookie ainda for válido, a sessão é restaurada sem passar pelo `/login`; se não, o usuário começa deslogado.
- No `api-client`, um `401` numa chamada autenticada passa a disparar **uma** tentativa de `refresh` e, se der certo, **repete a requisição original** de forma transparente. Só quando o refresh falha é que a sessão é limpa e o handler de sessão expirada (redirect para `/login`) é acionado — o comportamento atual vira o caso de fallback, não o caso comum.
- Chamadas concorrentes que recebem `401` ao mesmo tempo compartilham **um único** refresh em voo (não N refreshes).
- `logout` passa a chamar `POST /api/auth/logout` para invalidar o refresh token no servidor, além de limpar o estado local.
- Recarregar a página no meio de uma sessão válida deixa de exigir novo login.

## Capabilities

### Modified Capabilities

- `core/setup`: requirement "Cliente HTTP unificado" — o `401` em chamada autenticada passa por uma tentativa de refresh com repetição transparente antes de sinalizar sessão expirada; o access token vive em memória, não em `sessionStorage`.

## Impact

- `src/shared/api/api-client.ts`: fila de refresh única em voo; repetição da requisição original após refresh bem-sucedido; `getToken`/`limparToken` passam a operar sobre um valor em memória (setter injetável), não `sessionStorage`.
- `src/shared/auth/AuthContext.tsx`: boot faz `refresh` antes de renderizar as rotas (estado `carregando`); `login` guarda o access token em memória; `logout` chama `/api/auth/logout`.
- `src/shared/auth/AuthGuard.tsx` / `SessaoExpiradaBridge.tsx`: lidar com o estado `carregando` do boot (mostrar o `RouteLoadingFallback` em vez de mandar pro `/login` cedo demais).
- `src/shared/auth/auth-context.ts`, `useAuth.ts`: tipo do contexto ganha `carregando`.
- Testes: `api-client.test.ts` (401 → refresh → repete; refresh falha → sessão expirada; refresh único para chamadas concorrentes), `AuthContext.test.tsx` / `sessao-expirada.test.tsx` (boot restaura sessão; boot sem cookie começa deslogado; logout invalida no servidor).
- **Contrato com o `simplecote-back`**: novos `POST /api/auth/refresh` e `POST /api/auth/logout`; `POST /api/auth/login` passa a setar o cookie `httpOnly` do refresh (setado pela API, `Domain=.simplecote.com.br; SameSite=None; Secure`; dev/teste: `Lax`/sem `Secure`/sem `Domain`); CORS com `Access-Control-Allow-Credentials: true` e origem dinâmica cobrindo o app (`https://<slug>.simplecote.app`, `app.simplecote.app`) e o site (`simplecote.com.br`, `www`), com o front enviando `credentials: 'include'` nessas chamadas. Só `/api/auth/refresh` e `/logout` leem o cookie. Ver `RISCOS-TRANSVERSAIS.md` §0 e §D.
