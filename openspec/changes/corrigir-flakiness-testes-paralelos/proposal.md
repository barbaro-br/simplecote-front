## Why

A suíte de testes do front falha de forma determinística em execução paralela: `CotacoesPage.test.tsx` fica preso no skeleton (o `GET /api/cotacoes` nunca resolve) quando o Vitest roda os arquivos em paralelo com o pool padrão (`threads`). O código e o teste estão corretos — o problema é o pool de `threads` do Vitest, que usa worker threads com memória compartilhada e deixa estado vazar entre arquivos de teste. Rodando com `--no-file-parallelism` ou `--pool=forks`, os 210 testes passam.

## What Changes

- Trocar o pool de testes do Vitest de `threads` (default, memória compartilhada) para `forks` (processos filhos isolados) em `vitest.config.ts`.
- Mantém a execução paralela (mesma velocidade, ~30s) e elimina a flakiness por isolamento de processo.

## Capabilities

### New Capabilities

### Modified Capabilities

Nenhuma. Change de infraestrutura de teste — nenhum requisito de sistema muda. (`skip_specs: true`)

## Impact

- `vitest.config.ts` — adicionar `pool: 'forks'` ao bloco `test`.
- Sem mudança de código de aplicação, teste ou dependência.
- Efeito colateral aceitável: `forks` usa processos filhos (leve acréscimo de memória), mas o tempo total fica igual (~30s) e o isolamento é real.
