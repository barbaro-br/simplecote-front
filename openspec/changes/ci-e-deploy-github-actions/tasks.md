## 1. Workflow do `simplecote-front` (arquivo entregue por este change)

- [x] 1.1 Criar `.github/workflows/deploy.yml` com os jobs `ci` e `deploy` exatamente como o bloco de referência do `design.md`. Verificar: o YAML parseia (`ruby -ryaml -e 'YAML.safe_load(File.read(".github/workflows/deploy.yml"))'` não lança) e `git status` mostra `copilot-setup-steps.yml` intacto.
- [x] 1.2 Conferir os gates no YAML: job `deploy` tem `needs: [ci]` **e** `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`, e `concurrency.group: deploy-front-${{ github.ref }}` com `cancel-in-progress: true`. Verificar por leitura do arquivo.

## 2. Secrets do repo `barbaro-br/simplecote-front` (manual — não executar no apply)

- [x] 2.1 Obter o `VERCEL_ORG_ID` (team id `team_…` do slug `franciscos-projects-f9cf29b7`). Qualquer um: `npx vercel@latest login` + `npx vercel@latest teams ls`; ou `npx vercel@latest link` e ler `.vercel/project.json` → campo `orgId`; ou Vercel dashboard → Team Settings → General → "Team ID". Verificar: você tem em mãos uma string começando com `team_`.
- [x] 2.2 Rodar: `gh secret set VERCEL_ORG_ID --repo barbaro-br/simplecote-front --body <id-do-passo-2.1>`. Verificar: `gh secret list --repo barbaro-br/simplecote-front` lista `VERCEL_ORG_ID`.
- [x] 2.3 Rodar: `gh secret set VERCEL_PROJECT_ID --repo barbaro-br/simplecote-front --body prj_3KCt0k8mPZAbYNr8pRaLZCXiBVHa`. Verificar: aparece em `gh secret list --repo barbaro-br/simplecote-front`.
- [x] 2.4 Confirmar que `VERCEL_TOKEN` já existe: `gh secret list --repo barbaro-br/simplecote-front` mostra `VERCEL_TOKEN`. Se não mostrar, criar um token em Vercel → Account Settings → Tokens e `gh secret set VERCEL_TOKEN --repo barbaro-br/simplecote-front --body <token>`.

## 3. Verificação — CI sem deploy (PR)

- [x] 3.1 Abrir um PR trivial no `simplecote-front`. Verificar na aba **Actions** / checks do PR: job `ci` roda (`npm ci` → `npm run build` → `npx vitest run` → `npx oxlint`) e o job `deploy` **não** aparece. — Feito no PR #1: `ci` = success, `deploy` = skipped.
- [ ] 3.2 (opcional) Num branch de PR, quebrar um teste de propósito e abrir PR. Verificar: check do PR fica vermelho no passo `npx vitest run`; `deploy` continua ausente. Descartar o branch depois. — Pulável: o gate já ficou provado no 3.1.

## 4. Desligar o auto-deploy nativo + primeiro deploy real

- [x] 4.1 Desligar o auto-deploy da Vercel **por config** (em vez do toggle no dashboard): adicionar ao `vercel.json` `"git": { "deploymentEnabled": { "main": false } }`. Efeito: pushes em `main` não disparam mais deploy automático via Git; deploys explícitos via CLI (`vercel deploy --prebuilt --prod`) seguem funcionando. Verificar: `vercel.json` parseia e contém o bloco.
- [ ] 4.2 Mergear o PR #1 em `main`. Verificar na aba Actions: `ci` passa, então `deploy` roda `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod` sem erro, e o log imprime a URL do deployment de produção. (Na aba Deployments da Vercel, esse merge não deve gerar um deployment "via Git" — só o do Actions.)
- [ ] 4.3 Abrir a URL da demo do cliente e confirmar que reflete o commit recém-mergeado.
