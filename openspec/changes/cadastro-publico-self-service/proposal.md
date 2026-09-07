## Why

Hoje um supermercado novo só entra no SimpleCote se alguém do time provisiona o primeiro admin à mão (`BootstrapAdminRunner`, via variáveis de ambiente no back). Isso é "um cliente de cada vez" — não é SaaS. Falta uma porta de entrada pública: o dono do supermercado se cadastra sozinho, cai numa conta nova e isolada (`Comprador` próprio), e começa a usar em modo de teste.

## What Changes

- Nova rota pública **`/cadastro`**, fora do `AuthGuard` e do shell do admin (ao lado de `/login` e `/esqueci-senha`), com formulário: **nome do supermercado**, **endereço da loja (slug)**, **e-mail**, **senha** (mínimo 8, com revelar/ocultar e indicador de tamanho ao vivo — mesmo padrão de `admin/usuarios`).
- **Slug (endereço da loja)**: ao digitar "Supermercado do Zé", o front sugere `supermercado-do-ze` e mostra a prévia `supermercado-do-ze.simplecote.app`. O campo é editável, normalizado (minúsculas, sem acento, hífens) e validado com um check *debounced* em `GET /public/compradores/validar-slug?slug=...` (livre / em uso / reservado). O envio fica bloqueado até o slug ser válido e livre.
- Ao enviar, `POST /public/cadastro` (nome, slug, e-mail, senha): o back cria um `Comprador` novo em modo **TESTE** (com prazo de teste) e com esse `slug`, cria o `Usuario` `OWNER` vinculado a ele, e dispara um e-mail de verificação. O front então mostra uma tela de "confira seu e-mail".
- Nova rota pública **`/verificar-email`** (aberta pelo link do e-mail, com token): confirma o e-mail via API e, em sucesso, leva para o **login da loja** — `https://<slug>.simplecote.app/login` — com uma mensagem de conta ativada; token inválido/expirado mostra mensagem clara, sem formulário quebrado.
- `/login` ganha um link discreto "Criar conta" apontando para `/cadastro`.
- A área pública por token (representante/colaborador) não é afetada.
- Resolução do slug pelo hostname, tela de login com a cara da loja e a guarda slug × JWT são a change `tenant-por-subdominio` — esta aqui só garante que a loja **nasce com um slug único**.

## Capabilities

### Added Capabilities

- `admin/cadastro`: fluxo público de auto-cadastro de um novo supermercado (cria `Comprador` + `OWNER` em modo de teste) e verificação de e-mail.

### Modified Capabilities

- `core/setup`: requirement "Roteamento isolado por perfil" — a área pública passa a incluir as rotas anônimas `/cadastro` e `/verificar-email`, sem shell de admin e sem guarda de sessão.

## Impact

- `src/routes.tsx`: rotas `/cadastro` e `/verificar-email` como irmãs de `/login` (sem `AuthGuard`, sem `AdminLayout`).
- Novos `src/admin/cadastro/CadastroPage.tsx`, `cadastro.schema.ts` (zod espelhando a Bean Validation do `PublicCadastroDTO`, incluindo o formato do slug), `cadastro.api.ts` (`POST /public/cadastro`, `useValidarSlug`).
- Novo `src/admin/cadastro/slug.ts` (ou em `shared`): normalização "nome → slug" e a lista de palavras reservadas (`app`, `www`, `api`, `admin`, `login`, `mail`…), compartilhada com `tenant-por-subdominio`.
- Campo de slug com prévia do domínio, `useDebounce` (já existe em `src/shared/hooks/`) para o check, e estados livre / em uso / reservado / inválido.
- Novos `src/admin/cadastro/VerificarEmailPage.tsx` e a chamada de verificação (`POST /public/cadastro/verificar` ou `GET` com token — alinhar com o back); em sucesso, redireciona para `https://<slug>.simplecote.app/login`.
- `src/admin/login/LoginPage.tsx`: link "Criar conta".
- Reuso do campo de senha com revelar/indicador já existente em `src/admin/usuarios/` (extrair para `shared` se ainda acoplado).
- Testes: `CadastroPage.test.tsx` (validação de campos; sugestão de slug a partir do nome; check debounced marca em uso/reservado/livre; envio bloqueado com slug inválido; sucesso → "confira seu e-mail"; erro do back no formulário), `VerificarEmailPage.test.tsx` (token válido → mensagem + destino `<slug>.simplecote.app/login`; token inválido → mensagem clara).
- **Contrato com o `simplecote-back`**: coluna `slug` única em `Comprador`; `POST /public/cadastro` (nome + slug + e-mail + senha → cria `Comprador` TESTE + `Usuario` OWNER + e-mail de verificação; rejeita e-mail já usado e slug já usado/reservado com `ProblemDetail` pt-BR); `GET /public/compradores/validar-slug?slug=...` (livre / em uso / reservado); endpoint de verificação de e-mail; papel `OWNER`. Sem verificação confirmada, o login pode ser barrado pelo back — alinhar a mensagem.
- **E-mail (back)**: envio pelo Brevo com o subdomínio já autenticado **`mail.simplecote.com.br`** (e-mail continua no `.com.br`, ver `RISCOS-TRANSVERSAIS.md` §0). Remetente fixo (ex.: `cotacoes@mail.simplecote.com.br`) com **display name dinâmico** = nome da loja, e **`Reply-To` = e-mail do `OWNER`**. DMARC de `simplecote.com.br` já publicado em `p=none` — apertar para `p=quarantine` após ~2 semanas de observação.
