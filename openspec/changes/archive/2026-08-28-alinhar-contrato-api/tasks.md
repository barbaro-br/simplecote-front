## 1. Enums de status

- [x] 1.1 Em `src/shared/domain/tipos-base.ts`, corrigir `StatusCotacao` para `'RASCUNHO' | 'ABERTA' | 'ENCERRADA' | 'PEDIDOS_GERADOS' | 'CANCELADA'` e `PedidoStatus` para `'GERADO' | 'ENVIADO' | 'CONFIRMADO'`. Conferir `ParticipanteStatus`/`LanceStatus` contra os enums Java do backend (sem mudança esperada). Verificar: `npx tsc -b` sem erro e nenhum literal antigo (`APURADA`, `PENDENTE` para pedido) referenciado no `src/` (`grep`).

## 2. Tratamento global de 401

- [x] 2.1 Em `src/shared/api/api-client.ts`, criar `class SessaoExpiradaError extends Error` e `configurarSessaoExpirada(handler: () => void)` (guarda um handler em variável de módulo). Verificar: compila e é importável.
- [x] 2.2 No `fetchWrapper`, ao ver `response.status === 401` **e** o endpoint não for `POST /api/auth/login`: limpar `sessionStorage['simplecote_token']`, chamar o handler registrado (ou, se nenhum, `window.location.assign('/login')`), e lançar `SessaoExpiradaError`. O `401` de `/api/auth/login` continua virando `ApiError` (credencial inválida). Verificar com MSW: chamada a `/api/produtos` que responde 401 → `sessionStorage` vazio, handler chamado 1x, promessa rejeita com `SessaoExpiradaError`; chamada a `/api/auth/login` 401 → `ApiError`, handler não chamado.
- [x] 2.3 Em `src/App.tsx` (ou um componente filho dentro de `AuthProvider` com acesso ao router), registrar via `configurarSessaoExpirada` um handler que faça `logout()` + navegação para `/login` (`replace`). Verificar: teste renderizando `App` (ou o wiring) — ao disparar o handler, a rota vai para `/login` e `isAutenticado` fica `false`.
- [x] 2.4 Garantir que a UI não exiba a mensagem de `SessaoExpiradaError`: no ponto onde `useMutation`/`useQuery` renderiza `error.message` (ex.: `LoginPage`, formulários), ignorar `error instanceof SessaoExpiradaError`. Verificar: teste de um formulário cuja mutation recebe 401 → nenhum texto de erro inline, rota em `/login`.

## 3. 404 restrito a lookup

- [x] 3.1 Em `api-client.ts`, adicionar a opção `{ lookup?: boolean }` a `api.get` (além de `RequestInit`); só com `lookup: true` um `404` sem `application/problem+json` devolve `null` (tipo de retorno `Promise<T | null>` nesse modo). Sem `lookup`, qualquer `404` → `ApiError`. Verificar com MSW: `api.get('/x', { lookup: true })` em 404 → `null`; `api.get('/x')` em 404 → `ApiError`.
- [x] 3.2 Ajustar o(s) chamador(es) de lookup existente(s) (consulta de produto por GTIN, se já houver hook) para passar `{ lookup: true }`; nenhum outro hook passa a opção. Verificar: `grep` por `lookup: true` só nos pontos de consulta por código; `npx tsc -b` verde.

## 4. Fechamento

- [x] 4.1 `npx vitest run` verde (incluindo os novos testes de 401 e 404) e `npx tsc -b` sai 0.
- [x] 4.2 `openspec validate alinhar-contrato-api` sem erros.
