## 1. Apagar changes mortas

- [x] 1.1 Remover `openspec/changes/saas-multi-tenant-transformation/` (não há comando CLI de delete — usar `rm -rf`); verificar que o diretório sumiu e `openspec list --json` não a lista mais.
- [x] 1.2 Remover `openspec/changes/preparar-deploy-2026-08-31/` (idem `rm -rf`); verificar que `openspec list --json` não a lista mais.

## 2. Arquivar as seis concluídas (na ordem que evita conflito de sync)

- [x] 2.1 Rodar `/opsx/archive corrigir-salto-navegacao` e confirmar o sync do delta de `core/setup`; verificar que a change vai para `archive/`.
- [x] 2.2 Rodar `/opsx/archive corrigir-preco-unitario-representante` e confirmar o sync de `representante/cotacao`.
- [x] 2.3 Rodar `/opsx/archive design-system-polish` e confirmar o sync de `shared/design-system`.
- [x] 2.4 Rodar `/opsx/archive escalar-grade-e-ajustar-quantidade` e confirmar o sync de `admin/cotacoes`.
- [x] 2.5 Rodar `/opsx/archive separar-dashboard-e-cotacoes` e confirmar o sync de `admin/painel-insights` + `admin/cotacoes`.
- [x] 2.6 Rodar `/opsx/archive redesenhar-painel-e-analises` e confirmar o sync de `admin/painel-insights` + `admin/analises`.

## 3. Verificação final

- [x] 3.1 Rodar `openspec list --json` e confirmar que não restam as 8 changes antigas — só `limpar-changes-pendentes` fica ativa até seu próprio archive.
