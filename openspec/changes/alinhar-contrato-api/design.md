## Context

Ver `proposal.md` — Why. Estado atual:

- `tipos-base.ts`: `StatusCotacao = 'ABERTA' | 'ENCERRADA' | 'CANCELADA' | 'APURADA'`. Backend (`simplecote-back/spec.md` §9, confirmado nos specs de `participante`): `RASCUNHO | ABERTA | ENCERRADA | PEDIDOS_GERADOS | CANCELADA`.
- `api-client.ts`: `fetchWrapper` monta URL a partir de `VITE_API_BASE_URL || ''`, injeta `Authorization` de `sessionStorage['simplecote_token']`, e em `!response.ok`: se `404` e sem `application/problem+json` → `return null as any`; senão tenta `response.json()` → `ApiError`.
- `AuthContext.tsx`: `AuthProvider` guarda `{ token }`, expõe `login`/`logout`/`isAutenticado`. `AuthGuard.tsx`: só checa `isAutenticado` (presença de token) e faz `<Navigate to="/login">`.
- `App.tsx`: `AuthProvider` > `QueryClientProvider` > `RouterProvider`. O router é um `createBrowserRouter` estático em `routes.tsx`.
- `api-client.ts` é um módulo sem React — não pode chamar `useNavigate` nem `useAuth`.

## Goals / Non-Goals

**Goals:**
- `StatusCotacao` (e os demais enums de status) idênticos ao backend.
- `401` em qualquer chamada → sessão limpa + usuário em `/login`, sem tela de erro presa.
- `404` silencioso restrito a chamadas de lookup declaradas.

**Non-Goals:**
- Refresh token / renovação silenciosa de JWT (o backend não oferece; expira em `PT8H` e re-loga).
- Retry automático de requisições após re-login.
- Validar/decodificar o JWT no front (checar `exp` localmente) — a fonte de verdade do "expirou" é o `401` do servidor.
- Mudar a assinatura de `api.get/post/put/delete` para os chamadores que não são lookup.

## Decisions

### 1. Handler de 401 injetado, não importado
`api-client.ts` exporta `configurarSessaoExpirada(handler: () => void)`. `App.tsx` (ou um pequeno componente dentro do `AuthProvider` + router) registra um handler que faz `logout()` e `router.navigate('/login', { replace: true })`.

- Alternativa A — `window.location.assign('/login')`: funciona, mas recarrega o app inteiro e perde o cache do TanStack Query à toa. Aceitável como fallback se o handler não estiver registrado.
- Alternativa B — lançar um `SessaoExpiradaError` e capturar num error boundary/`QueryCache.onError`: mais indireto; o `api-client` ainda precisa de alguém para redirecionar.
- Decisão: handler injetável + fallback `window.location` quando nenhum handler foi registrado (cobre uso do `api-client` fora da árvore React, ex.: testes).

### 2. `401` não vira `ApiError`
No `fetchWrapper`, ao ver `response.status === 401`: chamar o handler de sessão expirada, limpar `sessionStorage`, e lançar um erro sentinela (`SessaoExpiradaError extends Error`) para interromper o fluxo do chamador. As telas/`useQuery` não devem renderizar a mensagem desse erro (é transitório — a navegação para `/login` já aconteceu). Documentar que `SessaoExpiradaError` é ignorável na UI.

### 3. Modo lookup explícito
`api.get<T>(endpoint, { lookup: true })` (nova opção no wrapper, além de `RequestInit`). Só com `lookup: true` o `404-sem-problem+json` devolve `null`. O tipo de retorno vira `Promise<T | null>` nesse modo (sobrecarga ou tipo condicional simples). Os chamadores atuais (`useProdutos`, `useEmpresas`, etc.) não passam `lookup` → qualquer `404` deles agora é `ApiError`, como esperado.

- Alternativa — inferir pelo path (`/lookup/`): mágica frágil, acopla o wrapper à nomenclatura de rota.

### 4. Enums de status: uma passada em `tipos-base.ts`
Duas divergências confirmadas contra o código do backend:

- `StatusCotacao`: front tem `ABERTA | ENCERRADA | CANCELADA | APURADA`; backend tem `RASCUNHO | ABERTA | ENCERRADA | PEDIDOS_GERADOS | CANCELADA`.
- `PedidoStatus`: front tem `PENDENTE | ENVIADO`; backend `StatusPedido` = `GERADO | ENVIADO | CONFIRMADO` (`simplecote-back/.../pedido/StatusPedido.java`). `PENDENTE` não existe e falta `CONFIRMADO`.

Sem divergência: `ParticipanteStatus` (`CONVIDADO | VISUALIZOU | RESPONDIDO`), `LanceStatus` (`PENDENTE | COTADO | NAO_COTADO`). Ajustar os dois que divergem e nada mais; renomear `PedidoStatus`→ manter o nome `PedidoStatus` no front (nome de tipo é scaffolding em inglês/domínio; o que precisa bater são os *valores*).

## Risks / Trade-offs

- **Loop de redirecionamento** se `/api/auth/login` responder `401` (credencial inválida) e o handler tratar como sessão expirada. → O `401` de `login` já é convertido em `ApiError` hoje pela `LoginPage` (mensagem "credencial inválida"). Mitigar: o tratamento de sessão expirada ignora o endpoint `POST /api/auth/login` (não dispara handler nem redireciona nesse path).
- **`SessaoExpiradaError` aparecendo em algum `onError` de mutation** como toast. → Filtrar por `instanceof SessaoExpiradaError` no ponto onde a UI decide exibir erro; cobrir com teste.
- **Fallback `window.location` nos testes** recarregando o jsdom. → Nos testes, registrar um handler fake via `configurarSessaoExpirada` no setup para não cair no fallback.
- **Divergência futura dos enums** volta a acontecer sem um guarda. → Fora do escopo desta change um teste de contrato automático; deixar registrado como candidato (comparar com o OpenAPI do backend).
