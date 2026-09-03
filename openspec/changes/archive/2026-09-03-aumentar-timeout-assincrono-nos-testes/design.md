## Context

`setupTests.ts` hoje não chama `configure()` de `@testing-library/dom` — usa o timeout padrão da biblioteca (1000ms) pra todo `findBy*`/`waitFor` do projeto. `vitest.config.ts` já usa `pool: 'forks'` (decisão já tomada nesta sessão, confirmada não ser a causa da flakiness — a causa é contenção de CPU quando muitos forks rodam ao mesmo tempo, não o pool em si).

## Goals / Non-Goals

**Goals:**
- Tornar os testes que dependem de fetch simulado (MSW) tolerantes à variação de tempo de resposta quando a suíte completa roda sob carga, sem mascarar bugs reais de comportamento.
- Aplicar a correção uma vez, globalmente, em vez de patchar teste por teste conforme cada um aparecer como flaky.

**Non-Goals:**
- Não muda `pool: 'forks'` nem a paralelização da suíte — já validado que não é a causa.
- Não aumenta o timeout de testes E2E/browser (fora do escopo — isso é só a suíte Vitest/testing-library).

## Decisions

- **`asyncUtilTimeout: 3000` (3s) global no `setupTests.ts`**, não um valor por teste — um teste específico já foi pego pela flakiness, mas a causa raiz (contenção de CPU na suíte completa) pode afetar qualquer teste com fetch simulado; corrigir globalmente evita repetir esse mesmo ciclo de "achar flaky → aumentar timeout local" pra cada teste que aparecer no futuro.
- **3s, não um valor maior** — suficiente pra cobrir a contenção observada (o teste isolado leva ~1.2s no total; 3s dá margem generosa sem esconder um travamento real caso um teste comece a falhar por bug de verdade).

## Risks / Trade-offs

- [Risco] Um teste que realmente trava (bug real, não flakiness) agora demora até 3s pra reportar falha em vez de 1s — aceitável, a suíte completa já leva ~30-60s; a diferença é imperceptível no fluxo de trabalho.
