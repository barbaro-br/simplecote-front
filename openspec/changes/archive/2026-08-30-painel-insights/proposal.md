## Why

O backend publicou três endpoints de leitura de análise (`GET /api/analises/dashboard`, `.../produtos/insight`, `.../empresas/{id}/insight` — change `insights-de-compra`, no ar no Heroku) e **nenhuma tela do front os consome**. O painel tem uma UI recém-repaginada (visual refresh fase 3) e mostra a mesma lista de cotações "crua" que mostrava antes — sem contexto de compra por produto/empresa, sem visão de "o que precisa de ação". Este é o momento de plugar esses dados na tela sem esperar a tela de gráficos dedicada.

## What Changes

- **Novo** módulo de leitura `src/admin/analise/` (padrão da fatia de referência `produtos`): `analise.api.ts` + `analise.schema.ts` (zod validando as 3 respostas) + testes MSW. Consome os 3 endpoints via `api-client` (JWT já injetado).
- **Cabeçalho de dashboard em `/admin`** (`CotacoesPage`): faixa de cartões acima da lista de cotações — contadores por status, "precisa de ação" (encerradas sem apurar + apuradas sem pedido enviado, clicáveis para a lista filtrada), próximos prazos (linkando para a cotação), gasto do mês vs. mês anterior, economia estimada (90d), top 5 produtos e top 5 empresas por gasto. Some silenciosamente em erro/offline.
- **Hover-card de produto**: evolução do `UltimaCompraPopover` (hoje só na grade ao vivo) para um card rico — última compra (Empresa + Representante + preço unitário + data + quantidade), variação de preço, menor preço, média 90d, nº de compras, nº de fornecedores e sparkline (SVG inline). Aplicado nas linhas de `ItensSection` e no seletor "adicionar produto", com **um** request em lote (`?ids=`) que popula o cache por `produtoId`.
- **Hover-card de empresa** em `ParticipantesSection`: taxa de resposta, itens vencidos, valor comprado (total e 90d), última compra, "mais barata / 2º lugar", produtos fornecidos, tempo médio de resposta. Request lazy por empresa; 422/erro → "sem dados de relacionamento".
- **Sem dependência nova** (sparkline é SVG à mão; a série tem no máximo 6 pontos). **Sem mudança no backend**. **Sem regressão** da grade ao vivo (`GradeAoVivoPage`/`GradeAoVivoTabela`).

## Capabilities

### New Capabilities
- `admin/painel-insights`: widgets de leitura no painel do admin que consomem a API de análise do backend — o cabeçalho de dashboard em `/admin`, o hover-card de insight por produto (linha de cotação e seletor de produto) e o hover-card de relacionamento por empresa (participantes da cotação). Cobre o comportamento observável desses widgets: o que exibem, os estados vazio/erro, e o agrupamento das chamadas.

### Modified Capabilities
_Nenhuma._ As telas `admin/cotacoes`, `admin/produtos` e `admin/empresas` ganham widgets novos mas seus requisitos existentes não mudam — a lista de cotações, o CRUD de produto/empresa e a grade ao vivo seguem com o comportamento especificado hoje.

## Impact

- **Código (front)**: novo `src/admin/analise/` (api + schema + testes). Alterados: `src/admin/cotacoes/CotacoesPage.tsx` (faixa de cartões), `src/admin/cotacoes/ItensSection.tsx` + o seletor de produto (hover), `src/admin/cotacoes/ParticipantesSection.tsx` (hover), `src/admin/cotacoes/UltimaCompraPopover.tsx` (vira o card rico, mantendo o uso atual na grade ao vivo). Possível componente compartilhado novo para o card/popover.
- **API**: só consumo — `GET /api/analises/{dashboard, produtos/insight, empresas/{id}/insight}`. Nenhum contrato novo.
- **Dependências**: nenhuma. Recharts continua fora (a tela `/admin/analises` com gráficos é change futura).
- **Testes**: MSW para os 3 endpoints (incl. campos null, mapa vazio, 400 e 422); testes de render dos cartões e dos dois hovers; regressão de `GradeAoVivoPage` e `ItensSection`.
- **Fora de escopo**: tela `/admin/analises` (Recharts), `/admin/representantes`, `/admin/usuarios`, import de catálogo, scanner GTIN, duplicar/cancelar cotação, primitivo genérico de tooltip.
