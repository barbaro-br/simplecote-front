## Why

Um erro de JavaScript no navegador do cliente hoje é invisível — não há rastreamento no front. O que já é tratado (`SessaoExpiradaError`, `ApiError`) segue tratado; o que escapa (erro de render, bug de estado, promessa rejeitada, chunk que falha ao carregar) some sem sinal. Para operar um cliente real é preciso enxergar isso.

## What Changes

- Adicionar `@sentry/react` ao front (dependência nova — **aprovada pelo usuário para esta change**, conforme `AGENTS.md`).
- O DSN vem de `VITE_SENTRY_DSN` (variável de build); **sem DSN o Sentry não inicializa** — dev e testes não mudam.
- `environment` = `import.meta.env.MODE`; `release` = SHA do commit (via env do CI).
- Inicializar em `main.tsx` antes do render; um error boundary envolvendo `<App/>` com fallback em pt-BR ("Algo quebrou nesta tela. Recarregue a página." + botão de recarregar).
- `beforeSend`: descartar `SessaoExpiradaError` (transitório, já tratado com redirect); nunca anexar e-mail do usuário nem token de link.
- `tracesSampleRate` 0 (só erros).

## Capabilities

### New Capabilities

- `core/rastreamento-de-erros`: reportar erros de runtime do front a um serviço externo (Sentry), ativável só por variável de build, com error boundary de fallback em pt-BR, sem PII.

### Modified Capabilities

(nenhuma)

## Impact

- `package.json`: `@sentry/react` (nova dependência — aprovada).
- Novo `src/shared/observability/sentry.ts`: `iniciarSentry()` idempotente, no-op sem `VITE_SENTRY_DSN`; `beforeSend` filtra `SessaoExpiradaError`.
- `src/main.tsx`: chama `iniciarSentry()` antes de `createRoot(...).render(...)`; envolve `<App/>` num error boundary que renderiza o fallback pt-BR e reporta via `Sentry.captureException`.
- `.github/workflows/deploy.yml`: `VITE_SENTRY_DSN` (secret) + `VITE_SENTRY_RELEASE=${{ github.sha }}` no step de build; opcional: upload de source maps.
- `vite.config.ts`: sem mudança obrigatória; se subir source maps, `build.sourcemap='hidden'`.
- `src/setupTests.ts`: não define `VITE_SENTRY_DSN` → Sentry inerte nos testes.
- `AGENTS.md` (seção de dependências / "Mocks e pendências"): registrar `@sentry/react` e o motivo.
- Testes: `iniciarSentry()` no-op sem DSN; o error boundary renderiza o fallback pt-BR quando um filho lança e dispara a captura.
