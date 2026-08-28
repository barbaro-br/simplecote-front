## Why

A fatia de autenticação do painel (`LoginPage`, `AuthContext`, `AuthGuard`) está em produção sem nenhum teste, violando a Regra 4 da `spec.md` do front ("toda tela nova tem teste: pelo menos o caminho feliz e o de erro de validação/API"). É a única área de feature do front sem cobertura.

## What Changes

- Novo `src/admin/login/login.test.tsx`: caminho feliz (credenciais válidas → `login()` chamado, token salvo em `sessionStorage`, navegação para `/admin`), erro de validação zod (e-mail/senha vazios → mensagens inline, sem chamada de rede), e erro de API (`401` com `ProblemDetail` → mensagem do servidor no `role="alert"`, sem navegar).
- Novo `src/shared/auth/auth.test.tsx` (ou `AuthContext.test.tsx` + `AuthGuard.test.tsx`): `AuthProvider` hidrata o token de `sessionStorage` no mount; `login` persiste e liga `isAutenticado`; `logout` limpa memória e `sessionStorage`; `useAuth` fora do provider lança. `AuthGuard` sem token redireciona para `/login`; com token renderiza o `<Outlet />`.
- Todos os testes usam o `server` MSW compartilhado de `src/setupTests.ts` (`server.use(...)` por caso), no padrão de `src/shared/api/api-client.test.ts`.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Adiciona somente cobertura de teste a comportamento já existente e já descrito na `spec.md` do front (§1, §7). Sem mudança de código de produção. `.openspec.yaml` declara `skip_specs: true`.

## Impact

- Novos arquivos de teste em `src/admin/login/` e `src/shared/auth/`.
- Possível ajuste mínimo de testabilidade (ex.: um `data-testid` ou `role`) se algum elemento não for alcançável por query acessível — a preferir sempre `getByRole`/`getByLabelText`.
- Nenhuma alteração de comportamento em runtime.
