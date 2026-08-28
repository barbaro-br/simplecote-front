## Why

O front tem três divergências de contrato com o backend que já causam (ou vão causar) bug silencioso: o union type de status de Cotação não bate com o backend, não há tratamento global de `401` (a autenticação já está no ar) e o `api-client` engole qualquer `404` como "vazio", não só o do lookup de GTIN previsto na `spec.md` §12.

## What Changes

- `src/shared/domain/tipos-base.ts`: corrigir os union types de status contra o código do backend. `StatusCotacao` → `'RASCUNHO' | 'ABERTA' | 'ENCERRADA' | 'PEDIDOS_GERADOS' | 'CANCELADA'` (hoje tem `'APURADA'` inexistente e faltam `RASCUNHO`/`PEDIDOS_GERADOS`). `PedidoStatus` → `'GERADO' | 'ENVIADO' | 'CONFIRMADO'` (hoje `'PENDENTE' | 'ENVIADO'` — `PENDENTE` não existe, falta `CONFIRMADO`; backend `StatusPedido`). `ParticipanteStatus` e `LanceStatus` já batem — conferir na mesma passada.
- `src/shared/api/api-client.ts`: ao receber `401`, limpar a sessão (`sessionStorage`) e sinalizar re-login (redirecionar para `/login`) em vez de propagar um `ApiError` genérico que trava a tela. O sinal é entregue via um callback/handler injetável, para o `api-client` não depender do React Router nem do `AuthContext`.
- `src/shared/api/api-client.ts`: restringir o retorno "vazio" (`null`) do `404-sem-problem+json` aos endpoints de lookup (ex.: `GET /api/produtos/lookup/{gtin}`), via um parâmetro explícito de opção. Demais `404` viram `ApiError` normal.
- `src/shared/auth/AuthGuard.tsx` / `AuthContext.tsx`: reagir ao evento de sessão expirada disparado pelo `api-client` (limpar token em memória, redirecionar).
- Testes (MSW) para cada um dos três comportamentos.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `core/setup`: a requisito **Cliente HTTP unificado** ganha o tratamento de `401` (limpeza de sessão + redirecionamento) e a delimitação do `404` silencioso aos lookups.
- `core/domain-types`: novo requisito de que os union types de status espelhem exatamente os enums do backend (`StatusCotacao` com os 5 estados corretos).

## Impact

- `src/shared/domain/tipos-base.ts`
- `src/shared/api/api-client.ts` (novo ponto de configuração para o handler de 401 e para o modo lookup)
- `src/shared/auth/AuthContext.tsx`, `src/shared/auth/AuthGuard.tsx`
- `src/App.tsx` (fiação do handler de 401 ao router/AuthContext)
- Testes: `src/shared/api/api-client.test.ts` e um teste de sessão expirada.
- Nenhuma mudança de endpoint no backend.
