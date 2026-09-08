## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `POST /api/admin/compradores/{id}/reenviar-verificacao` (`204`) e `admins[].emailVerificado` no detalhe — change `backoffice-reenviar-verificacao`

## 1. API e schema

- [x] 1.1 `backoffice.schema.ts`: `Admin` ganha `emailVerificado: boolean`
- [x] 1.2 `backoffice.api.ts`: `useReenviarVerificacao(id)` → `POST .../reenviar-verificacao`; invalida `['backoffice','comprador',id]` no sucesso

## 2. UI no detalhe

- [x] 2.1 `CompradorDetalhePage.tsx`, seção administradores: por admin, selo "verificado" / "não verificado"
- [x] 2.2 Para admin não verificado: botão "Reenviar verificação" → `useReenviarVerificacao`; estado carregando; sucesso → toast "E-mail de verificação reenviado"; erro do back → toast
- [x] 2.3 Nenhum botão quando todos os admins estão verificados

## 3. Testes

- [x] 3.1 `backoffice.test.tsx`: mock com OWNER `emailVerificado: false` → botão presente; clicar chama `POST .../reenviar-verificacao` e dispara o toast
- [x] 3.2 `backoffice.test.tsx`: mock com todos verificados → sem botão

## 4. Checagem de saúde

- [x] 4.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 4.2 Verificação manual com o back: abrir uma loja com OWNER não verificado, reenviar, conferir o e-mail chegando — **pendente**: o back `backoffice-reenviar-verificacao` ainda não está no ar
