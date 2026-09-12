## 1. Aviso no AuthGuard

- [x] 1.1 `toast.warning` quando `papel === 'SUPER_ADMIN'` numa rota `/admin/**`, antes do redirect pro `/backoffice`

## 2. Testes

- [x] 2.1 `AuthGuard.test.tsx`: SUPER_ADMIN em `/admin` é mandado pro backoffice com o aviso
- [x] 2.2 `npx tsc --noEmit`, `oxlint`, `vitest run` (suíte completa) e `npm run build` verdes
