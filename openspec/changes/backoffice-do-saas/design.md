## Context

Ver `proposal.md` — Why. O isolamento por `comprador_id` (via `JwtCompradorIdResolver` + `@Filter`/RLS da change `reforcar-isolamento-multitenant`) é justamente o que o backoffice precisa **contornar de forma controlada** para enxergar todos os tenants.

## Goals / Non-Goals

**Goals**
- Uma área que o cliente nunca descobre existir.
- Impersonação rastreável, com limite de tempo e com sinal visual permanente.

**Non-Goals**
- Backoffice como app/deploy separado (abordagem 2) — fica para quando o time de suporte crescer; hoje o custo não se paga.
- Métricas de produto / dashboards de MRR — outra frente.
- Edição de dados de domínio do cliente pelo backoffice (produtos, cotações) — só via impersonação, para tudo ficar na trilha de auditoria normal.

## Decisions

- **`SUPER_ADMIN` sem `comprador_id` (abordagem 1), no mesmo backend.** Um `Usuario` com `comprador_id` nulo e papel `SUPER_ADMIN`. Alternativa (tenant fantasma) foi considerada e rejeitada: adiciona um `Comprador` "mágico" que todo código de listagem/relatório precisa lembrar de excluir. Nulo é explícito e o `CompradorIdResolver` trata o caso separando "rota de backoffice" de "rota de tenant".
- **Rotas `/api/admin/compradores` fora do filtro de inquilino.** São as únicas rotas que rodam sem `SET app.tenant_id` / sem `@Filter` ativo, e são barradas por papel `SUPER_ADMIN` no security config. Mantê-las num controller/pacote separado deixa a exceção visível na revisão.
- **Impersonação = novo token, não "assumir" o claim.** "Entrar como suporte" chama o back, que emite um JWT novo com `comprador_id` do alvo, um claim `impersonatedBy: <superAdminId>` e `exp` curto (ex.: 30 min). O front guarda a sessão anterior para restaurar. Assim o `JwtCompradorIdResolver` funciona sem exceção no caminho `/admin/**`, e o back audita toda ação pelo claim `impersonatedBy`.
- **Tarja de modo suporte dirigida pelo claim `impersonatedBy`.** O `AuthContext` expõe `modoSuporte` quando o claim está presente; um componente no `AdminLayout` renderiza a tarja e o botão de sair. Não depende de estado local que se perde no reload.
- **Terceira árvore de rotas, não uma seção de `/admin`.** Público, layout e guarda diferentes — mesma razão pela qual `/cotacao/:token` não vive dentro de `/admin`.
- **Host reservado `backoffice.simplecote.app` (com `tenant-por-subdominio`).** Não é um `<slug>` de loja; o `slug-do-hostname` trata `backoffice` como host reservado e o `BackofficeGuard` recusa `/backoffice` servido de um subdomínio de loja. Impersonar redireciona (via `window.location`) para `<slug-do-alvo>.simplecote.app/admin`, já com o token de suporte na sessão — o cookie de refresh é da API (`api.simplecote.com.br`) e o browser o reenvia via `SameSite=None` no salto de host; "sair do modo suporte" volta para `backoffice.simplecote.app`.

## Risks / Trade-offs

- **Rota fora do filtro é o ponto mais perigoso do sistema** → controller isolado, teste que garante `403` para não-`SUPER_ADMIN`, e revisão obrigatória de qualquer PR que toque nesse pacote.
- **Sessão de suporte esquecida aberta** → `exp` curto force o retorno; a tarja permanente reduz o risco de agir achando que é outra conta.
- **Reload no modo suporte** → o token de suporte é a sessão corrente; o claim `impersonatedBy` sobrevive ao reload, então a tarja reaparece. "Sair do modo suporte" precisa do token anterior guardado — se o `SUPER_ADMIN` fechou a aba, ele só refaz o login normal (aceitável).
- **Impersonação + refresh token** (change `sessao-longa-com-refresh-token`) → o refresh do token de suporte deve manter `exp` curto e não estender além do limite; alinhar com o back.

## Migration Plan

1. Back: papel `SUPER_ADMIN`, controller `/api/admin/compradores` fora do filtro, emissão do token de suporte + auditoria.
2. Criar o primeiro `SUPER_ADMIN` por seed/migration (equivalente ao `BootstrapAdminRunner`, mas sem `comprador_id`).
3. Front: guarda + telas + impersonação.
4. Rollback: remover a árvore `/backoffice` do `routes.tsx`; as rotas do back ficam inertes sem UI.
