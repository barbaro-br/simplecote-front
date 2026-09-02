## 1. Confirmar checkbox pendente

- [x] 1.1 `git add openspec/changes/commitar-back-e-front/tasks.md` e commitar (`chore(opsx): confirmar push e CI verificados (3.1, 3.2)`); verificar com `git status` que só esse arquivo foi commitado.
- [x] 1.2 `git push origin main`; verificar com `git rev-list --left-right --count origin/main...HEAD` que o resultado é `0 0`.

## 2. Arquivar as changes concluídas

- [x] 2.1 `openspec archive commitar-back-e-front`; verificar que a pasta apareceu em `openspec/changes/archive/2026-09-02-commitar-back-e-front/` e sumiu de `openspec/changes/commitar-back-e-front/`.
- [x] 2.2 `openspec archive corrigir-fade-in-reduced-motion`; verificar que a pasta apareceu em `openspec/changes/archive/2026-09-02-corrigir-fade-in-reduced-motion/`.
- [x] 2.3 `openspec archive corrigir-flakiness-testes-paralelos`; verificar que a pasta apareceu em `openspec/changes/archive/2026-09-02-corrigir-flakiness-testes-paralelos/`.

## 3. Commitar e verificar o fechamento do ciclo

- [ ] 3.1 `git add openspec/changes` e commitar (`chore(opsx): arquivar changes concluídas`); verificar com `git diff --stat HEAD~1` que só arquivos sob `openspec/changes/` mudaram (nenhum arquivo em `src/`).
- [ ] 3.2 `git push origin main`; verificar com `git rev-list --left-right --count origin/main...HEAD` que o resultado é `0 0`.
- [ ] 3.3 Rodar `openspec list --json` e verificar que `changes` retorna vazio (nenhuma change ativa).
- [ ] 3.4 Rodar `git status` e verificar working tree limpo.
