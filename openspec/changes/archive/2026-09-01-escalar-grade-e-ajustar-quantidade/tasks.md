## 1. Back — relaxar a regra de quantidade (simplecote-back)

- [x] 1.1 Em `simplecote-back/src/main/java/com/simplecote/cotacao/Cotacao.java`, alterar `alterarQuantidadeItem` para bloquear apenas `PEDIDOS_GERADOS`/`CANCELADA` (permitir `RASCUNHO`/`ABERTA`/`ENCERRADA`). Verificar: compila no back.
- [x] 1.2 Atualizar os testes do back (`CotacaoTest`/`CotacaoServiceTest`) que afirmam o bloqueio em `RASCUNHO`, cobrindo o novo comportamento. Verificar: testes do back verdes.

## 2. Front — grade densa (sticky + tipografia)

- [x] 2.1 Em `GradeAoVivoTabela.tsx`, aplicar `sticky top-0` com fundo opaco nas células `<th>` do cabeçalho e `sticky top-0 left-0 z-30` no canto. Verificar: `npm run build` verde.
- [x] 2.2 Ajustar a matriz de z-index (células `z-1`, coluna do item `z-10`, cabeçalho `z-20`, canto `z-30`) e reduzir o peso da fonte do nome do item. Verificar: `npm run lint` verde.

## 3. Front — edição de quantidade na grade

- [x] 3.1 Em `GradeAoVivoTabela.tsx`, exibir a `quantidadeSolicitada` por item e permitir edição inline quando a Cotação está `ABERTA`/`ENCERRADA`, reutilizando `useAtualizarQuantidadeItem`. Verificar: `npm run build` verde.
- [x] 3.2 Em `PEDIDOS_GERADOS`/`CANCELADA`, manter a quantidade somente leitura. Verificar: `npm run lint` verde.

## 4. Testes

- [x] 4.1 Adicionar/ajustar teste de renderização da grade cobrindo o CSS (sem quebra) e a edição de quantidade (chamada ao `PATCH` + leitura em estados terminais). Verificar: `npm test` verde.

## 5. Verificação final

- [x] 5.1 Rodar `npm run build`, `npm test` e `npm run lint` no front e confirmar os três verdes (regra AGENTS.md §3). Verificar também que o back compila e os testes do back passam.
