## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Coluna `slug` única em `Comprador`
- [ ] 0.2 `POST /public/cadastro` — recebe nome, slug, e-mail, senha; cria `Comprador` em modo TESTE (com prazo) e com o `slug`, `Usuario` OWNER, dispara e-mail de verificação; rejeita e-mail já usado e slug já usado/reservado com `ProblemDetail` pt-BR
- [ ] 0.3 `GET /public/compradores/validar-slug?slug=...` — retorna livre / em uso / reservado
- [ ] 0.4 Endpoint de verificação de e-mail (token) e política de bloqueio de login enquanto não verificado (com mensagem clara)
- [ ] 0.5 Papel `OWNER` no modelo de `Usuario`

## 1. API client e schema

- [ ] 1.1 `src/admin/cadastro/slug.ts` (ou `shared`): `nomeParaSlug(nome)` (minúsculas, sem acento, hífens) + lista de palavras reservadas — compartilhado com `tenant-por-subdominio`
- [ ] 1.2 `src/admin/cadastro/cadastro.schema.ts`: zod (nomeSupermercado, slug com regex/formato, email, senha ≥ 8) espelhando a Bean Validation do `PublicCadastroDTO`
- [ ] 1.3 `src/admin/cadastro/cadastro.api.ts`: `useCadastrar` (`POST /public/cadastro`), `useValidarSlug(slug)` (`GET /public/compradores/validar-slug`), `useVerificarEmail(token)`

## 2. Tela de cadastro

- [ ] 2.1 `src/admin/cadastro/CadastroPage.tsx`: formulário react-hook-form + zod; campo de senha com revelar/ocultar e indicador de tamanho ao vivo (reusar de `admin/usuarios`, extrair para `shared` se necessário)
- [ ] 2.2 Campo de slug: sugestão a partir do nome, re-normalização ao digitar, prévia `<slug>.simplecote.app`, check debounced (`useDebounce` de `src/shared/hooks/`) com estados livre / em uso / reservado / inválido
- [ ] 2.3 Submit bloqueado enquanto o slug não estiver válido e livre, ou durante a requisição; erro do backend (`ApiError.message`) no formulário
- [ ] 2.4 Sucesso → tela "confira seu e-mail"

## 3. Tela de verificação de e-mail

- [ ] 3.1 `src/admin/cadastro/VerificarEmailPage.tsx`: lê `token` da URL, chama a verificação no mount
- [ ] 3.2 Sucesso → redireciona para `https://<slug>.simplecote.app/login` com mensagem de conta ativa (o `slug` vem da resposta da verificação)
- [ ] 3.3 Token inválido/expirado → mensagem clara + ação de reenviar verificação, sem formulário quebrado

## 4. Rotas e entrada

- [ ] 4.1 `src/routes.tsx`: `/cadastro` e `/verificar-email` como irmãs de `/login` (sem `AuthGuard`, sem `AdminLayout`)
- [ ] 4.2 `src/admin/login/LoginPage.tsx`: link "Criar conta" → `/cadastro`

## 5. Testes

- [ ] 5.1 `CadastroPage.test.tsx`: validação de campos; e-mail inválido e senha curta não enviam
- [ ] 5.2 `CadastroPage.test.tsx`: nome "Supermercado do Zé" sugere `supermercado-do-ze`; check retorna em uso/reservado bloqueia o envio; livre habilita
- [ ] 5.3 `CadastroPage.test.tsx`: sucesso mostra "confira seu e-mail"; erro de e-mail duplicado aparece no formulário
- [ ] 5.4 `VerificarEmailPage.test.tsx`: token válido → redireciona para `<slug>.simplecote.app/login`; token inválido → mensagem clara
- [ ] 5.5 `LoginPage`: link "Criar conta" navega para `/cadastro`

## 6. Checagem de saúde

- [ ] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual com o back: cadastrar um supermercado novo escolhendo o slug, ver a prévia do domínio, receber o e-mail, verificar, logar em `<slug>.simplecote.app` e confirmar que a conta entra vazia e em modo de teste
