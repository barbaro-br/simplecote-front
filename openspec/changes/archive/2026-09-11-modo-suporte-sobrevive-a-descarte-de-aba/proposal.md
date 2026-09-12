## Why

O fix anterior pra "F5 em modo suporte volta pro backoffice" (change `backoffice-do-saas`, token de suporte salvo em `sessionStorage`) não resolveu de fato: os logs de produção mostram três sessões de suporte trocando sozinhas pro `SUPER_ADMIN` em pleno F5, bem antes dos 30min de expiração do token (19min, 26min e 42min depois de "entrar como suporte"), sempre no mesmo padrão — `POST /api/auth/refresh` tendo sucesso com o cookie do `SUPER_ADMIN` (o que só acontece quando `renovarSessao()` não encontra um token de impersonação em memória) seguido de `GET /api/admin/resumo`, ou seja, o `AuthGuard` mandando o `SUPER_ADMIN` de volta pro `/backoffice`.

Isso indica que o `sessionStorage` não estava sendo lido de volta num F5 real — consistente com o Chrome descartando a aba em segundo plano (memory saver) e recarregando-a como navegação nova, o que na prática zera `sessionStorage` mesmo a aba continuando "a mesma" pro analista (ex.: ele troca de aba pra atender outra coisa por alguns minutos e volta).

## What Changes

- Trocar a persistência do token de suporte de `sessionStorage` para `localStorage` (mais resistente ao descarte de aba), mas **isolada por aba**: a chave é sufixada por um id gerado em `window.name` (propriedade do próprio *browsing context*, sobrevive a navegações/reloads da aba de um jeito que `sessionStorage` não sobreviveu na prática) — evita que duas abas de suporte em lojas diferentes pisem uma na chave da outra.
- `limparTokensExpirados()`: toda gravação varre e remove entradas de token de suporte (de qualquer aba) já expiradas, pra não acumular lixo indefinido no `localStorage` de abas fechadas sem passar por "sair do modo suporte" ou logout.
- `ClaimsSessao` (decodificação do JWT no front) ganha o claim `exp`, necessário pra essa varredura.

## Capabilities

### Modified Capabilities

- `backoffice`: a persistência do token de suporte entre reloads passa a sobreviver ao descarte de aba do navegador, isolada por aba.

## Impact

- `src/shared/auth/AuthContext.tsx`: `lerTokenSuporteSalvo`/`salvarTokenSuporte` migram de `sessionStorage` pra `localStorage` com chave por aba (`idDaAba()` via `window.name`); nova `limparTokensExpirados()`.
- `src/shared/auth/jwt.ts`: `ClaimsSessao.exp`.
- Testes: `AuthContext.test.tsx` (chave por aba, token de outra aba não vaza, varredura remove tokens expirados de abas fechadas), `jwt.test.ts` (`exp` decodificado).
- Sem dependência nova. Sem mudança de contrato com o back.
