# Tarefas — redesign-painel-dark

Fases entregues em sequência; cada uma fecha com o app navegável e `npm test`
verde antes de mergear em `main`.

## Onde está (2026-09-10)

Todo o app autenticado (admin, backoffice, telas de token do representante/
colaborador, auth) está no tema navy/mint: casca, primitivos do design
system em `src/shared/ui/`, e cada área re-tematizada. Todos os 17 modais
herdam o escuro pelo `Dialog`. Passe de reduced-motion/foco/contraste feito.
Suíte verde.

**Ficou para uma change à parte** (risco alto / mudança de rota, não
bloqueiam o merge do redesign):
- adicionar item inline na grade (hoje é o `AdicionarItemModal`);
- combobox de fornecedor inline (hoje é o `RepresentantesModal`; em RASCUNHO
  os selecionados já viram chip na tela);
- dobrar a `ResultadoPage` dentro da tela de detalhe como "modo resultado"
  (+ os redirects de `/cotacoes/nova` e `/:id/resultado`);
- reescrever `GradeAoVivoTabela` sobre `GradeDados`.

Marcadores: `[x]` feito · `[~]` feito com desvio consciente (motivo ao lado)
· `[ ]` aberto.

## Fase 0 — Design system (`src/shared/ui/`)

- [x] bloco em `index.css`: tokens `--pnl-*` no escopo `[data-painel="dark"]`,
      mapeados dos `--brand-*`, + remap dos tokens shadcn.
- [x] `Superficie`, `SecaoCabecalho`, `SubFaixa`, `RodapeAcao`.
- [x] `LinhaLista` (+ `avatar` de iniciais, estado `onClick` + foco visível).
- [x] `Selo` (tons sucesso/atenção/neutro/info/perigo).
- [x] `GradeDados` + `Celula` (normal / destaque / editável / linha 2ª).
- [x] `CampoEstat` (inline + bloco) + `RodapeAcao`.
- [x] `ChipsFiltro` (controlado, `aria-pressed`, foco visível).
- [x] `BotaoPrimario` / `BotaoFantasma` / `BotaoIcone` / `CampoTexto` / `Busca`.
- [x] `ui.test.tsx` cobre os primitivos; reduced-motion/foco/contraste no
      passe de acessibilidade.
- [~] `src/site/tech/telas/TelaCard` compõe `Superficie`+`SecaoCabecalho`;
      demais telas de demo da landing ainda têm markup próprio (baixa
      prioridade — vivem fora do `[data-painel]`).

## Fase 1 — Casca + flows por token

- [x] `/representante/:token`: grade escura com coluna "Seu preço" editável
      (`LinhaPreco`), `SecaoCabecalho`/`SubFaixa`/`Selo`, rodapé fixo
      "Enviar respostas" + bolha "N de T". Fila offline
      (`useFilaDeSincronizacao`) e limpar-preço (toast "Desfazer") mantidos.
      `ItemLanceCard` removido; `TelaDeSucesso`/`ConfirmarEnvioDialog`
      re-tematizados. Testes: 48 verdes (page + LinhaPreco).
- [x] `/colaborador/:token`: `Busca` + `Lista/LinhaLista` + `Superficie` nos formulários (bipagem/cadastro/quantidade), sem modal. Casca escura. Testes verdes.
- [x] `/pedido/:token` (representante): reescrita no painel escuro.
- [x] `TutorialOnboarding` + `VistoStatus` removidos (descreviam a UI antiga).
- [x] `[data-painel="dark"]` agora remapeia os tokens shadcn (--background,
      --card, --border, --primary, --muted…) pro navy/mint. `AdminLayout` +
      `BottomNavBar` entram nesse escopo: a casca inteira do admin fica
      escura e cada página herda os tokens (nada quebrado), antes de ser
      reescrita com os primitivos. 343 testes de admin verdes.
- [x] Casca do admin (`AdminLayout` + `BottomNavBar`) no escopo escuro; rail
      navy/mint. `CabecalhoPagina` é o cabeçalho padrão de todas as páginas.
- [x] Páginas do admin reescritas/re-tematizadas por área (ver Fases 2-6).

## Fase 2 — Cotação unificada

- [x] Fim do wizard: `NovaCotacaoPage` cria e vai DIRETO pra `/admin/cotacoes/:id`
      (RASCUNHO). `NovaCotacaoWizard`(.test) removidos. A montagem (itens +
      representantes + prazo) já acontece inline na tela de detalhe.
- [x] `CotacaoDetalhePage` reescrita como UMA `Superficie` igual em todo
      estado: `SecaoCabecalho` (título + `Selo` + Representantes) + `SubFaixa`
      (N itens · M fornecedores · prazo) + fila de chips de fornecedor
      (+ convidar, "X de Y entregues") + corpo (itens/grade) + `RodapeAcao`
      com `CampoEstat` + botão primário único por estado. `ItensSection`
      deixa de ser Card (renderiza dentro da Superficie). 136 testes verdes.
- [x] Cabeçalho da grade ao vivo (`GradeAoVivoContainer`) vira faixa de seção
      da mesma `Superficie` (ponto pulsante + contador + "Adicionar item"),
      sem o bloco solto com `mt-8`. Bug de sobreposição nome × stepper na
      coluna "Item" corrigido (trunca) + largura padrão 240 → 280 px.
- [ ] Adicionar item inline na última linha da `GradeDados` (`POST /itens`).
      Pendente: reescrita de risco alto (o `AdicionarItemModal` tem busca +
      multi-seleção + cadastro de produto empilhado). O modal já renderiza
      escuro e ganhou busca por código de barras — fica pra uma change à parte.
- [~] Chip-input de fornecedores (`POST/DELETE /participantes`). Parcial: em
      RASCUNHO os fornecedores escolhidos no modal já aparecem como chips
      com × na própria tela (antes a seleção era invisível até reabrir o
      modal). O combobox de digitar-e-adicionar inline fica pra depois.
- [ ] Botão primário único por estado; `AbrirCotacaoDialog` (prazo) mantido.
- [ ] `GradeDados` modo "resultado" (vencedor + economia/item) + `RodapeAcao`
      "Gerar pedidos" em ENCERRADA/PEDIDOS_GERADOS. Pendente junto com a
      dobra da `ResultadoPage` no detalhe. A economia estimada já aparece no
      `RodapeAcao` da cotação em ABERTA/ENCERRADA.
- [~] `ResultadoPage` re-tematizada com `CabecalhoPagina` + `Superficie` +
      `SubFaixa` + `Selo` (era `Card`/`CardHeader`/`CardTitle`). Só aparência —
      margem, expandir pedidos, XLSX/PDF, enviar, recotar intactos. 20 testes
      verdes. Falta ainda dobrar tudo dentro da tela de detalhe (modo resultado).
- [~] `CotacoesPage`: `CabecalhoPagina` + `Superficie` + chips de filtro +
      "+ Nova cotação". Mantida como `<table>` (título/status/prazo/valor são
      colunas escaneáveis; `LinhaLista` perderia densidade). `StatusBadge`
      já é `Selo`.
- [ ] Redirects: `/cotacoes/nova`, `/cotacoes/:id/resultado` → estado da tela.
      Pendente junto com "dobrar ResultadoPage no detalhe" — mudança de rota,
      risco alto. `NovaCotacaoWizard` já foi aposentado (Fase 2).
- [~] Aposentadorias: `NovaCotacaoWizard`(.test) removido. `NovaCotacaoPage`
      agora é uma casca fina (cria + navega). `AdicionarItemModal`,
      `RepresentantesModal`, `ItensSection`, `ResultadoPage`,
      `GradeAoVivoTabela` mantidos (renderizam no tema; reescrita completa =
      change à parte).

## Fase 3 — Catálogo

- [x] `produtos`, `empresas`, `usuarios`: `CabecalhoPagina` + `Superficie` +
      `ChipsFiltro` (Todos/Ativos/Inativos) + `Selo` pra situação/papel.
      Tabela mantida (colunas demais pra virar `LinhaLista`).
- [x] `StatusBadge` reescrito sobre o `Selo` — cotações, resultado e
      backoffice herdam o chip do design system.
- [ ] `representantes`: `LinhaLista` + `Selo` de vínculo (geridos dentro de
      `empresas`; sem tela própria).
- [x] Testes revisados (verdes).

## Fase 4 — Conta

- [x] `analise` / dashboard: `PainelDashboard` e `AnalisesPage` em
      `Superficie` + `SecaoCabecalho` + `CampoEstat`; próximos prazos em
      `Lista`/`LinhaLista`.
- [x] `organizacao` (`MembrosPage`), `configuracoes`: `Superficie` +
      `CabecalhoPagina`; papel/status de membro viram `Selo`.
- [x] `onboarding`: `OnboardingChecklist` em `Superficie` + `SecaoCabecalho`
      + barra de progresso; `OnboardingWizard`/`BotaoAjudaFlutuante` herdam o
      escuro pelo `Dialog`.
- [x] Testes revisados (verdes).

## Fase 5 — Backoffice

- [x] `BackofficeLayout` entra no escopo `data-painel="dark"`: casca + todas
      as páginas (`Resumo`, `Compradores`, `Avisos`, detalhe) herdam navy/mint
      via remap de tokens. `LinhaLista`/`GradeDados`/`CampoEstat` dedicados
      ficam como polimento.
- [x] Testes revisados (verdes).

## Fase 6 — Auth + limpeza

- [x] `login`, `cadastro`, `verificar-email`, `esqueci-senha`,
      `aceitar-convite`: escopo `data-painel="dark"`; `Card` do formulário →
      `Superficie` no login e cadastro.
- [x] `Dialog` compartilhado porta em `data-painel="dark"` → todos os 17
      modais do app ficam escuros de uma vez.
- [x] Auditado `src/shared/components/ui/*` — nenhum componente ficou órfão
      (todos com ≥ 1 uso). `Card` ainda é usado (auth, backoffice,
      LinkColaboradorCard) e renderiza escuro pelo remap; migrar pra
      `Superficie` é polimento opcional, não bloqueia.
- [x] Passe de reduced-motion/foco/contraste: `animate-ping`/`animate-pulse`
      na lista de reduced-motion; anel de foco em `ChipsFiltro` e `LinhaLista`;
      texto secundário de conteúdo sobe de `--pnl-txt-3` (45%) p/ `--pnl-txt-2`
      (70%) — subtítulos, estados vazios, rótulos clicáveis, código de barras.
- [ ] Atualizar `README`/`openspec/specs` afetadas; arquivar a change.
