## 1. Testes do AuthContext

- [ ] 1.1 `src/shared/auth/AuthContext.test.tsx`: renderizar um consumidor de `useAuth` dentro de `<AuthProvider>` e cobrir — (a) mount com `sessionStorage['simplecote_token']` pré-semeado → `isAutenticado` true e `token` igual ao semeado; (b) `login()` com MSW devolvendo `{ token: 'jwt-x' }` para `POST *//api/auth/login` → `sessionStorage` passa a ter `jwt-x` e `isAutenticado` vira true; (c) `logout()` → `sessionStorage` limpo e `isAutenticado` false; (d) `useAuth()` fora do provider → `toThrow(/AuthProvider/)` (com `console.error` silenciado). Usar `server` de `src/setupTests.ts` + `server.use(...)`. Verificar: `npx vitest run src/shared/auth/AuthContext.test.tsx` verde.

## 2. Testes do AuthGuard

- [ ] 2.1 `src/shared/auth/AuthGuard.test.tsx`: `createMemoryRouter` com `/login` (stub "tela de login"), `/admin` (element `<AuthGuard />`, filho index stub "área admin"); dentro de `<AuthProvider>`. Cobrir — (a) sem token, `initialEntries: ['/admin']` → renderiza "tela de login"; (b) com token semeado em `sessionStorage`, `initialEntries: ['/admin']` → renderiza "área admin". Verificar: `npx vitest run src/shared/auth/AuthGuard.test.tsx` verde.

## 3. Testes da LoginPage

- [ ] 3.1 `src/admin/login/login.test.tsx` com `createMemoryRouter` (`/login` → `<LoginPage />`, `/admin` → stub "dashboard") dentro de `AuthProvider` + `QueryClientProvider`. Cobrir — (a) caminho feliz: preencher e-mail/senha, MSW `POST *//api/auth/login` → `{ token }` 200; após submit, renderiza "dashboard" e `sessionStorage` tem o token; (b) validação: submeter vazio → mensagens "E-mail obrigatório"/"Senha obrigatória" e nenhuma requisição (MSW `onUnhandledRequest: 'error'` garante); (c) erro de API: MSW responde `401` `application/problem+json` `{ detail: 'Credenciais inválidas.' }` → o texto aparece no `role="alert"` e continua em `/login`. Verificar: `npx vitest run src/admin/login/login.test.tsx` verde.

## 4. Fechamento

- [ ] 4.1 `npx vitest run` verde com os novos arquivos (contagem de testes maior que a atual de 8) e `npx tsc -b` sai 0.
- [ ] 4.2 Nenhum `setupServer` novo criado nos arquivos desta change — todos reusam `server` de `src/setupTests.ts` (`grep -L "from '.*setupTests'" src/**/auth*.test.tsx src/admin/login/login.test.tsx` não lista nenhum).
