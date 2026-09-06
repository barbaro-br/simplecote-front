## 1. API

- [x] 1.1 `representantes.api.ts`: `useExcluirRepresentante()` — `api.delete<{ resultado: 'REMOVIDO' | 'ANONIMIZADO' }>('/api/representantes/' + id)`, `onSuccess` invalida `['empresas']`
- [x] 1.2 `representantes.schema.ts`: tipo `ResultadoExclusaoRepresentante = 'REMOVIDO' | 'ANONIMIZADO'`

## 2. UI no catálogo de fornecedores

- [x] 2.1 Na linha/cartão da Empresa que tem Representante, ação "Excluir contato"
- [x] 2.2 Clique abre `ConfirmarDialog` — título "Excluir contato", descrição nomeando os dois desfechos: sem histórico → dados apagados e empresa fica sem contato; com histórico → dados pessoais anonimizados, histórico preservado
- [x] 2.3 Confirmar chama `useExcluirRepresentante().mutateAsync(id)`; sucesso → toast "Contato removido." (`REMOVIDO`) ou "Dados do contato anonimizados; o histórico foi mantido." (`ANONIMIZADO`); erro → `ApiError.message`

## 3. Testes

- [x] 3.1 `empresas.test.tsx`: ação "Excluir contato" só aparece quando a Empresa tem Representante
- [x] 3.2 Confirmar dispara `DELETE /api/representantes/{id}` com o id certo; cancelar não dispara
- [x] 3.3 Toast reflete `REMOVIDO` vs `ANONIMIZADO` conforme a resposta mockada
- [x] 3.4 Estado otimista e rollback em erro (`AGENTS.md §4`)
- [x] 3.5 `npm test` + `npm run build` + `npm run lint` verdes
