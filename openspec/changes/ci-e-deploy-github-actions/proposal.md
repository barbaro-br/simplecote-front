## Why

O `simplecote-front` não tem CI. A Vercel Git integration publica a cada push em
`main` **independentemente dos testes** — dá pra subir build quebrado direto na URL da
demo do cliente. Já houve episódio da Vercel ficar ~17h sem deployar sem ninguém
notar. Falta um portão: só publica o que passou no CI, e a falha fica visível.

## What Changes

- **Novo** `.github/workflows/deploy.yml` no `simplecote-front`, com dois jobs:
  - `ci` — roda em `pull_request` (qualquer) e `push` em `main`: `npm ci`,
    `npm run build` (`tsc -b && vite build`), `npx vitest run`, `npx oxlint`.
  - `deploy` — `needs: [ci]`, roda **só** em `push` em `main`: publica na Vercel via
    CLI com artefato pré-buildado (`vercel pull` → `vercel build --prod` →
    `vercel deploy --prebuilt --prod`). `concurrency` por branch, cancelando deploy
    anterior em andamento, pra não empilhar.
- **Passo manual** (listado no `tasks.md`, não executado): cadastrar os secrets
  `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` no repo e **desligar** o deploy de produção
  automático da Vercel, pra não duplicar publish.
- **Não** mexe no `.github/workflows/copilot-setup-steps.yml` existente.

Fora de escopo: o `simplecote-back` (Heroku) — será tratado num change próprio no
outro repo.

## Capabilities

### New Capabilities
_Nenhuma._ Mudança de infraestrutura/tooling: não há comportamento de produto
observável em spec. `.openspec.yaml` declara `skip_specs: true`.

### Modified Capabilities
_Nenhuma._

## Impact

- **Arquivos:** adiciona `.github/workflows/deploy.yml`. Nenhum código de aplicação,
  dependência ou config de build muda.
- **Plataforma:** GitHub Actions passa a ser o único caminho de publish; a Vercel Git
  auto-deploy é desligada manualmente.
- **Secrets do repo `barbaro-br/simplecote-front`:** usa `VERCEL_TOKEN` (já existe) e
  passa a exigir `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`.
- **Custo:** repo público → minutos de Actions ilimitados/grátis.
- **Risco:** janela entre desligar o auto-deploy nativo e o primeiro run verde do
  Actions. Mitigação: cadastrar secrets antes, validar com um PR trivial, só então
  desligar o auto-deploy e dar o primeiro push em `main`.
