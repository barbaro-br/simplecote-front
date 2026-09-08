## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `POST /api/admin/compradores/{id}/excluir` (SUPER_ADMIN) — purga imediata do Comprador, 204 (change `backoffice-excluir-comprador`)

## 1. API

- [x] 1.1 `src/backoffice/backoffice.api.ts`: `useExcluirComprador()` → `POST /api/admin/compradores/{id}/excluir`; invalida a query da lista

## 2. Excluir loja no detalhe

- [x] 2.1 `src/backoffice/CompradorDetalhePage.tsx`: seção "Zona de perigo" com "Excluir loja permanentemente" — texto nomeando a consequência (apaga tudo, sem carência)
- [x] 2.2 Confirmação forte: campo que exige o `slug` exato da loja; o botão de excluir fica desabilitado até bater
- [x] 2.3 Erro do backend (`ApiError.message`) na tela (fecha o diálogo); sucesso → `navigate('/backoffice')` + toast "Loja excluída"

## 3. Entrada do backoffice

- [x] 3.1 `src/site/Raiz.tsx`: sem sessão, se o host é do app e é o backoffice (`ehHostBackoffice`, reusa `slug-do-hostname.ts`/`slug.ts`) → `<Navigate to="/login" replace />` em vez de `HomePage`
- [x] 3.2 `LoginPage` em `backoffice.*` segue com identidade SimpleCote (sem mudança)

## 4. Testes

- [x] 4.1 `backoffice.test.tsx`: excluir com o slug errado → botão desabilitado; slug certo → confirma → chama a API e navega para `/backoffice`; erro do backend aparece na tela
- [x] 4.2 `raiz-backoffice.test.tsx`: host `backoffice.simplecote.app` sem sessão → login (não a home); host de marketing sem sessão → home

## 5. Checagem de saúde

- [x] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual: no backoffice, abrir uma loja de teste, excluir digitando o slug, confirmar que some da lista; abrir `backoffice.simplecote.app` numa aba anônima e ver o login
