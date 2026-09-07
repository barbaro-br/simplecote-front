# SimpleCote → SaaS — roadmap e decisões

Documento-mestre da transformação do SimpleCote (hoje mono-inquilino, provisionado "um cliente por vez" via `--bootstrap-admin`) em SaaS multi-inquilino self-service. Registra a visão, as decisões tomadas, a ordem de execução e o estado da infra.

Ler junto: **`openspec/RISCOS-TRANSVERSAIS.md`** (armadilhas e convenções entre changes).

---

## Visão

O `Comprador` (supermercado) **já é** o tenant — toda tabela tem `comprador_id`, o `JwtCompradorIdResolver` isola por token. Falta o self-service em volta: cadastro público, endereço por loja, papéis/convites, cobrança, backoffice, conformidade e site. Nenhuma change reintroduz tenancy — o grosso é a "casca" de SaaS.

---

## Decisões (log)

| Tema | Decisão | Porquê |
|---|---|---|
| **Isolamento de dados** | Schema compartilhado + `comprador_id` + **Postgres RLS** (`FORCE`) + `@Filter` do Hibernate. Papel `simplecote_system` (`BYPASSRLS`) para um conjunto **enumerado** de operações de sistema. **Não** banco/schema por tenant. | Já é o modelo; banco por tenant no Heroku = add-on por cliente, migrations N×, cadastro lento. RLS torna o schema compartilhado seguro para concorrentes. |
| **Cobertura da RLS** | RLS nas 11 tabelas de tenant, incluindo as 6 filhas (`item_cotacao`, `participante`, `lance`, `pedido`, `item_pedido`, `correcao_lance`) via `comprador_id` **denormalizado**. | Sem denormalizar, um `findById` cru numa filha escaparia da garantia. |
| **Endereço por loja** | **Subdomínio**: `<slug>.simplecote.app`. Host neutro `app.simplecote.app`. Backoffice `backoffice.simplecote.app`. | Não reescreve rota nenhuma no React Router (o navegador carrega o slug). Padrão Slack/Notion/Jira. |
| **TLD do app** | **`simplecote.app`** (comprado via Vercel — ver Infra). Marketing e API continuam em `.com.br`. | Domínio wildcard na Vercel exige NS da Vercel; delegar `simplecote.com.br` inteiro é arriscado (e-mail + API vivem nele). `simplecote.app` é novo, sem e-mail/API, delegado 100% à Vercel — risco zero. |
| **Slug** | Coluna `slug` única em `comprador`, `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, 3–40, fora de lista de reservados. Escolhido no cadastro. **Imutável** por ora (trocar = suporte). Backfill dos existentes na migration. |  |
| **Sessão** | Access token curto **em memória** + refresh token opaco (só hash no banco) em cookie `httpOnly` **da API** (`Domain=.simplecote.com.br`, `SameSite=None; Secure`). Rotação single-use, sem grace window. Dev/teste: `SameSite=Lax`, sem `Secure`. Só `/api/auth/refresh` e `/logout` leem o cookie. | Sessão longa sem atrito; o app em `.app` envia o cookie à API via `SameSite=None` + `credentials:'include'`. |
| **Identidade visual** | Antes do login = sempre **SimpleCote** (login, esqueci-senha, cadastro, verificar-email, site). Depois do login = identidade da loja (nome no shell, cor de marca, título da aba `<loja> · SimpleCote`). Telas de link mágico (`/cotacao/:token` etc.) mostram o nome da loja como **contexto de domínio** (do endpoint do token), sem cor de marca. |  |
| **Papéis** | `OWNER` (quem cadastrou; um por Comprador; não rebaixável/inativável). `SUPER_ADMIN` (operador do SaaS; `comprador_id` nulo; fora da hierarquia do Comprador). Hierarquia `OWNER > ADMIN > OPERADOR`. `OPERADOR` não vê Membros nem Cobrança. |  |
| **Convites** | Convidar por e-mail + papel → `/convite/:token` define a senha → entra vinculado ao Comprador. Um usuário pertence a **uma** loja (1:1). |  |
| **E-mail** | Brevo, domínio `mail.simplecote.com.br` (já autenticado, DKIM ok). **Não** rodar servidor SMTP próprio. Remetente fixo (`cotacoes@mail.simplecote.com.br`) + display name = nome da loja + **`Reply-To` = e-mail do `OWNER`**. DMARC de `simplecote.com.br` já em `p=none` → apertar `p=quarantine` em ~2 semanas. Receber e-mail (`suporte@`) = Zoho/Workspace separado, depois. |  |
| **Cobrança** | **Última fase.** Não bloqueia colocar cliente em teste. Gateway atrás de interface `GatewayPagamento` (Stripe / Asaas / Pagar.me — decisão de negócio pendente). Webhook = fonte da verdade do `status_assinatura`. `402` para inadimplente em `/api/**` (libera auth + assinatura). Quota por plano enforçada no service. |  |
| **NFS-e** | Dados fiscais (CNPJ + lookup, endereço + `codigo_municipio_ibge`) coletados **ao assinar**, não no cadastro. Emissão via interface `EmissorNotaFiscal` (middleware fiscal — NFE.io/Focus/PlugNotas/eNotas — ou registro manual do contador no começo). Código de serviço LC 116 + alíquota de ISS = definir com contador. | O front nunca toca em cartão nem emite nota. |
| **Backoffice** | Abordagem 1 — papel `SUPER_ADMIN` no mesmo backend, rotas `/api/admin/compradores` fora do filtro de tenant. Impersonação = token de suporte novo (`impersonatedBy` claim, exp curto, auditado). Não é app separado por ora. |  |

---

## Roadmap — ordem, repo, workspace no dsh

Dentro de cada linha: **back primeiro, depois o front**. **Uma change por sessão** no dsh.

| # | `simplecote-back` (workspace simplecote-back) | `simplecote-front` (workspace simplecote-front) | Infra (1× você) |
|---|---|---|---|
| 1 | — | `identidade-simplecote-e-da-loja` | — |
| 2 | `isolamento-rls-por-comprador` | `reforcar-isolamento-multitenant` | — |
| 3 | `auth-refresh-token` | `sessao-longa-com-refresh-token` | — |
| 4 | `cadastro-publico-e-slug` | `cadastro-publico-self-service`, depois `tenant-por-subdominio` | wildcard `*.simplecote.app` + `app.simplecote.app` no projeto Vercel |
| 5 | `organizacao-papeis-e-convites` | `papeis-e-convites-da-organizacao` | — |
| 6 | `onboarding-estado-e-dados-exemplo` | `onboarding-primeiro-acesso` | — |
| 7 | `backoffice-super-admin` | `backoffice-do-saas` | `backoffice.simplecote.app` no projeto Vercel |
| 8 | `observabilidade-e-lgpd-por-tenant` | `observabilidade-e-conformidade-por-tenant` | — |
| 9 | — | `site-institucional-e-precos` | — (apex + www já na Vercel) |
| 10 | `planos-cobranca-e-nfse` | `planos-e-cobranca` | — |

- Linha 3 **antes** da 4 (decisão do cookie). Linha 10 por último — tem bloco "0. Decisões de negócio" (gateway, planos, ISS).
- Depois de cada change: `openspec validate <nome> --strict` + Handoff. Revisão do diff + `openspec archive` = com o Claude Code.
- Fluxo de replan: agente sinaliza furo → replaneja proposal/design/tasks → Claude Code revisa → implementa. (Já pegou: RLS deny-by-default, `ColaboradorPage`.)

**MVP de SaaS = linhas 1–4 + site simples (9).**

---

## Infra — estado

| Item | Estado |
|---|---|
| `api.simplecote.com.br` → Heroku (back) | ✅ |
| `mail.simplecote.com.br` → Brevo (DKIM) | ✅ |
| `_dmarc.simplecote.com.br` = `p=none` + reporting Brevo | ✅ — apertar `p=quarantine` em ~2 semanas |
| `simplecote.com.br` (apex) + `www` → Vercel, projeto `simplecote-front` | ✅ (apex 308→www) |
| `app.simplecote.com.br` → Vercel (app hoje) | ✅ — vira redirect pro `.app` na fase 4 |
| **`simplecote.app` — domínio comprado via Vercel** | ✅ **comprado** (set/2026). NS já são da Vercel. |
| `*.simplecote.app` + `app.simplecote.app` + `backoffice.simplecote.app` no projeto | ⬜ adicionar na **fase 4** (Add Domain → "Connect to environment: Production", sem redirect) |
| Provisionar o cliente da semana via `--bootstrap-admin` | ⬜ (não depende de nenhuma change) |

---

## Ferramentas de implementação (dsh)

- Implementação das changes = **DeepSeek Harness** (`dsh web`, :3080), workspaces `simplecote-front` e `simplecote-back` adicionados. Modelo default `deepseek-v4-pro` (effort `max`).
- **Memória**: Memorix MCP ligado via `~/.dsh/profiles/web/cordis.patch.yml` (backup `.bak`). Store local sqlite em `~/.memorix/data`, **compartilhado** entre os dois repos (cwd fixado em `simplecote-front`). Semear com o mapa de módulos + fatia de referência + este roadmap; guardar o Handoff de cada change.
- `.rgignore` nos dois repos (discovery mais rápido).
- `AGENTS.md` dos dois: passo 0 do apply = ler `RISCOS-TRANSVERSAIS.md`.
- Guard de loop (`repeat-tool-reminder`) e retry de LLM (`llm-retry`) já vêm ligados no `dsh-base`.
