## 1. `deploy.yml` — paths-ignore

- [x] 1.1 Em `.github/workflows/deploy.yml`, adicionar `paths-ignore` ao gatilho `push` (`openspec/**`, `docs/**`, `**/*.md`), deixando `pull_request` sem filtro. Verificar: `ruby -ryaml -e 'p YAML.safe_load(File.read(".github/workflows/deploy.yml"))["on"]["push"]["paths-ignore"]'` lista os 3 padrões; o resto do YAML (jobs, gates) intacto.

## 2. Restaurar conteúdo comido no `9c45e33`

- [x] 2.1 `.env.example`: substituir pelo conteúdo de `git show 9c45e33^:.env.example` (o commit só deletou 18 linhas). Verificar: `wc -l .env.example` ≈ 19 e contém as seções `VITE_API_BASE_URL`, fluxo Vercel e perfil `dev:heroku`.
- [x] 2.2 `vite.config.ts`: reintroduzir os 4 blocos de comentário removidos (link `https://vite.dev/config/`; explicação do proxy `/api`+`/public` e modo `heroku`; explicação do `stripOrigin`; explicação do chunk `vendor`) nas mesmas posições, **sem** tocar na lógica atual. Fonte: `git show 9c45e33^:vite.config.ts`. Verificar: `npx tsc -b` e `npm run build` verdes; `git diff` mostra só linhas de comentário adicionadas.
- [x] 2.3 `index.html`: reindentar com 2 espaços e restaurar a newline final (formato de `git show 9c45e33^:index.html`), **mantendo** `<title>Sarah Supermercado Cotações</title>`. Verificar: `npm run build` gera `dist/index.html` sem erro; `git diff` mostra só reindentação + newline.

## 3. Faxina de OpenSpec

- [x] 3.1 Remover o diretório vazio `openspec/changes/melhorias-ux-admin/` (`rmdir`). Verificar: `openspec list --json` não lista mais `melhorias-ux-admin`.
- [x] 3.2 Marcar `- [x]` as tasks 4.2 e 4.3 de `openspec/changes/ci-e-deploy-github-actions/tasks.md` (verificadas ao vivo: deploy publicou, `simplecote-front.vercel.app` HTTP 200, run 33283865042). Verificar: `openspec status --change ci-e-deploy-github-actions` mostra tasks 100%.
- [x] 3.3 Arquivar `ci-e-deploy-github-actions`: `git mv openspec/changes/ci-e-deploy-github-actions openspec/changes/archive/2026-08-30-ci-e-deploy-github-actions` (ou `openspec archive` equivalente). Verificar: `openspec list --json` não lista mais como ativa; a pasta existe em `archive/`.

## 4. Integração

- [ ] 4.1 Abrir PR único para `main` com tudo de 1–3. Verificar na aba Actions: como o PR toca `deploy.yml` e `vite.config.ts` (não é só-de-docs), o `ci` roda e passa; `deploy` fica `skipped` (é `pull_request`).
- [ ] 4.2 Após o merge: confirmar que o `deploy` rodou uma vez (revalida o publish) e que um push seguinte só-de-docs (ex.: editar um `openspec/**`) **não** dispara workflow. Verificar na aba Actions: sem run novo para o commit só-de-docs.
