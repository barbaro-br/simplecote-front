## Context

Ver `proposal.md` — Why. Código sob teste (já existente, sem alteração):

- `AuthContext.tsx`: `AuthProvider` com `useState` inicializado por `lerTokenDaSessao()` (`sessionStorage['simplecote_token']`, com `try/catch`). `login(email, senha)` → `api.post('/api/auth/login')` → salva token + `setAuth`. `logout()` → remove da sessão + `setAuth({token:null})`. `useAuth()` lança fora do provider.
- `AuthGuard.tsx`: lê `isAutenticado`; sem token → `<Navigate to="/login" replace />`; com token → `<Outlet />`.
- `LoginPage.tsx`: `react-hook-form` + `zodResolver` (`email` obrigatório+formato, `senha` obrigatória), `noValidate`. `onSubmit` chama `login()`; em `ApiError` → `setErroServidor(err.message)` num `<div role="alert">`; sucesso → `navigate('/admin', { replace: true })`.
- Infra de teste: `src/setupTests.ts` exporta `server` (MSW) e faz `listen/resetHandlers/close`. `vitest.config.ts` com `globals: true`, `jsdom`.

## Goals / Non-Goals

**Goals:**
- Cobrir caminho feliz + erro de validação + erro de API da `LoginPage`.
- Cobrir hidratação/persistência/limpeza do `AuthContext` e o redirecionamento do `AuthGuard`.
- Usar o `server` MSW compartilhado (padrão de `api-client.test.ts`), não um `setupServer` novo por arquivo.

**Non-Goals:**
- Testar expiração de token / interceptor de `401` — é da change `alinhar-contrato-api`.
- Testes end-to-end de fluxo de rota completo (login → dashboard com dados).
- Refatorar o código de auth.

## Decisions

### 1. Harness de roteamento: `createMemoryRouter` + `RouterProvider`
Para `LoginPage` e `AuthGuard`, montar um `createMemoryRouter` com rotas mínimas (`/login`, `/admin` com o guard, um stub de destino) e `initialEntries` apropriado, dentro de `AuthProvider` + `QueryClientProvider`. Asserir navegação pelo conteúdo renderizado (ex.: texto do stub de `/admin` ou de `/login`), não por espiar `navigate`.

- Alternativa — `vi.mock('react-router-dom')` para `useNavigate`: frágil, acopla o teste ao named import; o memory router exercita o comportamento real.

### 2. `sessionStorage` real do jsdom
jsdom fornece `sessionStorage`. Cada teste limpa (`sessionStorage.clear()` em `beforeEach`) e, quando precisa, semeia um token antes de montar para exercitar a hidratação. Sem mock.

### 3. Um arquivo por unidade
`src/admin/login/login.test.tsx`, `src/shared/auth/AuthContext.test.tsx`, `src/shared/auth/AuthGuard.test.tsx` — espelha o padrão "teste ao lado do código" já usado em `empresas/`, `produtos/`, `shared/api/`, `shared/format/`.

## Risks / Trade-offs

- **`useAuth` fora do provider lança** — o `render` do RTL propaga; capturar com `expect(() => render(...)).toThrow(/AuthProvider/)` e silenciar o `console.error` do React nesse caso (`vi.spyOn(console,'error')`).
- **Timing do `isSubmitting`/navegação** — usar `findBy*`/`waitFor` do RTL; `userEvent.setup()` como nos testes existentes.
- **Mensagem do `ProblemDetail`** — o MSW devolve `{ detail: 'Credenciais inválidas.' , status: 401, ... }` com `Content-Type: application/problem+json`; o teste asserta esse texto no `role="alert"`.
