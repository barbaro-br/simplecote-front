## 1. API

- [ ] 1.1 `cotacoes.api.ts`: `usePreviaApuracao(cotacaoId: string, opts: { enabled: boolean })` — `useQuery(['previa-apuracao', cotacaoId], () => api.get<ResultadoDTO>('/api/cotacoes/' + cotacaoId + '/apuracao/previa'), { enabled: opts.enabled })`
- [ ] 1.2 Reusar o tipo `ResultadoDTO` de `cotacoes.schema.ts` (o mesmo de `GET /resultado`)

## 2. UI no diálogo de Apurar

- [ ] 2.1 `CotacaoDetalhePage.tsx`, bloco `dialog === 'apurar'`: `usePreviaApuracao(id, { enabled: dialog === 'apurar' })`
- [ ] 2.2 Renderizar: por Empresa vencedora, os itens que ela ganharia e o total; abaixo, bloco "Itens sem vencedor" com a lista
- [ ] 2.3 `isLoading` → Skeleton; erro → `ErrorAlert` com `ApiError.message`; o botão "Apurar" segue igual (a prévia é informativa)

## 3. Testes

- [ ] 3.1 `CotacaoDetalhePage.test.tsx`: abrir "Apurar" dispara a query da prévia
- [ ] 3.2 A prévia renderiza empresas, itens ganhos, totais e itens-sem-vencedor de um mock
- [ ] 3.3 Erro na prévia mostra a mensagem; fechar/reabrir o diálogo não quebra
- [ ] 3.4 `npm test` + `npm run build` + `npm run lint` verdes
