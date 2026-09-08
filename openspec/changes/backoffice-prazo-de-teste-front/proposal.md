## Why

Par do back `backoffice-prazo-de-teste`: o `SUPER_ADMIN` passa a definir/estender o prazo de teste de uma loja, e uma loja em teste com prazo vencido é bloqueada em `/api/**` com `403`. Falta a UI: ver e editar o prazo no backoffice, um indicador de prazo na lista, e — do lado do cliente — uma tela clara de "acesso bloqueado" no lugar do painel quebrado (o que também vale para a suspensão, que hoje não tem tratamento dedicado no front).

## What Changes

- **Detalhe da loja (backoffice)**: mostra `trialExpiraEm` formatado ("expira em 5 dias" / "expirou há 2 dias" / "sem prazo"). Ação "Definir prazo": botões +7 / +30 dias, um seletor de data, e "remover prazo" → `POST /api/admin/compradores/{id}/prazo`.
- **Lista (backoffice)**: coluna/badge de prazo, com destaque para "expira em ≤7 dias" e "expirado".
- **Cliente — tela de bloqueio**: quando uma chamada `/api/**` autenticada recebe `403` com o `ProblemDetail` de bloqueio (suspensão OU prazo vencido — identificados pelo `type`/`title`), o app SHALL mostrar uma tela cheia ("Sua conta está suspensa" / "Seu período de teste terminou") com o `detail` do backend e um botão "Sair", em vez de renderizar o painel com tudo dando erro. `/api/auth/**` não dispara isso.
- **Não** muda o fluxo de login, o `SessaoExpiradaError` (401) nem as outras telas do backoffice.

## Capabilities

### Modified Capabilities

- `backoffice`: o `SUPER_ADMIN` vê e edita o prazo de teste de uma loja pelo detalhe, com indicador na lista; o painel do cliente mostra uma tela de bloqueio dedicada no `403` de suspensão/prazo.

## Impact

- `src/backoffice/backoffice.api.ts`: `useDefinirPrazo()` → `POST /api/admin/compradores/{id}/prazo` (`{ expiraEm: string | null }`); invalida a lista e o detalhe.
- `src/backoffice/CompradorDetalhePage.tsx`: seção "Prazo de teste" (valor formatado + ações). `CompradoresPage.tsx`: coluna de prazo com badge.
- `src/backoffice/backoffice.schema.ts` / um helper de formatação de prazo (dias restantes) — reusa `date-fns`/`Intl` já presente.
- `src/shared/api/api-client.ts`: no `processarRequisicao`, um `403` autenticado cujo `ProblemDetail.type` (ou `title`) casa com os de bloqueio → lança um `AcessoBloqueadoError { motivo, detail }` (nova classe, ao lado de `SessaoExpiradaError`), tratado por um bridge.
- `src/shared/auth/`: `AcessoBloqueadoBridge` (ou extensão do `SessaoExpiradaBridge`) → navega para `/conta-bloqueada` (rota pública nova) passando motivo/detail; `ContaBloqueadaPage.tsx` — identidade SimpleCote, a mensagem do backend, botão "Sair".
- `src/routes.tsx`: rota pública `/conta-bloqueada`.
- Testes: `backoffice.test.tsx` — definir prazo (+30 chama a API; remover manda `null`); lista mostra "expirado". `api-client.test.ts` — `403` com o `type` de bloqueio → `AcessoBloqueadoError`; `403` comum (ex.: `OPERADOR` numa rota de ADMIN) → segue `ApiError`; `403` em `/api/auth/**` não dispara. `ContaBloqueadaPage` renderiza o `detail` e o botão "Sair".
- Sem dependência nova. Seção 0 = o back (`backoffice-prazo-de-teste`).
