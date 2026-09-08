## Why

Par do back `backoffice-metricas-de-uso`: o detalhe de uma loja passa a ter valor total comprado, cotações por status, atividade, a lista de cotações da loja e um relatório CSV. Falta a UI — e o detalhe/lista do backoffice hoje são bem crus.

## What Changes

- **Detalhe da loja**: cards de métrica no topo — valor total comprado, nº de cotações (com mini-badges por status), primeira cotação, última atividade. Seção "Cotações" com uma tabela (título, status, itens, participantes, **valor comprado**, datas) — de `GET /api/admin/compradores/{id}/cotacoes`. Botão "Baixar relatório (CSV)" → `GET .../{id}/relatorio` via `baixarArquivo`.
- **Lista**: coluna "Comprado" (valor formatado) por loja.
- **Polish**: o detalhe ganha uma estrutura clara (cabeçalho com nome/slug/status, cards, seções: uso, admins, cotações, ações, zona de perigo); a lista ganha formatação de moeda/data e ordenação por coluna.
- **Não** muda rotas, o guard nem as ações existentes.

## Capabilities

### Modified Capabilities

- `backoffice`: o detalhe de uma loja mostra métricas de uso, a lista de cotações e um botão de relatório CSV; a lista de lojas mostra o valor comprado.

## Impact

- `src/backoffice/backoffice.api.ts`: `useCotacoesDaLoja(id)` → `GET /api/admin/compradores/{id}/cotacoes`; `baixarRelatorio(id)` via `baixarArquivo('/api/admin/compradores/{id}/relatorio', ...)`. `CompradorAdminResponse`/schema ganham `valorTotalComprado`, `cotacoesPorStatus`, `primeiraCotacaoEm`, `ultimaAtividadeEm`.
- `src/backoffice/CompradorDetalhePage.tsx`: cards de métrica + seção de cotações + botão de relatório; reorganização em seções.
- `src/backoffice/CompradoresPage.tsx`: coluna "Comprado"; formatação e ordenação.
- `src/backoffice/` — `MetricaCard.tsx` / `formatarMoeda`/`formatarData` (reusa o que já existe em `shared/format`).
- Testes: `backoffice.test.tsx` — detalhe mostra o valor total e a lista de cotações (mock); "Baixar relatório" chama `baixarArquivo` com a URL certa; lista mostra a coluna "Comprado".
- Sem dependência nova. Seção 0 = o back (`backoffice-metricas-de-uso`).
