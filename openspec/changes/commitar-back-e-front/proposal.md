## Why

O working tree dos dois repos acumulou semanas de trabalho não versionado: o front tem 102 arquivos pendentes e o back 28, distribuídos por ~13 changes do openspec já concluídas (código) mas nunca commitadas. Sem commits, o histórico não reflete o estado real e nada está publicado. Esta change versiona tudo em commits **granulares por change/task**, com mensagens convencionais em pt-BR, e faz push na `main` dos dois repos.

## What Changes

- **Back (`simplecote-back`) — 4 commits:**
  1. `feat:` relaxar a regra de quantidade (`Cotacao.alterarQuantidadeItem` permite `ABERTA`/`ENCERRADA`).
  2. `chore:` endurecer segurança de produção (segredo JWT sem fallback + actuator restrito ao health).
  3. `docs:` sincronizar `spec.md` com o código implementado (SSE, endpoints, DDL).
  4. `chore(opsx):` arquivar changes pendentes do openspec.

- **Front (`simplecote-front`) — ~11 commits:**
  1. `fix:` reset de scroll na navegação (`corrigir-salto-navegacao`).
  2. `fix:` autosave + preço unitário no representante (`corrigir-preco-unitario-representante`).
  3. `style:` polir design system (`design-system-polish`).
  4. `style:` centralizar conteúdo do admin (`centralizar-conteudo-admin`).
  5. `feat:` grade densa + ajuste de quantidade (`escalar-grade-e-ajustar-quantidade`).
  6. `style:` polir grade ao vivo (`polir-grade-ao-vivo`).
  7. `feat:` dashboard como página inicial (`separar-dashboard-e-cotacoes`).
  8. `feat:` análises por período (`redesenhar-painel-e-analises`).
  9. `feat:` consolidar representante na empresa (`consolidar-representante-na-empresa`).
  10. `chore(opsx):` arquivar changes e sincronizar specs.

- **Push:** `git push origin main` nos dois repos ao final.

## Capabilities

### New Capabilities

### Modified Capabilities

Nenhuma. Housekeeping de versionamento puro — nenhum requisito de sistema muda. (`skip_specs: true`)

## Impact

- Dois repositórios: `simplecote-back` (4 commits) e `simplecote-front` (~11 commits).
- **Sobreposição de arquivos:** vários arquivos foram tocados por mais de uma change (ex.: `GradeAoVivoTabela.tsx` por `escalar-grade` e `polir-grade`; `AdminLayout.tsx` por `corrigir-salto`, `centralizar-conteudo` e `separar-dashboard`; `CotacoesPage.tsx` e `routes.tsx` por múltiplas). Como o objetivo é **um commit por change**, esses arquivos exigem staging por hunk (`git add -p`) para separar as mudanças — operação manual/interativa.
- Mensagens seguem Conventional Commits em pt-BR (padrão já usado no histórico dos dois repos).
- Risco: `git add -p` é manual e propenso a erro; qualquer hunk mal separado mistura changes num commit. Mitigação: revisar `git diff --cached` antes de cada `commit`.
