## Context

Ver `proposal.md` — Why. Estado atual:

- `api-client.ts`: `getBaseUrl() = import.meta.env.VITE_API_BASE_URL || ''`. Sem `.env`, base = `''` → chamadas relativas (`/api/...`).
- `vite.config.ts`: `server.proxy['/api'] → http://localhost:8080` (`changeOrigin`). Então em `npm run dev` sem `.env`, `/api/...` já cai no backend via proxy.
- Testes MSW casam `*/api/...` — funcionam com base `''` ou com host explícito.
- `AuthContext` faz `POST /api/auth/login {email, senha}` → `{ token }`; `AuthGuard` bloqueia `/admin/**` sem token.
- Backend: perfil `dev` tem `simplecote.auth.enabled=false` (`/api/**` liberado, `compradorId` fixo via `DevCompradorIdResolver`). Com auth ligada (`AUTH_ENABLED=true`), `/api/auth/login` autentica contra `Usuario`. `SeedDadosDev` cria `admin@dev.local` / `admin123` (ADMIN) — só nesse perfil.
- Backend sobe em `:8080` via `./mvnw spring-boot:test-run` (Testcontainers Postgres) — memória do projeto `simplecote-back`.

## Goals / Non-Goals

**Goals:**
- `npm run dev` conversa com o backend local sem config manual.
- Um roteiro reproduzível de "subir os dois e logar".
- Login → Produtos → Empresas verificados de verdade contra o servidor, com os bugs de contrato corrigidos.
- `spec.md` §7 refletindo a realidade + gap até a Fase 1.

**Non-Goals:**
- Construir Cotações ou a tela do representante (changes próprias).
- `.env.production` / deploy real.
- Suíte e2e automatizada (Playwright) — a verificação aqui é manual + os testes MSW existentes.
- Reintroduzir a "sessão de dev sem token" do `spec.md` §2 — o JWT existe agora, o caminho de demo é login real.

## Decisions

### 1. Demo roda com auth LIGADA no backend
O roteiro do README instrui subir o backend com `AUTH_ENABLED=true` e logar como `admin@dev.local` / `admin123`. Assim o `AuthGuard` e o header `Authorization` do front exercitam o caminho real, e o `compradorId` vem do JWT.

- Alternativa — backend dev com `auth.enabled=false` + o front injetar um "token de dev" falso para satisfazer o guard: recria a muleta que o `spec.md` §2 descrevia para quando não havia JWT; hoje só adiciona um caminho que não é o de produção. Rejeitada para o fluxo de demo; pode virar um atalho opcional documentado, não o padrão.

### 2. `.env.example` versionado como referência; `.env.development` é local
`.env.example` (já versionado) tem `VITE_API_BASE_URL=http://localhost:8080` + comentário citando `spec.md` §6. `.env.development` é criado pelo dev com `cp .env.example .env.development` (passo do README, tarefa 2.1) e o Vite o carrega em `npm run dev`.

- `.env.development` **não é versionado**: o `~/.gitignore_global` do ambiente ignora `.env.*` com exceção só de `.env.example`/`.env.template`. Isso é o padrão convencional de Vite e casa com o passo `cp` do README — não vale adicionar `!.env.development` ao `.gitignore` do projeto só para versionar um `.env`. `git check-ignore .env.example` não retorna nada (rastreado); `git check-ignore .env.development` retorna o arquivo (local), e está tudo certo.
- Com `VITE_API_BASE_URL` explícito, o `api-client` monta URL absoluta e o proxy do Vite deixa de ser o caminho — os dois modos (proxy com base vazia / base absoluta) passam a funcionar; o `.env` torna o comportamento explícito e igual ao de produção.

### 3. Correções de contrato: mínimas e verificadas contra o servidor
Ao rodar o fluxo, cada divergência (campo com outro nome, resposta num shape diferente, status code, header) vira um ajuste pontual no `api-client` / hook / schema da feature afetada, sempre conferindo contra a resposta real do backend (Swagger em `/swagger-ui.html`). Nada de reescrever feature. Se aparecer algo estrutural (ex.: endpoint que não existe), pausar e sinalizar.

### 4. Roadmap: editar `spec.md` §7, não criar arquivo novo
O `spec.md` já é a fonte única do front e já tem a estrutura de fases. Marcar item a item (feito / parcial / pendente) e anexar "## Estado atual (2026-08-28)" com o gap. Um `ROADMAP.md` separado duplicaria e desatualizaria.

## Risks / Trade-offs

- **Backend não sobe** (Docker/Testcontainers ausente na máquina) → a verificação ponta a ponta fica bloqueada. Mitigar: o roteiro do README lista o pré-requisito (Docker); se o ambiente não permitir, entregar a parte de `.env`/doc/roadmap e marcar a verificação como pendente, sinalizando.
- **Muitas divergências de contrato** → a change incha. Mitigar: teto de "ajustes pontuais"; divergência estrutural → pausa e vira item de outra change.
- **`spec.md` §1/§2 fala em "sem login até o JWT existir"** — agora está defasado; o roadmap deve corrigir esse texto também, não só a §7.
- **Conflito com `limpar-scaffold-shadcn`** no `.env.example` → coordenar: se aquela change já criou o arquivo, aqui só valida; senão, cria aqui. (Resolvido: `.env.example` e `.env.development` já existem, conteúdo conferido.)
