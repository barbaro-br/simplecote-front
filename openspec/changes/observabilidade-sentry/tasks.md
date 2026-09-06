## 1. Setup

- [x] 1.1 `npm i @sentry/react` (dependência nova — aprovada nesta change)
- [x] 1.2 `src/shared/observability/sentry.ts`: `iniciarSentry()` — lê `import.meta.env.VITE_SENTRY_DSN`; vazio → retorna sem inicializar; senão `Sentry.init({ dsn, environment: import.meta.env.MODE, release: import.meta.env.VITE_SENTRY_RELEASE, tracesSampleRate: 0, beforeSend })`
- [x] 1.3 `beforeSend`: descartar eventos cujo `hint.originalException instanceof SessaoExpiradaError`; nunca anexar e-mail do usuário nem token

## 2. Integração

- [x] 2.1 `src/main.tsx`: `iniciarSentry()` antes de `createRoot(...).render(...)`
- [x] 2.2 Error boundary envolvendo `<App/>` que renderiza um fallback pt-BR ("Algo quebrou nesta tela. Recarregue a página." + botão "Recarregar") e reporta via `Sentry.captureException`

## 3. Testes

- [x] 3.1 Teste: `iniciarSentry()` sem `VITE_SENTRY_DSN` não chama `Sentry.init` (mock do módulo `@sentry/react`)
- [x] 3.2 Teste do error boundary: um filho que lança renderiza o fallback pt-BR e dispara a captura
- [x] 3.3 `npm test` + `npm run build` + `npm run lint` verdes; confirmar que `setupTests.ts` deixa o Sentry inerte

## 4. Deploy e documentação

- [x] 4.1 `.github/workflows/deploy.yml`: `VITE_SENTRY_DSN` (secret) e `VITE_SENTRY_RELEASE=${{ github.sha }}` no step de build
- [x] 4.2 `AGENTS.md`: registrar `@sentry/react` e o motivo (rastreamento de erros aprovado)
