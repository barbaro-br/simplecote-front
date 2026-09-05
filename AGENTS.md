# AGENTS.md — simplecote-front

Lido por qualquer agente de código que trabalhe neste repositório (Antigravity, Claude Code, opencode…).
Regras curtas e duras. Se uma bater de frente com o que você "acha melhor": as regras ganham.

## O que é este projeto

SimpleCote é uma plataforma de **cotação competitiva (leilão reverso)**: um Comprador (supermercado)
abre uma cotação e convida Representantes (fornecedores) a dar preço nos mesmos itens. Este repo é o
**front-end**. A fonte da verdade do domínio e do contrato da API é o repo irmão
`simplecote-back/spec.md`; a especificação deste front está em [`spec.md`](./spec.md). **Leia a seção
relevante do `spec.md` (arquitetura §5, regras §4, fases §7) antes de codar uma feature.**

Duas áreas, dois públicos:
- **Painel do admin** (`/admin/**`) — desktop-first, denso em dado (tabelas, grade de preços). Login real via JWT.
- **Tela do representante** (`/cotacao/:token`, `/pedido/:token`) — mobile-first, aberta por link mágico, sem login. Tema claro forçado (`TemaClaro`).

## Regras de disciplina (toda change)

1. **Faça só o que a tarefa pede.** Nada de melhoria em código adjacente, arquivo novo,
   dependência ou abstração que a tarefa não exige. Um arquivo que a change **não nomeia** não entra no diff sem você dizer **qual arquivo e por quê**.
2. **Edite o código ANTES de marcar `[x]`.** Nunca marque tarefa concluída sem um diff correspondente.
3. **Checagem de Saúde OBRIGATÓRIA:** depois de cada tarefa rode `npm test`, `npm run build` e `npm run lint`. **Vermelho = pare.**
4. **Resolução de Erros e Limite de Tentativas:** se algo quebrar após sua alteração, faça no máximo **3 tentativas** de correção. Se falhar na 3ª, **desfaça a alteração daquela tarefa (git restore/checkout)** e chame o humano.
5. **Busca de Impacto (Discovery Obrigatório):** antes de alterar a assinatura de uma função, componente, hook ou tipo exportado, **busque ativamente (grep)** onde é usado no repo e atualize os consumidores. Se o impacto for grande (20+ arquivos), avise antes.
6. **Integridade de Testes:** nunca edite um teste pré-existente pra ele passar, a menos que o comportamento tenha mudado de propósito — e aí diga o porquê.
7. **Sem Commits:** não commite nem pushe. Deixe as mudanças no working tree.
8. **Não "conserte" infra fora da change:** setup de MSW, config de render, helper de teste — só mexe se a tarefa for sobre isso.

## Autonomia e Modo "Auto-Approve"

1. **Permissão Total Autorizada:** com a flag de autonomia (`--dangerously-skip-permissions` ou IDE destravada), rode scripts, altere arquivos e avance tarefas **sem perguntar "posso continuar?"**.
2. **Execução Contínua:** vá de ponta a ponta na spec; só pare em impeditivo real (erro persistente ou ambiguidade de escopo).
3. **Tratamento de Exceções:** nenhuma exceção é engolida silenciosamente (ex: `catch(e) {}` vazio). Falha de API deve refletir na UI.

## Regras inegociáveis do código (spec.md §4)

1. O front **nunca decide regra de negócio**: valor derivado (`precoUnitario`, `podeEditar`, `menorPrecoUnitario`, apuração) já vem pronto da API — só formata pra exibição, não recalcula.
2. `preco` é sempre `number`, nunca string (no envio e no recebimento).
3. Data/hora da API é ISO-8601 UTC — formata pra `America/Sao_Paulo`/pt-BR só na exibição (via `src/shared/format/formatters.ts`).
4. Toda tela/componente novo tem teste (Vitest + RTL); fluxo com mutação tem teste do estado otimista e do rollback em erro.
5. Erro de mutação exibido ao usuário vem de `ApiError.message` (ProblemDetail traduzido) — nunca um "algo deu errado" genérico quando a API já mandou o motivo em pt-BR.
6. **Idioma:** rótulos/mensagens/erros em **pt-BR**; nomes de arquivo/hook/componente em **inglês**, salvo nomes de domínio (`ProdutoForm`, não `ProductForm`).
7. **Mobile-first literal** na árvore do representante: 375px primeiro; desktop é o enhancement, não o padrão.
8. Operação irreversível (apurar, cancelar, duplicar) sempre passa por diálogo de confirmação nomeando a consequência.
9. A **fila de sincronização** (`representante/cotacao/fila-sincronizacao.ts`) nunca é opcional — todo formulário de preço do representante passa por ela.

## Stack e comandos

- React 19 + Vite + TypeScript (`strict`), react-router-dom v7, TanStack Query (todo fetch/mutation — inclusive grid ao vivo por polling e autosave), react-hook-form + zod, Tailwind v4 + componentes hand-rolled estilo shadcn em `src/shared/components/ui/` (@base-ui/react), Recharts (análises), @zxing/browser (bipagem), Intl pt-BR, localStorage (fila de rascunhos), sonner, lucide-react.
- `npm run dev` · `npm test` (vitest run) · `npm run build` (`tsc -b && vite build`) · `npm run lint` (oxlint).
- **Zero dependência nova** (ex: `shadcn add`) sem aprovação explícita.

## Arquitetura (pasta por feature)

```
src/
├── admin/          logado: layout, produtos, empresas, representantes, cotacoes, analise, usuarios
├── representante/  público por token: cotacao, pedido (+ TemaClaro)
└── shared/         api (api-client), auth (AuthContext/AuthGuard), components/ui, domain (tipos-base),
                    format (formatters), hooks, test (MSW), utils (cnpj)
```

Padrão por feature: `*.schema.ts` (zod, espelha a Bean Validation do back) → `*.api.ts` (chamadas via `api` de `shared/api/api-client.ts`) → hook/`useQuery` → componente. `ProblemDetail` vira `ApiError`; `401` vira `SessaoExpiradaError` (redireciona pro login — não exibir).

## Testes

Vitest + React Testing Library + MSW (`setupTests.ts`, `onUnhandledRequest: 'error'`). **Passar no MSW não garante a integração real** — o contrato é o `simplecote-back/spec.md` §12. Se mexeu no contrato, alinhe o back também. `spec.md` nem sempre detalha campo a campo: pra conferência exata, compare o schema Zod contra o DTO Java real (`simplecote-back/src/main/java/**/dto/*.java`) — skill `contrato-drift`. Mismatch de nome de campo não quebra nada visível, só faz o dado sumir/cair em fallback — já aconteceu (`insightProdutoSchema` vs `InsightProdutoDTO`).

## Como rodar

1. Back no repo irmão: `AUTH_ENABLED=true ./mvnw spring-boot:test-run` (sobe em `:8080`, requer Docker).
2. Aqui: `cp .env.example .env.development` e `npm run dev` (Vite em `:5173`).
3. Login: `admin@dev.local` / `admin123`. JWT em `sessionStorage`; `401` leva de volta ao `/login`.

## Deploy

Front (este repo) → **Vercel**, projeto `simplecote-front`. Back (`simplecote-back`) → **Heroku**,
app `immense-badlands-31311`. Nenhum dos dois é push manual pro provider — os dois são só
`git push origin main`; quem deploya de fato é o GitHub Actions.

- **Front** (`.github/workflows/deploy.yml`): push em `main` → `ci` (build+test+lint) → `deploy`
  (`vercel deploy --prebuilt --prod`) → smoke test que baixa o bundle publicado e confere se ele
  contém a URL do back e se `/actuator/health` responde 200. Smoke vermelho = o deploy **já foi ao
  ar** e está quebrado — rode `vercel rollback`, não tente consertar pra frente sob pressão.
- **Back** (`simplecote-back/.github/workflows/deploy.yml`): push em `main` → `mvn test`
  (Testcontainers) → `git push --force` pro remote git do Heroku com `HEROKU_API_KEY`. O buildpack
  `heroku/jvm` compila do lado de lá — daqui só sai o commit.
- **Nunca**: `git push heroku` direto, nem `vercel --prod` manual sem passar pelo CI. O pipeline é
  a fonte de verdade; push manual diverge do que está no GitHub e ninguém mais vê o que rodou.

## Decisões que parecem bug (não são)

- `vercel.json`: `deploymentEnabled.main: false` — integração nativa Git↔Vercel desligada de
  propósito, o deploy real é só via Actions (acima). Não reative.
- `VITE_API_BASE_URL` fixada como `env:` no `deploy.yml`, não como env var no painel da Vercel —
  proposital (URL do Heroku é pública; deploy não depende de config manual no painel). Não mova
  pra "Environment Variables" da Vercel — o guard do `vite.config.ts` espera vir do build.
- Postgres local (`spring-boot:test-run`) sobe via Testcontainers com **porta efêmera**, muda a
  cada restart do back. Não é ambiente quebrado; não hardcode essa porta em lugar nenhum.

## Mocks e pendências conhecidas

- `src/admin/configuracoes/configuracoes.api.ts` é mock em memória (comentário no próprio arquivo:
  "substituir pelas chamadas reais... task 4.1"). A tela de Configurações não persiste nada de
  verdade hoje — `GET/PUT /api/configuracoes` já existe e funciona no back, o front só nunca chama.
  Se for mexer nessa tela, isso é o bug a resolver antes de qualquer feature nova em cima dele.

## OpenSpec

Mudanças planejadas usam OpenSpec (`openspec/`): `propose` → `apply` → `archive` (skills/commands em `.claude/` e `.agents/`). Specs canônicas em `openspec/specs/**`. Nunca arquive uma change sem o diff correspondente.

## Handoff — ao terminar a change OU ao parar

Escreva um resumo com:
- **Arquivos novos e modificados** (caminho + resumo de 1 linha).
- **Testes pré-existentes alterados** e qual comportamento justificou.
- **Fora do escopo** que entrou no diff e o motivo.
- **Status da suíte:** resultado de `npm run build` / `npm test` / `npm run lint`.
