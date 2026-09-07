## Context

Ver `proposal.md` — Why. Já existem os padrões necessários: rotas públicas anônimas (`/login`, `/esqueci-senha`), fluxo de token por e-mail (`admin/recuperar-senha`) e o campo de senha com revelar/indicador (`admin/usuarios`).

## Goals / Non-Goals

**Goals**
- Uma conta nova nasce isolada (novo `Comprador`) e em modo de teste, sem intervenção manual.
- Reusar os padrões de auth existentes, sem inventar conceito novo.

**Non-Goals**
- Login social / SSO.
- Escolha de plano no cadastro — entra em teste; assina depois (`planos-e-cobranca`).
- Onboarding guiado pós-cadastro — é a change `onboarding-primeiro-acesso`.
- Resolução do slug pelo hostname, login com branding da loja e guarda slug × JWT — é a change `tenant-por-subdominio`. Aqui só se garante que a loja **nasce com um slug único**.
- Renomear o slug depois de criado (imutável nesta versão).

## Decisions

- **Após cadastrar, ir para "confira seu e-mail" e depois para o login da loja (`<slug>.simplecote.app/login`), não auto-login.** O back exige e-mail verificado antes de liberar o painel; auto-login daria uma sessão que quebra na primeira chamada. Alternativa (auto-login + banner "verifique seu e-mail") foi considerada — rejeitada por complicar o estado de sessão parcial. Trade-off: um passo a mais para o usuário, em troca de um fluxo linear.
- **`/cadastro` e `/verificar-email` como irmãs de `/login`**, fora do `AuthGuard` e do `AdminLayout` — mesma razão de `/login` não viver dentro de `/admin`. Ficam num host neutro (`app.simplecote.app` / apex), já que o visitante ainda não tem loja.
- **O `Comprador` é criado inteiramente pelo back a partir do formulário.** O front nunca envia nem escolhe `compradorId` (regra da change `reforcar-isolamento-multitenant`); o `slug` é o único identificador de endereço que o visitante escolhe.
- **Slug: sugerido do nome, editável, normalizado, verificado com debounce.** `nomeParaSlug` (minúsculas, sem acento via `normalize('NFD')`, não-alfanumérico → hífen, colapsa hífens). O check chama `GET /public/compradores/validar-slug` com `useDebounce` (já existe em `src/shared/hooks/`) — ~400 ms. O back é a autoridade (a corrida entre check e submit é resolvida por ele, com `ProblemDetail` de slug em uso); o front só melhora a UX antes do envio.
- **Palavras reservadas numa lista única (`slug.ts`)** compartilhada com `tenant-por-subdominio`: `app`, `www`, `api`, `admin`, `login`, `mail`, `static`, `assets`, `cdn`, `status`, `blog`… O back valida a mesma lista (fonte da verdade lá).
- **Schema Zod espelha a Bean Validation do `PublicCadastroDTO`** — mensagens pt-BR iguais às do `ProblemDetail`, incluindo o formato do slug (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, 3–40 chars).

## Risks / Trade-offs

- **E-mail de verificação que não chega** (spam, provedor) → a tela `/verificar-email` oferece "reenviar"; considerar também um aviso na `/login` quando o back recusa por não verificado.
- **Cadastro repetido com o mesmo e-mail** → o back rejeita com `ProblemDetail`; o front só exibe. Não revelar se o e-mail já tem conta além do que o back disser.
- **Abuso / cadastros em massa** → CAPTCHA/rate-limit é decisão do back (Vercel Firewall + limite por IP); o front deixa o ponto de extensão, não implementa agora.
- **Slug bom escolhido às pressas** → imutável por ora; trocar é operação de suporte (backoffice). Um redirect 301 do slug antigo pode vir depois.
- **Redirect para `<slug>.simplecote.app/login` antes de o wildcard estar no ar** → enquanto a infra de subdomínio não existe (change `tenant-por-subdominio`), o destino cai em `app.simplecote.app/login`; o cadastro em si (criar `Comprador` com slug) não depende do wildcard.

## Migration Plan

1. Back entrega a coluna `slug`, `POST /public/cadastro` (com slug), `GET /public/compradores/validar-slug`, verificação e papel `OWNER`.
2. Front adiciona as rotas, o campo de slug e as telas.
3. O `BootstrapAdminRunner` continua existindo para casos internos; os dois caminhos coexistem (o bootstrap também passa a definir um `slug`).
4. Rollback: remover as rotas `/cadastro` e `/verificar-email` do `routes.tsx` e o link no `LoginPage`; a coluna `slug` no back é inócua sem o cadastro.

## Fora do escopo / follow-up

- **Reenvio do e-mail de verificação.** A tela de token inválido/expirado é um beco sem saída até o back expor `POST /public/cadastro/reenviar-verificacao`. Hoje ela mostra "Este link é inválido ou expirou" + "Ir para o login": se o token já foi usado (conta verificada) o login funciona direto; se expirou, o usuário cai no `403` "confirme seu e-mail" do login. O par (front + back) fecha o reenvio numa change futura.
