## 1. Back — commits (em `simplecote-back`)

- [x] 1.1 Commit `feat: permitir alterar quantidade após abertura (relaxar regra)` — `git add src/main/java/com/simplecote/cotacao/Cotacao.java src/test/java/com/simplecote/cotacao/CotacaoTest.java src/test/java/com/simplecote/cotacao/CotacaoServiceTest.java openspec/specs/cotacoes/edit-item-quantity/spec.md` e commitar; verificar `git diff --cached` só contém a regra de quantidade.
- [x] 1.2 Commit `chore: endurecer segurança de produção (JWT + actuator)` — `git add` de `SecurityConfig.java`, `CorsGlobalConfig.java`, `application.properties`, `application-dev.properties`, `src/test/resources/application.properties`, `JwtInfraTest.java`, `AutenticacaoControllerTest.java`, `openspec/specs/autenticacao/spec.md`; verificar que não sobra fallback de segredo.
- [x] 1.3 Commit `docs: sincronizar spec.md com o código implementado` — `git add spec.md`; verificar que só `spec.md` entrou.
- [x] 1.4 Commit `chore(opsx): arquivar changes pendentes` — `git add` dos `openspec/changes/` (deletes + `archive/`); verificar que nenhum código de negócio entrou neste commit.

## 2. Front — commits (em `simplecote-front`)

- [ ] 2.1 Commit `fix: reset de scroll na navegação` — `git add src/shared/components/ui/route-transition.tsx` + `git add -p` de `AdminLayout.tsx` (hunk do `ScrollRestoration`) e de `routes.tsx` (se aplicável); verificar diff.
- [ ] 2.2 Commit `fix: autosave e preço unitário no representante` — `git add src/representante/cotacao/*`; verificar que só a árvore do representante entrou.
- [ ] 2.3 Commit `style: polir design system` — `git add src/shared/components/ui/button.tsx src/shared/components/ui/calendar.tsx src/index.css`; verificar diff.
- [ ] 2.4 Commit `style: centralizar conteúdo do admin` — `git add -p src/admin/layout/AdminLayout.tsx` (hunk do wrapper `max-w-7xl`) + `AdminLayout.test.tsx`; verificar diff.
- [ ] 2.5 Commit `feat: grade densa + ajuste de quantidade` — `git add` de `cotacoes.api.ts`, `CotacaoDetalhePage.tsx` + `git add -p` de `GradeAoVivoTabela.tsx` (sticky/z-index/quantidade); verificar diff.
- [ ] 2.6 Commit `style: polir grade ao vivo` — `git add -p src/admin/cotacoes/GradeAoVivoTabela.tsx` (alinhamento/badges/cartão) + `GradeAoVivoTabela.test.tsx`; verificar diff.
- [ ] 2.7 Commit `feat: dashboard como página inicial` — `git add` de `DashboardPage.tsx` + `git add -p` de `routes.tsx`, `CotacoesPage.tsx`, `AdminLayout.tsx` (hunks do menu/rota); verificar diff.
- [ ] 2.8 Commit `feat: análises por período` — `git add` de `AnalisesPage.tsx`, `PainelDashboard.tsx`, `analise.api.ts`, `analise.schema.ts` (+ testes); verificar diff.
- [ ] 2.9 Commit `feat: consolidar representante na empresa` — `git add -A src/admin/representantes/ src/admin/empresas/` + `git add -p` de `routes.tsx`, `RepresentantesModal.tsx` (hunks da consolidação); verificar diff.
- [ ] 2.10 Commit `chore(opsx): arquivar changes e sincronizar specs` — `git add openspec/` (specs M, `archive/`, deletes) + `AGENTS.md` `ROADMAP.md`; verificar que nenhum código de app entrou.

## 3. Push e verificação

- [ ] 3.1 No back: `git push origin main`; verificar o build/CI do back.
- [ ] 3.2 No front: `git push origin main`; verificar o build na Vercel.
