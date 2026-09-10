# Tarefas — redesign-painel-dark

Fases entregues em sequência; cada uma fecha com o app navegável e `npm test`
verde antes de mergear em `main`.

## Fase 0 — Design system (`src/shared/ui/`)

- [ ] `tema-painel.css` (ou bloco em `index.css`): tokens `--pnl-*` no escopo
      `[data-painel="dark"]`, mapeados dos `--brand-*`.
- [ ] `Superficie`, `SecaoCabecalho`, `SubFaixa`, `RodapeAcao`.
- [ ] `LinhaLista` (+ `avatar` de iniciais, estado `onClick`).
- [ ] `Selo` (tons sucesso/atenção/neutro/info/perigo).
- [ ] `GradeDados` + `CelulaValor` (normal / destaque / editável / linha 2ª).
- [ ] `CampoEstat` (inline + bloco).
- [ ] `ChipsFiltro` (controlado).
- [ ] `BotaoPrimario` / `BotaoFantasma` / `BotaoIcone` / `CampoTexto` / `Busca`.
- [ ] Testes RTL de cada primitivo + teste de contraste/reduced-motion.
- [ ] `src/site/tech/telas/*` passa a importar de `src/shared/ui/` (dedupe).

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
- [ ] Rebuild da casca com rail/CabecalhoPagina próprios (polimento).
- [ ] Páginas do admin reescritas com primitivos, por área (Fases 2-6).

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
- [~] Chip-input de fornecedores (`POST/DELETE /participantes`). Parcial: em
      RASCUNHO os fornecedores escolhidos no modal já aparecem como chips
      com × na própria tela (antes a seleção era invisível até reabrir o
      modal). O combobox de digitar-e-adicionar inline fica pra depois.
- [ ] Botão primário único por estado; `AbrirCotacaoDialog` (prazo) mantido.
- [ ] `GradeDados` modo "resultado" (vencedor + economia/item) + `RodapeAcao`
      "Gerar pedidos" em ENCERRADA/PEDIDOS_GERADOS.
- [~] `ResultadoPage` re-tematizada com `CabecalhoPagina` + `Superficie` +
      `SubFaixa` + `Selo` (era `Card`/`CardHeader`/`CardTitle`). Só aparência —
      margem, expandir pedidos, XLSX/PDF, enviar, recotar intactos. 20 testes
      verdes. Falta ainda dobrar tudo dentro da tela de detalhe (modo resultado).
- [ ] `CotacoesPage` = `Superficie` + `LinhaLista` + "+ Nova cotação".
- [ ] Redirects: `/cotacoes/nova`, `/cotacoes/:id/resultado` → estado da tela.
- [ ] Aposentar `NovaCotacaoWizard`, `NovaCotacaoPage`, `AdicionarItemModal`,
      `RepresentantesModal`, `ItensSection`, `ResultadoPage`, `GradeAoVivoTabela`.
- [ ] Migrar/mesclar os testes desses arquivos pra `CotacaoPage.test`.

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
- [ ] Remover `src/shared/components/ui/*` sem uso; `grep` por classes do tema
      claro órfãs.
- [ ] Passe final de contraste/reduced-motion/foco em todo o app.
- [ ] Atualizar `README`/`openspec/specs` afetadas; arquivar a change.
