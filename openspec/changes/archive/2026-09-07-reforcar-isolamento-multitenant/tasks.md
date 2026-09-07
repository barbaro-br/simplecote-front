## 0. Pré-requisito (repo `simplecote-back`, fora do escopo deste diff)

- [ ] 0.1 `@Filter` do Hibernate e/ou Postgres RLS por `comprador_id`, ativados por request a partir do `CompradorIdResolver` (JWT nas rotas `/api/**`, token nas `/public/**`)
- [ ] 0.2 Suíte de teste de isolamento cruzado no back: 2 compradores, A nunca enxerga dado de B — incluindo listagens, export XLSX/PDF e o stream da grade ao vivo

## 1. Auditoria do cliente

- [x] 1.1 Revisar todos os `src/**/*.api.ts` (admin, colaborador, representante): nenhuma chamada a `/api/**` envia `compradorId`/`comprador`/`tenantId` no corpo, query ou path
- [x] 1.2 Revisar todos os `src/**/*.schema.ts` de submit: nenhum expõe campo de identificação de inquilino
- [x] 1.3 Revisar as telas: nenhum campo/menu deixa o usuário escolher em nome de qual `Comprador` a operação ocorre
- [x] 1.4 Remover / deixar de enviar o que for encontrado; se nada for encontrado, registrar isso no handoff

## 2. Teste-guarda de contrato

- [x] 2.1 Criar `src/shared/test/isolamento-tenant.test.ts`: com MSW, interceptar o corpo serializado das requisições
- [x] 2.2 Cobrir uma mutação representativa por feature — criar produto, criar empresa, abrir cotação, salvar configurações, criar usuário, criar/editar representante
- [x] 2.3 Assertar que nenhum payload contém `compradorId`, `comprador`, `tenantId` (ou equivalente)
- [x] 2.4 Assertar que as chamadas `/public/**` (colaborador, representante por token) saem sem header `Authorization`

## 3. Documentação da regra

- [x] 3.1 `spec.md` §4: adicionar a regra inegociável — "o `compradorId` vem sempre do JWT, resolvido no servidor; o front nunca envia, nunca deixa escolher, nunca deriva"
- [x] 3.2 `AGENTS.md` (§ Regras inegociáveis do código): mesma regra, em uma linha

## 4. Checagem de saúde

- [x] 4.1 `npm test` + `npm run build` + `npm run lint` verdes
