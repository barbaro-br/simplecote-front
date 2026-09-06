## 1. Ação de remover na grade ao vivo

- [x] 1.1 `GradeAoVivoTabela`: por linha de item, um botão de remover (ícone lixeira) visível só quando `status === 'ABERTA'`
- [x] 1.2 Clique abre `ConfirmarDialog` — título "Remover item", descrição nomeando que os lances já dados para o item serão descartados, rótulo "Remover item"
- [x] 1.3 Confirmar chama `useRemoverItem(cotacaoId).mutateAsync(itemId)`; erro exibe `ApiError.message` (`AGENTS.md §5`); sucesso fecha o diálogo

## 2. Invalidação

- [x] 2.1 `useRemoverItem` invalida `['grade-ao-vivo', cotacaoId]` e `['cotacao', cotacaoId]` no sucesso (ajustar em `cotacoes.api.ts` se ainda não faz)

## 3. Testes

- [x] 3.1 `GradeAoVivoTabela.test.tsx`: ação de remover ausente em `ENCERRADA`, presente em `ABERTA`
- [x] 3.2 Teste: confirmar dispara a mutação com o `itemId` certo; cancelar não dispara
- [x] 3.3 Teste do estado otimista e do rollback em erro (`AGENTS.md §4`)
- [x] 3.4 `npm test` + `npm run build` + `npm run lint` verdes
