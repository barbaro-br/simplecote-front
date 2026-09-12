## 1. Persistência por aba

- [x] 1.1 `idDaAba()` (id em `window.name`) + `chaveTokenSuporte()` sufixada por ele
- [x] 1.2 `lerTokenSuporteSalvo`/`salvarTokenSuporte` migram de `sessionStorage` pra `localStorage`
- [x] 1.3 `limparTokensExpirados()`: varre e remove entradas de outras abas já expiradas a cada gravação
- [x] 1.4 `ClaimsSessao.exp` em `jwt.ts` (decodificação do JWT no front)

## 2. Testes

- [x] 2.1 `jwt.test.ts`: decodifica `exp`
- [x] 2.2 `AuthContext.test.tsx`: token salvo/lido pela chave por aba (adapta os 4 testes existentes de `sessionStorage` pra `localStorage`)
- [x] 2.3 Token salvo por outra aba (`window.name` diferente) não é lido nesta
- [x] 2.4 `salvarTokenSuporte` remove tokens de suporte já expirados de outras abas
- [x] 2.5 `npx tsc --noEmit`, `oxlint`, `vitest run` (suíte completa) e `npm run build` verdes
