## Why

O diretório `openspec/changes/` acumulou oito changes ativas: seis concluídas (todas as tarefas feitas, com deltas de spec ainda não sincronizados) e duas paradas — `saas-multi-tenant-transformation` (0/12, mega-change cross-repo que nunca avançou) e `preparar-deploy-2026-08-31` (obsoleta: os três archives que ela pedia já foram feitos por outro caminho, e o que resta é commit/push que viola AGENTS.md §7). Esse acúmulo deixa o openspec desalinhado com o código e o histórico. Esta change é housekeeping: apagar as duas mortas e arquivar as seis concluídas.

## What Changes

- Apagar `saas-multi-tenant-transformation` (nenhuma tarefa feita, nenhum spec sincronizado).
- Apagar `preparar-deploy-2026-08-31` (obsoleta; os archives já aconteceram, o resto viola a disciplina de "sem commits").
- Arquivar as seis changes concluídas, na ordem que evita conflito de sincronização de specs compartilhadas.

## Capabilities

### New Capabilities

### Modified Capabilities

Nenhuma. Esta change é housekeeping puro — nenhuma capability ou requisito de sistema muda. (`skip_specs: true`)

## Impact

- `openspec/changes/` — remoção de 2 diretórios e movimentação de 6 para `archive/` (via `/opsx/archive`).
- `openspec/specs/` — sincronização dos deltas das 6 changes (o próprio fluxo de archive faz o sync por change).
- Sem mudança de código de aplicação, API ou regra de negócio.
- Ordem recomendada de arquivamento (evita conflito em capabilities compartilhadas):
  1. `corrigir-salto-navegacao` (`core/setup`)
  2. `corrigir-preco-unitario-representante` (`representante/cotacao`)
  3. `design-system-polish` (`shared/design-system`)
  4. `escalar-grade-e-ajustar-quantidade` (`admin/cotacoes`)
  5. `separar-dashboard-e-cotacoes` (`admin/painel-insights`, `admin/cotacoes`)
  6. `redesenhar-painel-e-analises` (`admin/painel-insights`, `admin/analises`)
