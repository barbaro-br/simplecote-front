## 1. Configuração do pool de testes

- [x] 1.1 Em `vitest.config.ts`, adicionar `pool: 'forks'` ao bloco `test`; verificar que `npx vitest run` passa os 47 arquivos / 210 testes sem a falha do `CotacoesPage`.

## 2. Verificação

- [x] 2.1 Rodar `npm test` (paralelo default) e confirmar 0 falhas e tempo próximo de ~30s (não degradar para sequencial).
