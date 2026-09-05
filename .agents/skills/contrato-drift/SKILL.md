---
name: contrato-drift
description: Compara os campos de um schema Zod do front (*.schema.ts) contra o DTO Java real do backend, pra achar divergência de nome de campo antes que vire bug silencioso. Use antes de consumir um endpoint novo, quando um dado "nunca aparece" ou vem sempre nulo/fallback na UI, ou como checagem periódica em telas que leem de `*.schema.ts` + `*.api.ts`.
metadata:
  author: simplecote
  version: "1.0"
---

## Por que isto existe

Achado real (2026-09-05): `src/admin/analise/analise.schema.ts` define `insightProdutoSchema` com
campos `menorPreco`, `media90d`, `numeroCompras`, `numeroFornecedores`. O backend
(`InsightProdutoDTO.java`) sempre retornou `menorPrecoUnitario`, `precoMedioUnitario90d`, `compras`,
`fornecedoresDistintos`. Toda resposta falhava a validação Zod — silenciosamente: sem crash, sem
alerta, a UI só caía no fallback "Sem compra anterior". **Isso pode rodar em produção por semanas
sem ninguém notar**, porque não quebra nada visualmente, só mostra dado errado (ausência de dado).

Conclusão: ausência de erro de console **não é** prova de que o contrato está correto. Comparação
de campo precisa ser proativa, não reativa.

## Método (do mais confiável pro mais lento)

1. **DTO Java real (preferido)** — o backend (`simplecote-back`, repo irmão) expõe os DTOs como
   `record` em `src/main/java/**/dto/*DTO.java`. Ache o record pelo nome citado no
   `spec.md` §12 (ex: `→ Map<UUID, InsightProdutoDTO>`) ou pelo Controller que expõe a rota.
   Liste os campos do record e compare 1:1 com o `z.object({...})` correspondente em
   `src/admin/**/*.schema.ts`. Não precisa backend rodando, não precisa dado de seed — é leitura
   de código-fonte, instantâneo e exato.
2. **`spec.md` (secundário)** — o `simplecote-back/spec.md` §12 documenta rotas e nomes de DTO,
   mas nem sempre spelling campo-a-campo. Útil pra achar QUAL DTO olhar, não substitui o passo 1.
3. **Live (fallback, só se o repo irmão não estiver disponível)** — com backend em `:8080`:
   ```
   TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" \
     -d '{"email":"admin@dev.local","senha":"admin123"}' | jq -r .token)
   curl -s "http://localhost:8080/<rota>" -H "Authorization: Bearer $TOKEN" | jq .
   ```
   Cuidado: se o dado de seed estiver vazio/nulo pros campos em questão, um mismatch pode passar
   despercebido (campo ausente vs. campo com nome errado dão o mesmo resultado visual). Prefira o
   método 1 sempre que possível.

## O que reportar

Para cada schema checado: campo a campo, "OK" ou "front espera `X`, backend manda `Y`". Se achar
mismatch, não corrija sozinho sem avisar — isso é mudança de contrato, e a seção "Testes" do
`AGENTS.md` já é clara ("se mexeu no contrato, alinhe o back também"): o schema do front deve
espelhar o DTO real, nunca o contrário.
