## 1. Alinhamento à direita

- [x] 1.1 Em `src/admin/cotacoes/GradeAoVivoTabela.tsx`, aplicar `text-right` no `<th>` de cada Empresa e alinhar à direita o conteúdo interno das células (rótulo de status e bloco de preço), mantendo a coluna do item à esquerda; verificar que `npm run build` passa sem erro de tipo.

## 2. Badges de estado vazio

- [x] 2.1 Substituir o rótulo solto de `PENDENTE`/`NAO_COTADO` por uma pílula `rounded-full bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5`, mantendo o rótulo `COTADO` como está; verificar visualmente a renderização do badge.

## 3. Seletor de quantidade

- [x] 3.1 Reduzir os botões `[-]`/`[+]` para `size-5`, ícone `size-3`, borda `border` (token) e gap/padding menores, sem alterar a lógica de incremento/decremento e os disables; verificar que `npm run lint` passa.

## 4. Cartão de preço padrão

- [x] 4.1 No botão de célula, trocar o preço `COTADO` padrão (não-menor) de `bg-transparent border-transparent` para `bg-card border` mantendo `rounded-md`; verificar visualmente a simetria com o cartão `MENOR`.

## 5. Testes

- [x] 5.1 Adicionar/ajustar testes em `src/admin/cotacoes/GradeAoVivoTabela.test.tsx` cobrindo a presença do badge de estado vazio e das classes de cartão/alinhamento; verificar que `npm test` passa para a grade.

## 6. Checagem de saúde

- [x] 6.1 Rodar `npm test`, `npm run build` e `npm run lint` e verificar que os três passam sem erros.
