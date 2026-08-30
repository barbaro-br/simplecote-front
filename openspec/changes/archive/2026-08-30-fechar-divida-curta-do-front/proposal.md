## Why

Com o CI+deploy do front no ar, sobrou um punhado de dívida curta que já morde:

- O `deploy.yml` roda o workflow inteiro (inclui `deploy` → publish na Vercel) em
  **qualquer** push em `main`, mesmo os só-de-docs. Fechar o `tasks.md` ou editar um
  `openspec/**` dispara um redeploy de build idêntico.
- O commit `9c45e33` comeu conteúdo por engano: `.env.example` foi de 19 → 1 linha
  (perdeu toda a doc de `VITE_API_BASE_URL`, do fluxo de env var na Vercel e do perfil
  `dev:heroku`), e `vite.config.ts` / `index.html` perderam comentários explicativos.
- Ficou um diretório vazio órfão `openspec/changes/melhorias-ux-admin/` que faz o
  `openspec list` reportar uma change fantasma.
- O change `ci-e-deploy-github-actions` está mergeado em `main` e verificado ao vivo
  (deploy publicando em `simplecote-front.vercel.app`) mas não foi arquivado.

## What Changes

- **`deploy.yml`**: adiciona `paths-ignore` ao gatilho `push` — pushes em `main` que
  só tocam `openspec/**`, `docs/**` ou `**/*.md` não rodam o workflow (logo, não
  deployam). O gatilho `pull_request` fica sem filtro (checks verdes são baratos).
- **Restaura o conteúdo perdido em `9c45e33`**: reconstrói `.env.example` completo,
  os comentários de `vite.config.ts` e os de `index.html`, a partir de `9c45e33^`,
  preservando as mudanças intencionais daquele commit (título `index.html`, ajuste do
  `.gitignore`).
- **Remove** o diretório vazio `openspec/changes/melhorias-ux-admin/`.
- **Arquiva** `ci-e-deploy-github-actions` (marca as tasks 4.2/4.3, já verificadas ao
  vivo nesta sessão, e move para `openspec/changes/archive/`).

Fora de escopo (ficam para outros changes/PRs): o refresh visual e o arquivamento do
`refinar-ux-compartilhamento-e-resposta-cotacao` (ambos vivem na branch local
`refresh-visual-figma-make`, viram PR próprio); qualquer feature da Fase 3; o
walkthrough da demo.

## Capabilities

### New Capabilities
_Nenhuma._ Tooling de CI, conteúdo de exemplo/comentários e bookkeeping de OpenSpec —
sem comportamento de produto observável em spec. `.openspec.yaml` declara `skip_specs: true`.

### Modified Capabilities
_Nenhuma._

## Impact

- **Arquivos:** `.github/workflows/deploy.yml`, `.env.example`, `vite.config.ts`,
  `index.html`. Nenhuma mudança de código de aplicação, dependência ou lógica de build.
- **CI/CD:** menos runs — pushes só-de-docs em `main` deixam de disparar build+deploy.
- **OpenSpec:** `openspec list` deixa de mostrar a change fantasma; `ci-e-deploy-github-actions`
  sai de "ativa" para arquivada.
- **Risco:** `paths-ignore` mal calibrado poderia pular CI de uma mudança real. Mitigação:
  a lista de ignore é conservadora (só docs/markdown/openspec); qualquer alteração em
  `src/**`, config ou `package.json` continua disparando tudo.
