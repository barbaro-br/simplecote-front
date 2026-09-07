## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Coluna `slug` única em `Comprador`
- [ ] 0.2 `POST /public/cadastro` — recebe nome, slug, e-mail, senha; cria `Comprador` em modo TESTE (com prazo) e com o `slug`, `Usuario` OWNER, dispara e-mail de verificação; rejeita e-mail já usado e slug já usado/reservado com `ProblemDetail` pt-BR
- [ ] 0.3 `GET /public/compradores/validar-slug?slug=...` — retorna livre / em uso / reservado
- [ ] 0.4 Endpoint de verificação de e-mail (token) e política de bloqueio de login enquanto não verificado (com mensagem clara)
- [ ] 0.5 Papel `OWNER` no modelo de `Usuario`

## 1. API client e schema

- [x] 1.1 `src/shared/domain/slug.ts` (extraído pra `shared/`): `nomeParaSlug(nome)` (minúsculas, sem acento, hífens) + lista de palavras reservadas + helpers `dominioDaLoja`/`urlLoginDaLoja` — compartilhado com `tenant-por-subdominio`
- [x] 1.2 `src/admin/cadastro/cadastro.schema.ts`: zod (nomeSupermercado, slug com regex/formato, email, senha ≥ 8) espelhando a Bean Validation do `PublicCadastroDTO`
- [x] 1.3 `src/admin/cadastro/cadastro.api.ts`: `useCadastrar` (`POST /public/cadastro`), `useValidarSlug(slug)` (`GET /public/compradores/validar-slug`), `useVerificarEmail(token)`

## 2. Tela de cadastro

- [x] 2.1 `src/admin/cadastro/CadastroPage.tsx`: formulário react-hook-form + zod; campo de senha com revelar/ocultar e indicador de tamanho ao vivo (mesmo padrão de `admin/usuarios`)
- [x] 2.2 Campo de slug: sugestão a partir do nome, re-normalização ao digitar, prévia `<slug>.simplecote.app`, check debounced (`useDebounce` de `src/shared/hooks/`) com estados livre / em uso / reservado / inválido
- [x] 2.3 Submit bloqueado enquanto o slug não estiver válido e livre, ou durante a requisição; erro do backend (`ApiError.message`) no formulário
- [x] 2.4 Sucesso → tela "confira seu e-mail"

## 3. Tela de verificação de e-mail

- [x] 3.1 `src/admin/cadastro/VerificarEmailPage.tsx`: lê `token` da URL, chama a verificação no mount
- [x] 3.2 Sucesso → leva para `https://<slug>.simplecote.app/login` com mensagem de conta ativa (o `slug` vem da resposta da verificação)
- [x] 3.3 Token inválido/expirado → tela única "Este link é inválido ou expirou" + botão "Ir para o login" (sem reenviar; o reenvio é follow-up do back)

## 4. Rotas e entrada

- [x] 4.1 `src/routes.tsx`: `/cadastro` e `/verificar-email` como irmãs de `/login` (sem `AuthGuard`, sem `AdminLayout`)
- [x] 4.2 `src/admin/login/LoginPage.tsx`: link "Criar conta" → `/cadastro`

## 5. Testes

- [x] 5.1 `CadastroPage.test.tsx`: validação de campos; e-mail inválido e senha curta não enviam
- [x] 5.2 `CadastroPage.test.tsx`: nome "Supermercado do Zé" sugere `supermercado-do-ze`; check retorna em uso/reservado bloqueia o envio; livre habilita
- [x] 5.3 `CadastroPage.test.tsx`: sucesso mostra "confira seu e-mail"; erro de e-mail duplicado aparece no formulário
- [x] 5.4 `VerificarEmailPage.test.tsx`: token válido → link para `<slug>.simplecote.app/login`; token inválido → mensagem clara
- [x] 5.5 `LoginPage`: link "Criar conta" navega para `/cadastro`

## 6. Checagem de saúde

- [x] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual com o back: cadastrar um supermercado novo escolhendo o slug, ver a prévia do domínio, receber o e-mail, verificar, logar em `<slug>.simplecote.app` e confirmar que a conta entra vazia e em modo de teste
