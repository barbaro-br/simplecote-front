## Context

Ver `proposal.md — Why` para a motivação. Estado atual e restrições que moldam a abordagem:

- **Deploy hoje:** Vercel Git integration disparando por push em `main` sem olhar
  teste nenhum.
- **Front:** Vite + React, Node `>=24 <25` (`package.json engines`). Scripts:
  `build` = `tsc -b && vite build`, `test` = `vitest run`, `lint` = `oxlint`.
  `vercel.json` já define `buildCommand` e `outputDirectory: dist`.
- **Vercel:** projeto `prj_3KCt0k8mPZAbYNr8pRaLZCXiBVHa`, team slug
  `franciscos-projects-f9cf29b7`. Secret `VERCEL_TOKEN` já existe no repo.
  O `VERCEL_ORG_ID` (team id `team_…`) é obtido pelo usuário e cadastrado como
  secret (ver `tasks.md`).
- **Não tocar** em `.github/workflows/copilot-setup-steps.yml`.
- **Escopo:** só o `simplecote-front`. O `simplecote-back` (Heroku) fica para um
  change próprio no outro repo.

## Goals / Non-Goals

**Goals:**
- Um portão real: nada publica sem o CI verde do mesmo commit.
- Falha de build/teste/lint visível na aba Actions e no check do PR.
- Publish idempotente e sem empilhar (deploy antigo em voo é superado pelo novo).
- Zero deploy duplicado: Actions passa a ser o único caminho.

**Non-Goals:**
- Preview deploy por PR (só produção em `main`).
- Migração de plataforma (segue Vercel).
- Matriz de versões, cache além do nativo das actions, ou release notes automáticas.
- Qualquer coisa do `simplecote-back`.

## Decisions

### D1. Um arquivo `deploy.yml` com jobs `ci` e `deploy`, no lugar de dois workflows

Jobs no mesmo arquivo tornam a dependência `deploy needs: [ci]` explícita e mantêm um
só lugar pra ler o pipeline. Alternativa (workflow `ci.yml` + workflow `deploy.yml`
acoplados por `workflow_run`) foi descartada: `workflow_run` roda em contexto
separado, complica o `if` de branch e a leitura dos logs, e é fonte comum de "deploy
disparou do commit errado".

### D2. `deploy` travado por `needs: [ci]` **e** por `if` de evento/branch

```yaml
deploy:
  needs: [ci]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

`needs` garante "só se o ci passou"; o `if` garante "só em push em main" (em PR o job
`deploy` nem aparece). Os dois juntos: um push em `main` com CI vermelho não deploya,
e nenhum PR deploya.

### D3. Deploy → Vercel via CLI com artefato pré-buildado

Fluxo `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`. O
build acontece no runner (não nos build servers da Vercel), então o que sobe é
exatamente o que o CI validou, e a config vem do `vercel.json` versionado.
Alternativas descartadas:
- **Manter a Vercel Git integration** — é o problema que este change resolve (deploya sem CI).
- **`amondnet/vercel-action` ou similar** — wrapper de terceiro sobre o mesmo CLI;
  mais uma dependência sem ganho.

`VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` entram como `env:` do job (o CLI precisa deles
pra resolver o projeto sem link interativo). Token sempre por `--token=${{ secrets.VERCEL_TOKEN }}`.

### D4. `concurrency` a nível de job, só no `deploy`

```yaml
concurrency:
  group: deploy-front-${{ github.ref }}
  cancel-in-progress: true
```

Por branch, cancelando deploy em voo: dois merges seguidos em `main` → só o mais novo
publica, sem corrida de quem termina por último. Não se põe `concurrency` a nível de
workflow pra não interferir nos runs de `ci` de PRs paralelos.

### D5. Versões e passos

`actions/checkout@v4`, `actions/setup-node@v4` com `node-version: 24` e `cache: npm`.
Passos de CI separados (`npm ci`, `npm run build`, `npx vitest run`, `npx oxlint`) pra
a aba Actions apontar qual quebrou. `npx vitest run` / `npx oxlint` equivalem a
`npm test` / `npm run lint`.

### Referência — `.github/workflows/deploy.yml` do `simplecote-front` (entregue por este change)

```yaml
name: CI e Deploy

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx vitest run
      - run: npx oxlint

  deploy:
    needs: [ci]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    concurrency:
      group: deploy-front-${{ github.ref }}
      cancel-in-progress: true
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - name: Checar secrets da Vercel
        run: |
          for v in VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID; do
            if [ -z "${!v}" ]; then echo "::error::secret $v vazio ou ausente no repositório"; exit 1; fi
          done
      - run: npm i -g vercel@latest
      - run: vercel pull --yes --environment=production
      - run: vercel build --prod
      - run: vercel deploy --prebuilt --prod
```

O Vercel CLI lê `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` do ambiente —
não precisa de `--token=` na linha (que quebra com "missing a value" se o secret
vier vazio). O passo "Checar secrets" falha cedo e com mensagem clara nesse caso.

## Risks / Trade-offs

- **Janela sem deploy** entre desligar o auto-deploy nativo e o primeiro run verde do
  Actions → Migration Plan cadastra os secrets e valida com PR **antes** de desligar o nativo.
- **`vercel@latest` não fixado** pode quebrar por mudança do CLI → aceitável no curto
  prazo; ver Open Questions para fixar depois.
- **`npx oxlint` hoje só emite warnings** (exit 0). Se alguém promover uma regra a
  erro, o CI passa a barrar — comportamento desejado, mas é uma mudança de
  sensibilidade a registrar.
- **Build roda duas vezes num push em main** (uma no job `ci`, outra no `vercel build`
  do job `deploy`) → custo aceitável (repo público, minutos grátis); evita passar
  artefato entre jobs.

### D6. Desligar o auto-deploy nativo por config, não por toggle no dashboard

`vercel.json` ganha `"git": { "deploymentEnabled": { "main": false } }`. Pushes em
`main` deixam de disparar deploy automático via Git; o `vercel deploy --prebuilt
--prod` do job `deploy` continua funcionando (a flag só afeta o gatilho automático).
Vantagem sobre o toggle em Settings → Git: versionado, revisável no PR, e entra em
vigor no mesmo merge que ativa a pipeline — um merge faz o cutover inteiro.

## Migration Plan

1. **Secrets:** `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` no repo (feito).
2. **PR** com `deploy.yml` + o bloco `git.deploymentEnabled` no `vercel.json`.
   Conferir na aba Actions: job `ci` roda no PR, job `deploy` **não** aparece.
3. **Merge em `main`:** `ci` roda; passando, `deploy` publica na Vercel via CLI. O
   `git.deploymentEnabled.main=false` já vale nesse commit, então a Vercel **não**
   cria um deployment "via Git" pra esse merge — só o do Actions. Conferir no log do
   Actions e na URL da demo.
4. **Rollback:** remover o bloco `git.deploymentEnabled` (volta o auto-deploy nativo)
   e/ou desabilitar o `deploy.yml`. Reverter o que subiu: Vercel → promover o
   deployment anterior (ou `vercel rollback`).

## Open Questions

- Fixar o Vercel CLI numa versão (`vercel@<x.y.z>`) em vez de `@latest`? Deferível:
  não muda a abordagem nem as tasks, é troca de uma linha quando/se o `@latest` doer.
- Adicionar `concurrency` a nível de workflow pra cancelar runs de `ci` superados no
  mesmo PR? Otimização de minutos, deferível.
