## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 id/slug do `Comprador` disponível ao front (claim no JWT ou `GET /api/configuracoes`)
- [ ] 0.2 `GET /api/organizacao/exportacao` — arquivo portável com os dados do `Comprador`
- [ ] 0.3 `DELETE /api/organizacao` — soft-delete + purga agendada + invalidação das sessões do `Comprador`
- [ ] 0.4 Tag de `Comprador` nos logs/eventos do próprio back

## 1. Contexto de inquilino no Sentry

- [ ] 1.1 `src/shared/observability/sentry.ts`: `definirCompradorTag(id)` / `limparCompradorTag()` via `setTag('comprador', …)` — sem nome/e-mail/telefone
- [ ] 1.2 `src/shared/auth/AuthContext.tsx`: chamar no login, no boot com sessão restaurada e no logout
- [ ] 1.3 Garantir que rotas públicas por token não setam a tag

## 2. Exportar dados da organização

- [ ] 2.1 `configuracoes.api.ts`: `exportarDadosOrganizacao()` via `baixarArquivo('/api/organizacao/exportacao', …)`
- [ ] 2.2 `src/admin/configuracoes/ExportarDadosCard.tsx`: botão com progresso e erro; seção "Dados & privacidade" em `ConfiguracoesPage.tsx`
- [ ] 2.3 Visível só para `OWNER`/`ADMIN` (`useAuth().role`)

## 3. Encerrar a organização

- [ ] 3.1 `configuracoes.api.ts`: `encerrarOrganizacao()` via `DELETE /api/organizacao`
- [ ] 3.2 `src/admin/configuracoes/EncerrarContaCard.tsx`: confirmação forte (digitar o nome do supermercado), consequência nomeada
- [ ] 3.3 Sucesso → encerra a sessão e navega para uma tela "conta encerrada"
- [ ] 3.4 Visível só para `OWNER`

## 4. Testes

- [ ] 4.1 Evento carrega `tag.comprador` com sessão; não carrega sem sessão; logout limpa
- [ ] 4.2 Nenhum dado pessoal na tag
- [ ] 4.3 `ExportarDadosCard`: aciona a API e dispara o download; erro do back aparece; oculto para `OPERADOR`
- [ ] 4.4 `EncerrarContaCard`: botão só habilita com o nome correto; confirma → `DELETE` + sessão encerrada; oculto para não-`OWNER`

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: provocar um erro logado e conferir a tag no Sentry; exportar e abrir o arquivo; encerrar uma conta de teste
