## Context

`vitest.config.ts` hoje não define `pool`, então o Vitest usa `threads` (worker threads com memória compartilhada). Em paralelo, algum estado (provável `localStorage`/`sessionStorage`/timer de arquivos como os da fila de sincronização) vaza entre threads e faz `CotacoesPage.test.tsx` falhar: o `GET /api/cotacoes` fica pendente e o `findByRole` estoura o timeout. Confirmado empiricamente:

- `vitest run` (threads, paralelo) → 1 falha.
- `vitest run --no-file-parallelism` → 210 verdes, mas ~111s.
- `vitest run --pool=forks` → 210 verdes, ~30s.

## Goals / Non-Goals

**Goals:**
- Eliminar a flakiness em paralelo sem sacrificar a velocidade.

**Non-Goals:**
- Não caçar e corrigir o teste específico que vaza estado (investigação longa, baixo retorno).
- Não mudar comportamento de produção nem dependências.

## Decisions

### D1 — `pool: 'forks'` em vez de `fileParallelism: false`

- **Escolhido:** `pool: 'forks'` — cada arquivo roda num processo filho isolado; resolve o vazamento e mantém paralelismo (~30s).
- **Alternativa 1:** `fileParallelism: false` — sequencial, resolve mas triplica o tempo (~111s).
- **Alternativa 2:** encontrar e corrigir o teste que vaza — mais preciso, porém custoso e frágil (o vazamento pode reaparecer).

`forks` é o fix padrão para essa classe de flakiness e tem custo de memória desprezível frente ao ganho de confiabilidade.

## Risks / Trade-offs

- [Maior consumo de memória por processo] → aceitável; a suíte é pequena (47 arquivos).
- [`forks` pode ser mais lento para subir em máquinas lentas] → na prática medido em ~30s, igual ao `threads`.
