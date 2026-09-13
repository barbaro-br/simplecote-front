# Riscos transversais das changes de SaaS

Ler **antes de implementar qualquer change** da transformação em SaaS. São armadilhas que aparecem em várias changes ao mesmo tempo — decisões já tomadas e acoplamentos que o texto de uma change isolada não deixa óbvio.

> Este arquivo é idêntico no `simplecote-front` e no `simplecote-back` — ao editar um, edite o outro. Onde o texto de uma change conflitar com a **§0 (Mapa de domínios)**, a §0 vence.

---

## §0. Mapa de domínios (autoritativo)

Decidido em set/2026. Muitas changes ainda dizem `<slug>.simplecote.com.br` / `app.simplecote.com.br` para o **app** — leia como abaixo.

| Uso | Host | Onde |
|---|---|---|
| **App autenticado (painel)** | `<slug>.simplecote.app` | Vercel, projeto `simplecote-front`, wildcard `*.simplecote.app` |
| **Host neutro do app** (login sem loja, rotas públicas por token, destino de sessão órfã) | `app.simplecote.app` | idem |
| **Backoffice** (`SUPER_ADMIN`) | `backoffice.simplecote.app` | idem (host reservado no parser de slug) |
| **Site institucional / marketing** | `simplecote.com.br` + `www.simplecote.com.br` | Vercel, mesmo projeto |
| **API** | `api.simplecote.app` | Heroku — mesmo site do app (mudou de `api.simplecote.com.br` em 13/set/2026: ver nota abaixo) |
| **Envio de e-mail** | `mail.simplecote.com.br` | Brevo — **não muda** |

Porquê `.app` e não `.com.br` para o app: domínio wildcard na Vercel exige os nameservers da Vercel; delegar `simplecote.com.br` inteiro é arriscado (e-mail + API vivem nele). `simplecote.app` é um domínio novo, sem e-mail nem API, delegado 100% à Vercel — risco zero. Marketing e API continuam em `.com.br`.

**Consequências para as changes:**
- Parser de hostname (`tenant-por-subdominio`): sufixo do app = `.simplecote.app` (não `.simplecote.com.br`). `app`, `www`, `backoffice` = hosts sem slug.
- Redirect pós-verificação de e-mail (`cadastro-publico-*`): `https://<slug>.simplecote.app/login`. **Wildcard já no ar** (07/set/2026 — `*.simplecote.app` + `app.simplecote.app` no projeto `simplecote-front`). Follow-up: `urlLoginDaLoja` no front ainda está hardcoded; devia ler o sufixo de env pra não vazar `.simplecote.app` em preview/local.
- **Cookie do refresh** (`auth-refresh-token`): setado **pela API** (`api.simplecote.app`) → `Domain=.simplecote.app`, mesmo site (eTLD+1) do app — cookie first-party. **Correção 13/set/2026:** até então a API respondia em `api.simplecote.com.br` (site diferente do app) e a suposição antes registrada aqui — "o browser envia o cookie pra API via `SameSite=None` independentemente da origem" — **era falsa na prática**: navegadores com bloqueio de cookie de terceiros ativo por padrão (Safari, Firefox) ou em rollout (Chrome) recusavam o cookie mesmo com `SameSite=None`, e o refresh falhava silenciosamente depois de qualquer navegação de página inteira (ex.: o redirect de tenant do `AuthGuard` pro subdomínio da loja) — o usuário parecia deslogado sozinho e tinha que logar de novo. Ver §D. O que ainda muda com o app em `.app` é o **CORS**: `allowedOriginPatterns` tem que aceitar `https://*.simplecote.app` **e** `https://simplecote.com.br` (marketing) — padrão `^https://([a-z0-9-]+\.)?simplecote\.(com\.br|app)$`.
- `backoffice-*`: host `backoffice.simplecote.app`; impersonar redireciona para `<slug-do-alvo>.simplecote.app/admin`.
- **Infra (fase 4, não antes):** `simplecote.app` JÁ COMPRADO via Vercel (set/2026, NS da Vercel). Falta só adicionar `*.simplecote.app` + `app.simplecote.app` + `backoffice.simplecote.app` ao projeto `simplecote-front`. Até lá tudo serve de `app.simplecote.com.br` como hoje e o slug fica inerte.

---

## §A. A lista `BYPASSRLS` é viva

`isolamento-rls-por-comprador` cria o papel `simplecote_system` com uma **enumeração fechada** de operações que rodam fora da RLS (login/recuperação, derivação de token público, varreduras agendadas, bootstrap/seeds). Changes posteriores **acrescentam** a essa enumeração — cada adição é review obrigatório:

| Change | Operação que entra na enumeração |
|---|---|
| `cadastro-publico-e-slug` | `POST /public/cadastro` (cria `Comprador` antes de existir tenant) |
| `backoffice-super-admin` | leituras cross-tenant de `/api/admin/compradores` |
| `observabilidade-e-lgpd-por-tenant` | `PurgaCompradorJob` (varredura + delete cross-tenant) |
| `planos-cobranca-e-nfse` | `POST /webhooks/pagamento` (anônimo, resolve o `compradorId` do evento) |

Regra: nenhum caminho novo roda sob `simplecote_system` sem entrar na enumeração da capability `comprador/isolamento-rls` e sem grant mínimo correspondente.

## §B. Uma cadeia de interceptors em `/api/**`

Três coisas passam a interceptar `/api/**`. Ordem e isenções documentadas num só ponto:

1. `TenantSessionAspect` — `SET LOCAL app.current_comprador` (de `isolamento-rls-por-comprador`).
2. **`403` suspensão administrativa** — `Comprador` com `suspenso_em` (de `backoffice-super-admin`).
3. **`402` inadimplência** — `status_assinatura ∈ {INADIMPLENTE, CANCELADA}` (de `planos-cobranca-e-nfse`).

`403` e `402` são semânticas distintas (uma o SaaS reverte, a outra o cliente resolve pagando). **Ambos SHALL liberar `/api/auth/**`** (senão o cliente não loga nem para pagar). O `402` também libera `/api/assinatura/**`. Ao implementar o 2º/3º, não quebre o anterior — teste que `/api/auth/logout` passa nos dois estados.

## §C. `PapelUsuario` cresce duas vezes

- `cadastro-publico-e-slug` adiciona `OWNER`. Conta como admin na regra "último admin ativo". Não é criável pelo CRUD nem convidável — só nasce no cadastro público.
- `backoffice-super-admin` adiciona `SUPER_ADMIN`. `comprador_id` nulo (único caso). **Fora** da hierarquia `OWNER > ADMIN > OPERADOR` (é outro eixo). Só nasce por `--bootstrap-super-admin`.

Cada adição: **grep de todo `switch (papel)` / `hasRole` / `hasAuthority` / uso do enum** (regra 5). Um `switch` sem `default` quebra com o valor novo.

## §D. Cookie `SameSite=None; Secure` e dev local

`auth-refresh-token`: em produção o cookie do refresh é `SameSite=None; Secure; Domain=.simplecote.app`. Em `http://localhost` isso não roda (Secure sobre http). **Fallback no perfil dev/teste:** `SameSite=Lax`, sem `Secure`, sem `Domain`. Config: `simplecote.auth.cookie.*` com valores diferentes por perfil.

**Histórico:** até 2026-09-13 a API respondia em `api.simplecote.com.br` — um site (eTLD+1) diferente do app (`*.simplecote.app`) — e por isso esse cookie, mesmo com `SameSite=None`, era tratado como cookie de terceiros por navegadores com bloqueio ativado (Safari/Firefox por padrão, Chrome em rollout). Login funcionava (o token de acesso vem no corpo da resposta), mas qualquer navegação de página inteira depois (ex.: o redirect de tenant do `AuthGuard` do front pro subdomínio da loja) perdia a sessão porque o refresh via cookie falhava silenciosamente, mandando o usuário de volta pro `/login`. Corrigido apontando a API pra `api.simplecote.app` (mesmo site do app) e o `Domain` do cookie pra `.simplecote.app` — cookie first-party, sem depender de bloqueio de terceiros. `api.simplecote.com.br` continua registrado no Heroku por compatibilidade, mas não deve mais ser usado como `VITE_API_BASE_URL`.

**CSRF:** só `POST /api/auth/refresh` e `POST /api/auth/logout` leem o cookie. **Todo o resto de `/api/**` confia só no header `Authorization`** — nunca no cookie. Um POST cross-site forçado no `refresh` só consegue disparar uma rotação (chato, não catastrófico) e não lê a resposta (token novo vai no corpo, não em cookie).

## §E. O front vai decodificar o JWT

Hoje o front guarda só a string opaca do token. `papeis-e-convites-da-organizacao` (precisa de `role`) e `backoffice-do-saas` (precisa de `impersonatedBy`) exigem ler claims. Decisão a tomar **na primeira dessas changes**: `atob` do payload do JWT no cliente (sem lib) vs. endpoint `GET /api/organizacao/eu`. Escolher uma e as duas changes usam a mesma.

## §F. Backfill de coluna `NOT NULL UNIQUE` em linhas existentes

`cadastro-publico-e-slug` adiciona `comprador.slug`. `isolamento-rls-por-comprador` adiciona `comprador_id` nas tabelas-filhas. Toda migration desse tipo:
- backfill determinístico **antes** do `NOT NULL`;
- desambiguação de colisão no próprio SQL/Java (`slug`, `slug-2`, `slug-3`…);
- idempotente (re-rodar não quebra);
- testar com dados adversários (nomes que geram o mesmo slug, acentos, símbolos);
- o `Comprador` de dev / do `--bootstrap-admin` também é afetado.

## §G. Refatorar código compartilhado sem mudar comportamento

- `SeedDadosDev` → `SeedExemploComprador` (`onboarding-estado-e-dados-exemplo`): extrair o núcleo parametrizado por `compradorId` com **zero** mudança no caminho de boot do perfil dev. Rodar a suíte dev.
- Lookup de CNPJ de `empresa` reusado em `dados_faturamento` (`planos-cobranca-e-nfse`): verificar que o hook/serviço de lookup é reusável fora do form de empresa.
- `planos.ts` compartilhado entre `site-institucional-e-precos` e `planos-e-cobranca` (front): fonte única; a change de cobrança **importa**, não duplica.
- Lista de slugs reservados: duplicada front/back (repos separados). **O back é a fonte da verdade**; o front é só pré-check de UX.

## §H. Timeout de 30s do router do Heroku

`observabilidade-e-lgpd-por-tenant`: `GET /api/organizacao/exportacao` pode gerar um arquivo grande. Decidir **antes de codar**: limite de linhas → acima dele responde `202` e envia por e-mail; abaixo, download direto. Não construir só o caminho síncrono.

## §I. Telas anônimas: entrada de conta ≠ superfície de link mágico

`identidade-simplecote-e-da-loja`: a regra "antes do login = sempre SimpleCote" vale para as **telas de entrada de conta** (`/login`, `/esqueci-senha`, `/cadastro`, `/verificar-email`) e o site. **Não** vale para as telas de trabalho por link mágico (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`) — essas podem mostrar o nome da loja como **contexto de domínio** (de qual loja é a cotação), vindo do endpoint público do token, nunca de `GET /api/configuracoes`, e sem aplicar a cor de marca como casca.

## §J. Dependências de ordem entre changes

Não começar uma antes da(s) sua(s) dependência(s):

- `sessao-longa-com-refresh-token` (back `auth-refresh-token`) **antes de** `planos-e-cobranca` (o ramo `402` assenta sobre o fluxo de `401`/refresh no `api-client`).
- `cadastro-publico-e-slug` **depois de** `isolamento-rls-por-comprador` (usa `BYPASSRLS` no insert do `Comprador`).
- `backoffice-super-admin` **depois de** `auth-refresh-token` (mexe no `RefreshTokenService`/`AuthController`) e de `isolamento-rls-por-comprador` (papel `BYPASSRLS`).
- `observabilidade-e-lgpd-por-tenant` **depois de** `auth-refresh-token` (revoga `refresh_token` no encerramento).
- `tenant-por-subdominio` (front) **bloqueada** até o domínio `.app` estar registrado e o wildcard no ar (fase 4).
- `papeis-e-convites` / `backoffice-do-saas` (front) dependem da decisão §E (decode do JWT).

## §K. O pointcut do `TenantSessionAspect` é por TIPO, nunca `bean(*Repository)`

(Back.) O ramo de repositório do `@Around` do `TenantSessionAspect` **SHALL** ser `this(org.springframework.data.repository.Repository) && execution(* *(..))` — match por tipo. `bean(*Repository)` casa pelo **nome do bean sendo proxyado no momento**, e o AspectJ cacheia o shadow-match por `(pointcut, método)` num cache de processo: métodos de ciclo de vida de `FactoryBean` (`isSingleton` no `LocalContainerEntityManagerFactoryBean`, no `RepositoryFragmentsFactoryBean`) herdam um "match" cacheado, o `EntityManagerFactory` acaba embrulhado pelo aspecto e dá ciclo de criação de bean (`BeanCurrentlyInCreationException`). O ciclo só **detona quando se soma mais um repositório** — travou `auth-refresh-token`. Toda change que adiciona um `*Repository` reexercita isto (rodar `IsolamentoCompradorIT` + `TenantSessionAspectTest` + `TenantHibernateFilterTest` + suíte completa). Corrigido fora do escopo da RLS durante `auth-refresh-token`.
