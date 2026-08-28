## Why

O painel admin do front tem telas de Produtos e Empresas, mas ninguém rodou front + backend juntos: não há `.env` com a URL da API, não há um roteiro de "como subir os dois", e o fluxo real (login → JWT → criar produto → criar empresa) nunca foi verificado ponta a ponta contra o servidor. Sem isso não dá para desenvolver Cotações nem mostrar nada pro cliente. Além disso a `spec.md` §7 do front não reflete o que já foi feito, dificultando planejar o que falta.

## What Changes

- **Configuração de ambiente**: criar `.env.development` e `.env.example` com `VITE_API_BASE_URL=http://localhost:8080`; confirmar que `vite.config.ts` (proxy `/api` → `:8080`) e `api-client` (`VITE_API_BASE_URL || ''`) funcionam juntos em dev e que os testes MSW (`*/api/...`) continuam casando.
- **Roteiro de desenvolvimento**: seção no `README.md` — subir o backend (`./mvnw spring-boot:test-run` em `simplecote-back`, porta 8080, perfil dev com auth desligada OU com credencial seed), subir o front (`npm run dev`), e como logar (usuário/senha semeados pelo `SeedDadosDev`).
- **Verificação ponta a ponta** do que já existe, contra o backend vivo: `/login` autentica e guarda o JWT; `/admin/produtos` lista, cria e inativa; `/admin/empresas` lista, cria (com representante) e edita. Corrigir divergências de contrato que aparecerem (nome de campo, shape de resposta, header, path) — mudanças mínimas para o fluxo fechar.
- **Roadmap no repo**: atualizar `spec.md` §7 marcando cada item de fase como feito / parcial / pendente, e acrescentar uma subseção "Estado atual (2026-08-28)" com o gap até a Fase 1 completa e os follow-ups (`/admin/representantes` dedicada, grade ao vivo F2, F3).

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Configuração de ambiente, documentação e correções pontuais para fazer o fluxo já especificado (`core/setup`, `admin/produtos`, `admin/empresas`) funcionar contra o backend real. Sem novo comportamento de spec. `.openspec.yaml` declara `skip_specs: true`.

## Impact

- Novo: `.env.development`, `.env.example`.
- Edição: `README.md`, `spec.md` (§7), possivelmente `vite.config.ts`, e ajustes pontuais em `src/shared/api/api-client.ts` / hooks `*.api.ts` / schemas se o contrato divergir do backend.
- Depende de `corrigir-build-e-tipos` ter sido aplicada (build verde) e coordena com `limpar-scaffold-shadcn` no `.env.example` (quem landar primeiro cria; o outro só confere).
- Desbloqueia `admin-cotacoes` e `representante-cotacao-token`.
