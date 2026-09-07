## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `POST /api/admin/compradores/{id}/excluir` (SUPER_ADMIN) — purga imediata do Comprador, 204 (change `backoffice-excluir-comprador`)

## 1. API

- [ ] 1.1 `src/backoffice/backoffice.api.ts`: `useExcluirComprador()` → `POST /api/admin/compradores/{id}/excluir`; invalida a query da lista

## 2. Excluir loja no detalhe

- [ ] 2.1 `src/backoffice/CompradorDetalhePage.tsx`: seção "Zona de perigo" com "Excluir loja permanentemente" — texto nomeando a consequência (apaga tudo, sem carência)
- [ ] 2.2 Confirmação forte: campo que exige o `slug` exato da loja; o botão de excluir fica desabilitado até bater
- [ ] 2.3 Erro do backend (`ApiError.message`) na tela; sucesso → `navigate('/backoffice')` + toast "Loja excluída"

## 3. Entrada do backoffice

- [ ] 3.1 Onde o `/` decide (`src/site/Raiz.tsx`): sem sessão, se o host é do app e reservado do backoffice (`backoffice.*`, via `ehHostDoApp` + `SLUGS_RESERVADOS`/parsing de `src/shared/domain/slug.ts`), renderizar `<Navigate to="/login" replace />` em vez de `HomePage`. Hosts de marketing/loja não mudam
- [ ] 3.2 `LoginPage` em `backoffice.*` segue com identidade SimpleCote (já garantido); pós-login o `SUPER_ADMIN` cai em `/backoffice` (comportamento atual do `AuthGuard`)

## 4. Testes

- [ ] 4.1 `backoffice.test.tsx`: excluir com o slug errado → botão desabilitado; slug certo → confirma → chama a API e navega para `/backoffice`; erro do backend aparece na tela
- [ ] 4.2 Roteamento: host `backoffice.simplecote.app` sem sessão → renderiza o login (não a home institucional); host de marketing sem sessão → home

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual: no backoffice, abrir uma loja de teste, excluir digitando o slug, confirmar que some da lista; abrir `backoffice.simplecote.app` numa aba anônima e ver o login
