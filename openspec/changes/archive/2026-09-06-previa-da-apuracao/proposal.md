## Why

"Apurar" é irreversível e hoje o diálogo de confirmação (`CotacaoDetalhePage`, `dialog === 'apurar'`) só avisa "não pode ser desfeito" e lista quem não finalizou. O admin não vê o que vai sair. A change de mesmo nome no `simplecote-back` adiciona `GET /api/cotacoes/{id}/apuracao/previa` com o resultado provisório.

## What Changes

- No diálogo de "Apurar", mostrar a **prévia**: por Empresa vencedora, quais itens ela ganharia e o total; e a lista de **itens sem vencedor**.
- Carregada sob demanda ao abrir o diálogo (não no load da página).
- Estados: carregando, erro (via `ApiError.message`), e o conteúdo. O botão "Apurar" continua funcionando igual; a prévia é informativa.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a requirement de "Resultado da apuração e pedidos" (ou a de transições com confirmação) passa a exibir, no diálogo de "Apurar", uma prévia do resultado (pedidos previstos por Empresa + itens sem vencedor) antes da confirmação irreversível.

## Impact

- `cotacoes.api.ts`: `usePreviaApuracao(cotacaoId, { enabled })` — `useQuery(['previa-apuracao', id], () => api.get<ResultadoDTO>('/api/cotacoes/' + id + '/apuracao/previa'))`, `enabled` só quando o diálogo de apurar está aberto.
- `cotacoes.schema.ts`: reusar o tipo `ResultadoDTO` já existente (o de `GET /resultado`).
- `CotacaoDetalhePage.tsx`: no bloco `dialog === 'apurar'` (`ConfirmarDialog`), renderizar a prévia — tabela/lista compacta de Empresa → itens ganhos + total, e um bloco "itens sem vencedor". Skeleton enquanto `isLoading`; `ErrorAlert` no erro.
- Testes: `CotacaoDetalhePage.test.tsx` — abrir "Apurar" dispara a query; a prévia renderiza empresas/itens/itens-sem-vencedor do mock; erro mostra a mensagem; fechar o diálogo não quebra.
- Sem dependência nova. Depende da change do `simplecote-back` mesclada.
