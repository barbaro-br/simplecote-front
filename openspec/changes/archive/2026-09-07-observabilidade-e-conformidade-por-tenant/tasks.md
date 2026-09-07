## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 id/slug do `Comprador` disponível ao front (claim no JWT ou `GET /api/configuracoes`)
- [ ] 0.2 `GET /api/organizacao/exportacao` — arquivo portável com os dados do `Comprador`
- [ ] 0.3 `DELETE /api/organizacao` — soft-delete + purga agendada + invalidação das sessões do `Comprador`
- [ ] 0.4 Tag de `Comprador` nos logs/eventos do próprio back

## 1. Contexto de inquilino no Sentry

- [x] 1.1 `src/shared/observability/sentry.ts`: `definirCompradorTag(id)` / `limparCompradorTag()` via `setTag('comprador', …)` — sem nome/e-mail/telefone
- [x] 1.2 `src/shared/auth/AuthContext.tsx`: `useEffect` em `compradorId` (claim) seta/limpa a tag — cobre login, boot com sessão restaurada e logout
- [x] 1.3 Rotas públicas por token não setam a tag (sem sessão → `compradorId` null → limpa)

## 2. Exportar dados da organização

- [x] 2.1 `configuracoes.api.ts`: `exportarDadosOrganizacao()` via `baixarArquivo('/api/organizacao/exportacao', …)`
- [x] 2.2 `src/admin/configuracoes/ExportarDadosCard.tsx`: botão com progresso e erro; aba "Dados & privacidade" em `ConfiguracoesPage.tsx`
- [x] 2.3 Visível só para `OWNER`/`ADMIN` (`useAuth().papel`)

## 3. Encerrar a organização

- [x] 3.1 `configuracoes.api.ts`: `encerrarOrganizacao()` via `DELETE /api/organizacao`
- [x] 3.2 `src/admin/configuracoes/EncerrarContaCard.tsx`: confirmação forte (digitar o nome do supermercado), consequência nomeada
- [x] 3.3 Sucesso → `logout()` + navega para `/conta-encerrada` (nova `ContaEncerradaPage.tsx`)
- [x] 3.4 Visível só para `OWNER`

## 4. Testes

- [x] 4.1 `sentry.test.tsx` + `sentry-tag.test.tsx`: evento carrega `tag.comprador` com sessão; não carrega sem sessão; logout limpa
- [x] 4.2 Nenhum dado pessoal na tag (id técnico, nunca slug/nome)
- [x] 4.3 `privacidade.test.tsx` (`ExportarDadosCard`): 200 dispara download; 202 avisa por e-mail; erro do back aparece; oculto para `OPERADOR`
- [x] 4.4 `privacidade.test.tsx` (`EncerrarContaCard`): botão só habilita com o nome correto; confirma → `DELETE` + sessão encerrada; oculto para não-`OWNER`

## 5. Checagem de saúde

- [x] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: provocar um erro logado e conferir a tag no Sentry; exportar e abrir o arquivo; encerrar uma conta de teste
