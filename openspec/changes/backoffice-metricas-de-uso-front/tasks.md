## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 `GET /api/admin/compradores/{id}` com `valorTotalComprado`, `cotacoesPorStatus`, `primeiraCotacaoEm`, `ultimaAtividadeEm`; `GET .../{id}/cotacoes` (lista com `valorComprado`); `GET .../{id}/relatorio` (`text/csv`); listagem com `valorTotalComprado` — change `backoffice-metricas-de-uso`

## 1. API e schema

- [ ] 1.1 `src/backoffice/backoffice.schema.ts`: `CompradorAdmin` ganha `valorTotalComprado`, `cotacoesPorStatus`, `primeiraCotacaoEm`, `ultimaAtividadeEm`; novo `CotacaoResumo`
- [ ] 1.2 `src/backoffice/backoffice.api.ts`: `useCotacoesDaLoja(id)` → `GET /api/admin/compradores/{id}/cotacoes`; `baixarRelatorio(id)` via `baixarArquivo('/api/admin/compradores/{id}/relatorio', '<slug>-uso.csv')`

## 2. Detalhe da loja

- [ ] 2.1 `MetricaCard.tsx` (ou inline): cards no topo — valor total comprado (moeda), nº de cotações + mini-badges por status, primeira cotação (data), última atividade (data relativa)
- [ ] 2.2 Seção "Cotações": tabela de `useCotacoesDaLoja` — título, status (badge), itens, participantes, valor comprado (moeda), criada/encerrada; estados carregando/vazio/erro
- [ ] 2.3 Botão "Baixar relatório (CSV)" → `baixarRelatorio(id)`; estado de progresso; erro do back em toast
- [ ] 2.4 Reorganiza o detalhe em seções: cabeçalho (nome/slug/status) → métricas → cotações → administradores → ações → zona de perigo

## 3. Lista

- [ ] 3.1 `CompradoresPage.tsx`: coluna "Comprado" (valor formatado); formatação de datas; ordenação por coluna (nome / criado / último acesso / comprado)

## 4. Testes

- [ ] 4.1 `backoffice.test.tsx`: detalhe mostra `valorTotalComprado` formatado e a tabela de cotações (mock com 2 cotações e valores); "Baixar relatório" chama `baixarArquivo` com `/api/admin/compradores/{id}/relatorio`
- [ ] 4.2 `backoffice.test.tsx`: lista mostra a coluna "Comprado" com o valor de cada loja

## 5. Checagem de saúde

- [ ] 5.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 5.2 Verificação manual com o back: abrir uma loja de teste com cotações, conferir os números e a tabela; baixar o CSV e abrir
