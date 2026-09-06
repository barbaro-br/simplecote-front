## 1. Schema

- [ ] 1.1 `cotacoes.schema.ts`: `prazoVencido: boolean` em `Cotacao` e no tipo do item da listagem

## 2. Aviso na tela de detalhe

- [ ] 2.1 `CotacaoDetalhePage.tsx`: quando `status === 'ABERTA' && cotacao.prazoVencido`, renderizar um banner de aviso acima do conteúdo — "Prazo vencido — os representantes não podem mais responder. Encerre para apurar." — com o botão "Encerrar" em destaque
- [ ] 2.2 O banner some quando a cotação sai de `ABERTA` (após encerrar)

## 3. Indicador na lista

- [ ] 3.1 `CotacoesPage.tsx`: selo "prazo vencido" na linha de uma cotação cujo resumo traz `prazoVencido`

## 4. Testes

- [ ] 4.1 `CotacaoDetalhePage.test.tsx`: banner só com `ABERTA` + `prazoVencido`; ausente com prazo futuro ou status ≠ `ABERTA`
- [ ] 4.2 `CotacoesPage.test.tsx`: selo na linha com `prazoVencido`
- [ ] 4.3 `npm test` + `npm run build` + `npm run lint` verdes
