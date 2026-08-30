## Context

Ver `proposal.md — Why`. Fatos que definem a implementação:

- **`9c45e33`** ("feat: refina UX de compartilhamento…") fez, além da feature, um
  "housekeeping" que apagou conteúdo por engano. Diffs desse commit para os 3 arquivos:
  - `.env.example`: deleção pura de 18 linhas (doc de `VITE_API_BASE_URL`, fluxo de
    env var na Vercel, perfil `dev:heroku`). Sobrou 1 linha.
  - `vite.config.ts`: deleção pura de 4 blocos de comentário (link do doc; explicação
    do proxy `/api`+`/public` e do modo `heroku`; explicação do `stripOrigin`;
    explicação do chunk `vendor`). Nenhuma mudança de lógica.
  - `index.html`: reformatação (perdeu a indentação de 2 espaços e a newline final) +
    **troca intencional** do `<title>` para `Sarah Supermercado Cotações`.
- **`deploy.yml`** (na `main`) dispara em `push: branches: [main]` e `pull_request`
  sem filtro de path. O job `deploy` (`needs: [ci]`, `if` push+main) publica na Vercel.
- **`openspec/changes/melhorias-ux-admin/`** é um diretório vazio (sem `.openspec.yaml`,
  não versionado — git ignora dir vazio). `openspec list` lê o filesystem e o reporta.
- **`ci-e-deploy-github-actions`** está mergeado em `main`; tasks 1–3 e 4.1 marcadas,
  4.2/4.3 verificadas ao vivo nesta sessão (deploy publicou, `simplecote-front.vercel.app`
  HTTP 200), mas os checkboxes não estão marcados e a change não foi arquivada.

## Goals / Non-Goals

**Goals:**
- Push só-de-docs em `main` não gasta build+deploy.
- `.env.example` e os comentários de `vite.config.ts` de volta ao que eram antes do
  `9c45e33`, sem reverter a feature nem o `<title>`.
- `openspec list` limpo; `ci-e-deploy-github-actions` arquivada.

**Non-Goals:**
- Mexer em lógica de `vite.config.ts` (proxy, chunks) — só devolver comentário.
- `paths-ignore` no `pull_request` (check verde em PR de docs é barato e útil).
- Tocar no refresh visual, no `refinar-ux…`, em feature de Fase 3 ou no walkthrough.

## Decisions

### D1. `paths-ignore` só no gatilho `push`

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - 'openspec/**'
      - 'docs/**'
      - '**/*.md'
  pull_request:
```

Se um push em `main` toca **apenas** esses caminhos, o workflow inteiro não roda —
logo o `deploy` não publica. Lista conservadora: qualquer mudança em `src/**`,
`*.config.*`, `package*.json`, `index.html`, `.github/**` etc. continua disparando
tudo. `pull_request` fica sem filtro de propósito (ver Non-Goals).

Alternativa descartada: filtrar por path só o job `deploy` (via `dorny/paths-filter`).
Mais peça móvel; e rodar `ci` num push só-de-docs também não agrega.

### D2. Restauração = conteúdo de `9c45e33^` + as mudanças intencionais por cima

- `.env.example` → `git show 9c45e33^:.env.example` na íntegra (o `9c45e33` só deletou).
- `vite.config.ts` → devolver os 4 blocos de comentário nas mesmas posições; a lógica
  atual já é a de `9c45e33^` + os fixes posteriores (`3ab82bf`, `bb9220d`), então **não**
  se faz checkout do arquivo inteiro — só reintroduzir os comentários.
- `index.html` → reindentar com 2 espaços e newline final (formato `9c45e33^`),
  **mantendo** `<title>Sarah Supermercado Cotações`.

### D3. Tudo num PR só para `main`

Como o PR toca `.github/workflows/deploy.yml` e `vite.config.ts`, ele **não** é
só-de-docs: o `ci`+`deploy` rodam no merge (valida o YAML novo e republica). O
`paths-ignore` passa a valer para os *próximos* pushes. Sem chicken-egg.

O arquivamento de `ci-e-deploy-github-actions` (mover a pasta para `archive/`) entra
no mesmo PR — é `git mv` + edição de 2 checkboxes, e mantém `openspec list` coerente
com o que está em `main`.

## Risks / Trade-offs

- **`paths-ignore` engole uma mudança real** → lista restrita a docs/markdown/openspec;
  revisável no diff do PR.
- **Reintroduzir comentário em `vite.config.ts` conflita com um fix posterior** →
  improvável (os fixes `3ab82bf`/`bb9220d` mexeram em `vercel.json` e no `stripOrigin`,
  não nas linhas de comentário); a checagem é `tsc -b` + `npm run build` verdes.
- **Arquivar `ci-e-deploy…` com as tasks 4.2/4.3 marcadas sem "prova" no arquivo** →
  a verificação ao vivo está registrada nesta sessão e na aba Actions (run 33283865042).

## Migration Plan

1. PR único: `deploy.yml` (paths-ignore) + `.env.example` + `vite.config.ts` +
   `index.html` + `git mv` de `ci-e-deploy-github-actions` para `archive/` + `rmdir`
   do `melhorias-ux-admin`.
2. Merge em `main` → `ci` (build/test/lint) + `deploy` rodam e revalidam.
3. Rollback: reverter o PR. `paths-ignore` some, comentários voltam ao estado
   `9c45e33`, change desarquiva.
