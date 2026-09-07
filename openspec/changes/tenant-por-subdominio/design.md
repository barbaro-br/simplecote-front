## Context

Ver `proposal.md` — Why. **Fase 4, bloqueada** até `simplecote.app` estar registrado + wildcard no ar (ver `RISCOS-TRANSVERSAIS.md` §0). Depende de: `cadastro-publico-self-service` (coluna `slug`, escolha no cadastro), `reforcar-isolamento-multitenant` (o back enforça `comprador_id` — o slug nunca é fronteira de segurança) e `sessao-longa-com-refresh-token` (o cookie do refresh é da API `api.simplecote.com.br`; o app em `.app` só usa `credentials: 'include'`).

## Goals / Non-Goals

**Goals**
- Cada loja logada num endereço próprio, sem reescrever rotas do `React Router`.
- Slug jamais dá acesso indevido; subdomínio digitado errado mostra mensagem clara.

**Non-Goals**
- Branding da loja na tela de login — decidido que antes do login é sempre SimpleCote (`identidade-simplecote-e-da-loja`).
- Domínio próprio do cliente (`compras.mercado.com.br`) — mesma base (CNAME + slug), mas é outra change/feature paga.
- Um usuário em várias lojas / seletor de loja — o cadastro é 1:1 (fora de escopo aqui).
- Mover as rotas públicas por token para o subdomínio da loja — fica como evolução (exigiria `SIMPLECOTE_BASE_URL` por loja).
- Renomear o slug depois de criado — imutável nesta versão (ver Riscos).

## Decisions

- **Subdomínio, não path.** Path (`/loja/...`) obrigaria prefixar toda rota e todo `<Link>` do sistema. Subdomínio deixa o `React Router` intacto: o slug vem de `window.location.hostname`. É o padrão Slack/Notion/Jira.
- **Slug lido do hostname, tenant confirmado pelo JWT.** O `TenantContext` expõe o slug para UI/roteamento; o `AuthGuard` compara com o `Comprador` do JWT. A regra "o front nunca deriva o inquilino" (de `reforcar-isolamento-multitenant`) continua valendo: as chamadas `/api/**` mandam só o JWT, nunca o slug.
- **Antes do login é sempre SimpleCote.** Decisão de produto: a tela de login não muda por loja (nome "SimpleCote", mote "Cotações simplificadas"), e não faz fetch de branding. O único uso pré-auth do slug é validar se o subdomínio existe — `GET /public/compradores/{slug}/existe`, resposta booleana, sem dado sensível — para trocar um "login que só vai falhar" por "esse endereço de loja não existe". A identidade da loja entra só depois do login (`identidade-simplecote-e-da-loja`).
- **Host neutro `app.simplecote.app` para o que não é de uma loja:** rotas públicas por token, e destino de sessão órfã. O site institucional fica no apex + `www` (ver `site-institucional-e-precos`).
- **Parsing do slug tolerante a ambientes.** `slug-do-hostname.ts` reconhece `<slug>.simplecote.app`, ignora `app`/`www`/apex, e em `localhost`/preview da Vercel usa um override (`?tenant=` ou `VITE_TENANT_SLUG`) para dev não depender de DNS wildcard local.
- **Cookie do refresh é da API, não do app.** Setado por `api.simplecote.com.br` (`Domain` de `.simplecote.com.br`), reenviado só para a API via `SameSite=None` + `credentials: 'include'` — funciona com o app em `<slug>.simplecote.app` sem novo login por subdomínio. Ver `auth-refresh-token`. O CORS do back ecoa a origem quando ela casa `^https://([a-z0-9-]+\.)?simplecote\.(com\.br|app)$` (app `.app` + site `.com.br`).

## Risks / Trade-offs

- **Alguém troca o slug na URL achando que "entra" na loja do concorrente** → o `AuthGuard` bloqueia (slug × JWT) e o back tem RLS/`@Filter`; nunca há acesso. Mitigação dupla, por design.
- **Slug imutável incomoda quem errou na hora do cadastro** → por ora, trocar é operação de suporte (backoffice); redirect 301 do slug antigo para o novo pode vir depois.
- **Wildcard TLS/DNS na Vercel** → suportado nativamente (adicionar `*.simplecote.app` em Domains), mas exige o domínio verificado na conta e um registro DNS wildcard. Sem isso, subdomínio novo dá erro de certificado.
- **Preview deploys da Vercel** (`*.vercel.app`) não têm o wildcard → tratados como host neutro + override de slug para QA.
- **Palavras reservadas** (`app`, `www`, `api`, `admin`, `login`, `mail`, `static`…) não podem virar slug de loja → lista compartilhada com a validação do cadastro.

## Migration Plan

1. Back: coluna `slug` (ver `cadastro-publico-self-service`), `GET /public/compradores/{slug}/existe`, CORS wildcard, slug no claim/configuracoes.
2. Infra: `*.simplecote.app` + `app.simplecote.app` + apex na Vercel; DNS.
3. Front: `TenantContext` + parsing + estado "endereço não existe" + guarda slug×JWT + redirects. Enquanto o wildcard não está no ar, `app.simplecote.app` serve tudo (comportamento atual) e o slug fica inerte.
4. Cliente atual: recebe um slug (migration) e passa a acessar `<slug>.simplecote.app`; um redirect de `app.` para o subdomínio dele cobre bookmarks antigos.
5. Rollback: front volta a ignorar o hostname (tudo em `app.`); nada quebra.

## Open Questions

- Link do representante passa a usar o subdomínio da loja? (decisão de produto; hoje fica em `app.` e não bloqueia nada)
- Slug editável no futuro com redirect 301 do antigo — quando/se.
