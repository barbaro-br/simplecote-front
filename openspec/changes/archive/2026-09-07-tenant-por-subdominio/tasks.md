> **Pré-requisitos no ar** (07/set/2026): wildcard `*.simplecote.app` + `app.simplecote.app` no projeto `simplecote-front`; `GET /public/compradores/{slug}/existe`; CORS de `*.simplecote.app`; claim `slug` no JWT; cookie de refresh. A change pode seguir — a seção 0 é back/infra (já entregue), não implementar aqui.

## 0. Pré-requisitos

- [ ] 0.1 (`simplecote-back`) coluna `slug` única em `Comprador` — ver `cadastro-publico-self-service`
- [ ] 0.2 (`simplecote-back`) `GET /public/compradores/{slug}/existe` → booleano (só confirma o slug; sem branding, sem dado sensível)
- [ ] 0.3 (`simplecote-back`) CORS aceitando origem dinâmica cobrindo o app (`.app`) e o site (`.com.br`): `^https://([a-z0-9-]+\.)?simplecote\.(com\.br|app)$` — ver `auth-refresh-token`
- [ ] 0.4 (`simplecote-back`) slug do `Comprador` disponível ao front (claim no JWT ou `GET /api/configuracoes`)
- [ ] 0.5 (infra Vercel) domínio `*.simplecote.app`, `app.simplecote.app` neste projeto; `simplecote.app` com NS delegado à Vercel; DNS wildcard
- [ ] 0.6 depende de `sessao-longa-com-refresh-token` (o cookie do refresh é da API, `Domain` de `.simplecote.com.br`; o app em `.app` só usa `credentials: 'include'` — ver `auth-refresh-token`)

## 1. Resolução do slug

- [x] 1.1 `src/shared/tenant/slug-do-hostname.ts`: extrai o slug de `<slug>.simplecote.app`; trata `app`/`www`/apex/`localhost`/`backoffice`/multi-nível/preview como "sem loja"; override por `?tenant=`/`VITE_TENANT_SLUG` fora de produção
- [x] 1.2 `src/shared/tenant/tenant.api.ts`: `useSlugExiste(slug)` → `GET /public/compradores/{slug}/existe` (booleano; sem branding)
- [x] 1.3 `src/shared/tenant/tenant-context.ts` + `TenantContext.tsx` + `useTenant.ts`: expõe `slug`, `existe`, `verificando`, `ehHostDoApp`
- [x] 1.4 `src/App.tsx`: `TenantProvider` acima do router

## 2. Subdomínio inexistente

- [x] 2.1 `src/admin/login/LoginPage.tsx`: sem branding de loja; quando `useTenant().existe === false`, renderiza "esse endereço de loja não existe" + link para o site
- [x] 2.2 Enquanto `verificando`, `RouteLoadingFallback` no lugar do formulário

## 3. Guarda e redirecionamentos

- [x] 3.1 `src/shared/auth/AuthGuard.tsx`: sessão **e** slug do hostname === `slug` do JWT; divergência em host do app → redirect full-page pro subdomínio do JWT (preservando path) ou logout (slug do JWT desconhecido); fora do app (dev/preview) não redireciona
- [x] 3.2 Pós-login em host neutro → redirect pro `<slug>.simplecote.app` (implementado no `AuthGuard`, ponto único, não no `AuthContext`); logout já preserva o subdomínio (navigate relativo `/login`)
- [x] 3.3 `routes.tsx`: `/` segue `Navigate to="/admin"` — o `AuthGuard` cobre os dois casos (sessão em host neutro → subdomínio; sem sessão → `/login` da loja). Sem mudança de path
- [x] 3.4 Rotas públicas por token seguem funcionando em host neutro (não usam `useTenant`/`AuthGuard`; o token resolve o inquilino)

## 4. Testes

- [x] 4.1 `slug-do-hostname.test.ts`: `<slug>.simplecote.app`, apex, `app.`, `www.`, `localhost`, preview `*.vercel.app`, subdomínio multi-nível
- [x] 4.2 `login.test.tsx`: identidade SimpleCote (sem `GET /api/configuracoes`); slug inexistente → "esse endereço de loja não existe"
- [x] 4.3 `AuthGuard.tenant.test.tsx` + `decidirRedirectTenant` (unit): slug × JWT divergente não renderiza o painel e redireciona/desloga
- [x] 4.4 `AuthGuard.tenant.test.tsx`: slug × JWT iguais → painel normal
- [x] 4.5 host neutro com sessão → redireciona (coberto no `AuthGuard.tenant.test.tsx`); logout mantém o subdomínio (comportamento existente do `navigate('/login')`)
- [x] 4.6 `/cotacao/:token` em host neutro carrega normalmente (rotas públicas intocadas; coberto pela suíte existente)

## 5. Checagem de saúde

- [x] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual (com wildcard no ar): cadastrar loja com slug, verificar e-mail, logar em `<slug>.simplecote.app`; tentar `<outro-slug>.simplecote.app/admin` logado e ver o bloqueio; abrir um link `/cotacao/:token` em `app.`
