## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `POST /api/admin/compradores/{id}/prazo` `{expiraEm|null}` (SUPER_ADMIN) — grava `trial_expira_em`; `GET .../compradores` e `.../{id}` devolvem `trialExpiraEm`; loja TESTE com prazo vencido → `403` `ProblemDetail` com `type`/`title` próprios em `/api/**` (libera `/api/auth/**`) — change `backoffice-prazo-de-teste`

## 1. API e formatação

- [ ] 1.1 `src/backoffice/backoffice.api.ts`: `useDefinirPrazo()` → `POST /api/admin/compradores/{id}/prazo`; invalida lista + detalhe
- [ ] 1.2 helper `prazoLabel(trialExpiraEm)` → `{ texto: "expira em 5 dias" | "expirou há 2 dias" | "sem prazo", nivel: 'ok'|'atencao'|'vencido' }` (`atencao` quando ≤ 7 dias)

## 2. Backoffice — prazo

- [ ] 2.1 `CompradorDetalhePage.tsx`: seção "Prazo de teste" — valor formatado + ações "+7 dias", "+30 dias", seletor de data e "remover prazo" → `useDefinirPrazo`; erro do backend na seção
- [ ] 2.2 `CompradoresPage.tsx`: coluna "Prazo" com badge por `nivel` (`atencao`/`vencido` destacados)

## 3. Cliente — tela de bloqueio

- [ ] 3.1 `src/shared/api/api-client.ts`: `class AcessoBloqueadoError extends Error { motivo: 'suspensao'|'prazo'; detail: string }`. No `processarRequisicao`, `403` autenticado (`token`, não `/api/auth/**`, não `/public/**`) cujo `ProblemDetail.type`/`title` casa com os de bloqueio → lança `AcessoBloqueadoError`; demais `403` seguem `ApiError`
- [ ] 3.2 `src/shared/auth/`: bridge que captura o `AcessoBloqueadoError` (via um handler injetável, como o `configurarSessaoExpirada`) → `logout()` do estado local NÃO (mantém a sessão pra poder deslogar da tela) → `navigate('/conta-bloqueada', { state: { motivo, detail } })`
- [ ] 3.3 `src/admin/**` ou `src/shared/`: `ContaBloqueadaPage.tsx` — identidade SimpleCote, título por `motivo` ("Conta suspensa" / "Período de teste encerrado"), o `detail` do backend, botão "Sair" (`logout` → `/login`)
- [ ] 3.4 `src/routes.tsx`: rota pública `/conta-bloqueada`

## 4. Testes

- [ ] 4.1 `backoffice.test.tsx`: "+30 dias" chama `POST .../prazo` com data ~30d à frente; "remover prazo" manda `expiraEm: null`; lista com `trialExpiraEm` no passado mostra badge "expirado"
- [ ] 4.2 `api-client.test.ts`: `403` com `type` de bloqueio → `AcessoBloqueadoError` (motivo certo); `403` comum → `ApiError`; `403` em `/api/auth/**` → não dispara o bridge
- [ ] 4.3 `ContaBloqueadaPage`: renderiza o `detail` recebido e o botão "Sair" leva ao `/login`

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: no backoffice, pôr o prazo de uma loja de teste no passado; logar nessa loja e ver a tela de bloqueio; estender o prazo e confirmar que o painel volta
