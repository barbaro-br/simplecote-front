> **BLOQUEADA** até: (1) `simplecote.app` registrado e delegado à Vercel + wildcard `*.simplecote.app` "Valid Configuration"; (2) `sessao-longa-com-refresh-token` e `cadastro-publico-e-slug` aplicadas. Ver `RISCOS-TRANSVERSAIS.md` §0 e §J. É a **fase 4** — não começar antes.

## 0. Pré-requisitos

- [ ] 0.1 (`simplecote-back`) coluna `slug` única em `Comprador` — ver `cadastro-publico-self-service`
- [ ] 0.2 (`simplecote-back`) `GET /public/compradores/{slug}/existe` → booleano (só confirma o slug; sem branding, sem dado sensível)
- [ ] 0.3 (`simplecote-back`) CORS aceitando origem dinâmica cobrindo o app (`.app`) e o site (`.com.br`): `^https://([a-z0-9-]+\.)?simplecote\.(com\.br|app)$` — ver `auth-refresh-token`
- [ ] 0.4 (`simplecote-back`) slug do `Comprador` disponível ao front (claim no JWT ou `GET /api/configuracoes`)
- [ ] 0.5 (infra Vercel) domínio `*.simplecote.app`, `app.simplecote.app` neste projeto; `simplecote.app` com NS delegado à Vercel; DNS wildcard
- [ ] 0.6 depende de `sessao-longa-com-refresh-token` (o cookie do refresh é da API, `Domain` de `.simplecote.com.br`; o app em `.app` só usa `credentials: 'include'` — ver `auth-refresh-token`)

## 1. Resolução do slug

- [ ] 1.1 `src/shared/tenant/slug-do-hostname.ts`: extrai o slug de `<slug>.simplecote.app`; trata `app`/`www`/apex/`localhost`/`backoffice` como "sem loja"; override por `?tenant=`/`VITE_TENANT_SLUG` fora de produção
- [ ] 1.2 `src/shared/tenant/tenant.api.ts`: `useSlugExiste(slug)` → `GET /public/compradores/{slug}/existe` (booleano; sem branding)
- [ ] 1.3 `src/shared/tenant/TenantContext.tsx` + `useTenant.ts`: expõe `slug`, `existe`, `verificando`
- [ ] 1.4 `src/main.tsx`/`App.tsx`: `TenantProvider` acima do router; `RouteLoadingFallback` enquanto verifica

## 2. Subdomínio inexistente

- [ ] 2.1 `src/admin/login/LoginPage.tsx`: **não** aplicar branding de loja (já garantido por `identidade-simplecote-e-da-loja`); quando `useTenant().existe === false`, renderizar "esse endereço de loja não existe" (com identidade SimpleCote) + link para o site principal
- [ ] 2.2 Enquanto `verificando`, `RouteLoadingFallback` no lugar do formulário

## 3. Guarda e redirecionamentos

- [ ] 3.1 `src/shared/auth/AuthGuard.tsx`: exigir sessão **e** slug do hostname === `Comprador` do JWT; divergência → redirect para o subdomínio do JWT (se conhecido) ou logout com aviso
- [ ] 3.2 `src/shared/auth/AuthContext.tsx`: pós-login em host neutro → `window.location` para `<slug>.simplecote.app`; logout mantém o subdomínio (vai para `/login` da loja)
- [ ] 3.3 `src/routes.tsx`: `/` com sessão em host neutro → redireciona ao subdomínio da loja; `/` em `<slug>` sem sessão → login da loja
- [ ] 3.4 Rotas públicas por token continuam funcionando em host neutro, sem exigir subdomínio

## 4. Testes

- [ ] 4.1 `slug-do-hostname`: `<slug>.simplecote.app`, apex, `app.`, `www.`, `localhost`, preview `*.vercel.app`, subdomínio multi-nível
- [ ] 4.2 `LoginPage`: segue com identidade SimpleCote (nenhuma chamada a `GET /api/configuracoes`); slug inexistente → "esse endereço de loja não existe"
- [ ] 4.3 `AuthGuard`: slug × JWT divergente não renderiza o painel e redireciona/desloga
- [ ] 4.4 `AuthGuard`: slug × JWT iguais → painel normal
- [ ] 4.5 `/` com sessão em `app.` → redireciona ao subdomínio; logout mantém o subdomínio
- [ ] 4.6 `/cotacao/:token` em `app.simplecote.app` carrega normalmente

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual (com wildcard no ar): cadastrar loja com slug, verificar e-mail, logar em `<slug>.simplecote.app`; tentar `<outro-slug>.simplecote.app/admin` logado e ver o bloqueio; abrir um link `/cotacao/:token` em `app.`
