> **BLOQUEADA** — fase 4. Não começar antes de: `simplecote.app` registrado + delegado à Vercel + wildcard `*.simplecote.app` "Valid Configuration"; e `sessao-longa-com-refresh-token` + `cadastro-publico-self-service` aplicadas. Ver `RISCOS-TRANSVERSAIS.md` §0 e §J.

## Why

Hoje o `Comprador` da sessão vem só do JWT — a URL não diz em qual loja o usuário está. Para o SimpleCote parecer um SaaS de verdade (padrão Slack/Notion/Jira), cada loja logada ganha o próprio endereço: **`<slug>.simplecote.app`**. O endereço vira ativo da loja (link compartilhável, base para domínio próprio no futuro) sem que o front precise reescrever rota nenhuma — o `React Router` continua em `/cotacoes`, `/produtos`; quem carrega o slug é o navegador. A identidade visual antes do login continua sendo sempre SimpleCote (ver `identidade-simplecote-e-da-loja`); só o endereço muda.

Isso exige uma coluna `slug` única no `Comprador` (escolhida no cadastro — ver `cadastro-publico-self-service`) e a resolução desse slug pelo hostname no front.

## What Changes

- **Resolução do slug pelo hostname**: no boot, o front lê `window.location.hostname`, extrai o slug (`<slug>.simplecote.app`) e o expõe via um `TenantContext`. Hosts sem slug (`app.simplecote.app`, apex, `localhost`) são tratados como "sem loja no endereço".
- **Tela de login: identidade SimpleCote, sempre.** Em `<slug>.simplecote.app/login` a tela é igual à de `app.simplecote.app/login` — "SimpleCote" / "Cotações simplificadas", sem branding de loja, sem `GET /api/configuracoes` (ver `identidade-simplecote-e-da-loja`). O front *pode* validar o slug do hostname contra o back para pegar um subdomínio digitado errado → mensagem "esse endereço de loja não existe" (com cara de SimpleCote) + link para o site.
- **Guarda slug × JWT**: o slug do hostname é só exibição e roteamento; a **autoridade sobre o inquilino continua sendo o JWT**. Se o slug da URL não corresponde ao `Comprador` do JWT, o front NÃO mostra o painel — redireciona para o subdomínio correto (quando dá para inferir) ou desloga com aviso. Nunca "confia" no slug para trocar de tenant.
- **Redirecionos de entrada**:
  - `app.simplecote.app` / apex, **com** sessão → manda para `<slug>.simplecote.app` do `Comprador` do JWT.
  - `<slug>.simplecote.app`, **sem** sessão → tela de login daquela loja.
  - Logout volta para a tela de login **da mesma loja** (mantém o subdomínio).
- **Rotas públicas por token** (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`) permanecem num host neutro (`app.simplecote.app`) — o token já identifica o `Comprador` e assim o link do representante não depende de `SIMPLECOTE_BASE_URL` por loja. (Link do representante com o subdomínio da loja fica como evolução.)
- **Infra**: domínio wildcard `*.simplecote.app` na Vercel apontando para este projeto; CORS do back aceitando origem `https://*.simplecote.app`.

## Capabilities

### Added Capabilities

- `core/multitenancy`: resolução do `Comprador` pelo subdomínio `<slug>.simplecote.app` — leitura do slug pelo hostname, tratamento de subdomínio inexistente, e a guarda que mantém o JWT como única autoridade sobre o inquilino.

## Impact

- Novo `src/shared/tenant/`: `TenantContext.tsx` / `useTenant.ts` (slug do hostname; existe/não existe), `tenant.api.ts` (`GET /public/compradores/{slug}/existe` — só valida, não traz branding), `slug-do-hostname.ts` (parsing + hosts neutros).
- `src/main.tsx` / `src/App.tsx`: montar o `TenantProvider` acima do router; enquanto carrega os dados públicos da loja, mostrar `RouteLoadingFallback`.
- `src/admin/login/LoginPage.tsx`: sem branding de loja (já garantido por `identidade-simplecote-e-da-loja`); só adiciona o estado "endereço de loja não existe" quando `useTenant()` diz que o slug do hostname não resolve.
- `src/shared/auth/AuthGuard.tsx`: além de exigir sessão, checar slug do hostname × `Comprador` do JWT; divergência → redirect/logout com aviso.
- `src/shared/auth/AuthContext.tsx`: pós-login, se o host atual não é o da loja, redirecionar para `<slug>.simplecote.app`; logout preserva o subdomínio.
- `src/routes.tsx`: sem mudança de path do admin; ajustar apenas os redirects de `/` (com sessão em host neutro → subdomínio da loja).
- `src/index.css` / `ConfiguracaoLojaProvider`: a cor de marca pode ser aplicada já na tela de login (hoje só depois de logar).
- Testes: parse do slug (subdomínio, apex, `app.`, `localhost`, multi-nível); login segue com identidade SimpleCote (sem `GET /api/configuracoes`); slug inexistente → "endereço de loja não existe"; guarda bloqueia slug × JWT divergente; `/` com sessão em host neutro redireciona ao subdomínio; logout mantém o subdomínio.
- **Infra (fora do código)**: adicionar `*.simplecote.app` em *Vercel → Domains* deste projeto; DNS wildcard; deixar `app.simplecote.app` e o apex definidos.
- **Contrato com o `simplecote-back`**: coluna `slug` única em `Comprador` (ver `cadastro-publico-self-service`); `GET /public/compradores/{slug}/existe` (só confirma se o slug existe — sem branding, sem dado sensível); CORS aceitando `https://*.simplecote.app` com origem dinâmica; o back inclui o slug num claim ou em `GET /api/configuracoes` para a guarda comparar.
