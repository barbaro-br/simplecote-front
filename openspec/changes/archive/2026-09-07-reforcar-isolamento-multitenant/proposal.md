## Why

O SimpleCote já é multi-inquilino: o `Comprador` (supermercado) é o tenant, toda tabela do back tem `comprador_id`, e o `JwtCompradorIdResolver` isola os dados pegando o tenant do JWT de quem está logado. Hoje isso funciona porque (a) no back cada consulta lembra de filtrar (`findByCompradorIdAndId`) e (b) no front nenhuma chamada transporta `compradorId`. Quando vários supermercados **concorrentes** dividem o mesmo banco, uma única consulta futura que esqueça o filtro — ou um payload do front que aceite `compradorId` do cliente — vaza dado entre concorrentes.

O back vai ganhar uma barreira à prova de falha (Hibernate `@Filter` ou Postgres Row-Level Security, ativada por request a partir do `CompradorIdResolver`). Esta change é a contraparte do front: garantir que o cliente **nunca** carrega, aceita ou deriva a identidade do inquilino, e travar isso contra regressão.

## What Changes

- **Auditoria** de `src/**/*.api.ts` e dos `*.schema.ts`: nenhuma requisição a `/api/**` pode enviar `compradorId`/`comprador` no corpo, na query ou no path; nenhum schema de submit expõe esse campo; nenhuma tela deixa o usuário escolher o inquilino. O que for encontrado é removido.
- **Teste de contrato** novo em `src/shared/test/`: intercepta as requisições de um conjunto representativo de mutações do admin (criar produto, criar empresa, abrir cotação, salvar configurações…) e falha se o payload contiver qualquer identificador de inquilino.
- **Regra inegociável** nova no `spec.md` (§4) e no `AGENTS.md`: "o `compradorId` vem sempre do JWT, resolvido no servidor — o front nunca envia, nunca deixa escolher, nunca deriva".
- Sem mudança de comportamento em runtime esperada: se a auditoria não achar nada, entram só o teste-guarda e a documentação.

## Capabilities

### Added Capabilities

- `core/multitenancy`: contrato do front com o backend multi-inquilino — a identidade do `Comprador` vem do JWT e é resolvida no servidor; o front nunca a transporta; rotas públicas por token resolvem o inquilino pelo próprio token.

## Impact

- Auditoria (sem diff esperado, ou remoção pontual) em `src/admin/**/**.api.ts`, `src/admin/**/**.schema.ts`, `src/colaborador/*.api.ts`, `src/representante/**/*.api.ts`.
- Novo `src/shared/test/isolamento-tenant.test.ts` (ou similar) — teste-guarda de contrato.
- `spec.md` (§4 Regras inegociáveis) e `AGENTS.md` (§ Regras inegociáveis do código) — nova regra.
- **Pré-requisito no `simplecote-back`**: `@Filter`/RLS por `comprador_id` ativado por request + suíte de teste de isolamento cruzado (2 compradores, A nunca vê B, incluindo export XLSX/PDF e o stream da grade ao vivo). Fora do escopo deste repo, rastreado como tarefa 0.1.
- Sem dependência nova, sem mudança de rota.
