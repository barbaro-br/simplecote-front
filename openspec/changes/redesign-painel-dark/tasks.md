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
- [ ] Adicionar item inline na última linha da `GradeDados` (`POST /itens`).
- [ ] Chip-input de fornecedores (`POST/DELETE /participantes`).
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

- [ ] `produtos`: `ChipsFiltro` (ativo/inativo) + `LinhaLista` + `Modal` de form.
- [ ] `empresas`: `ChipsFiltro` (ramo) + `LinhaLista` + contato.
- [ ] `representantes`: `LinhaLista` + `Selo` de vínculo.
- [ ] `usuarios`: `LinhaLista` + `Selo` de papel + convite.
- [ ] Testes revisados.

## Fase 4 — Conta

- [ ] `analise` / dashboard: grade de `CampoEstat` + `Superficie` de cotações
      recentes + `GradeDados` de insight de produtos.
- [ ] `organizacao`, `configuracoes`, `onboarding`, `ajuda`: `Superficie` +
      `LinhaLista` / formulários re-tematizados.
- [ ] Testes revisados.

## Fase 5 — Backoffice

- [ ] `backoffice/*`: `CascaPainel` variante super-admin, `LinhaLista` de
      compradores, `GradeDados` de métricas, `CampoEstat` de resumo.
- [ ] Testes revisados.

## Fase 6 — Auth + limpeza

- [ ] `login`, `cadastro`, `recuperar-senha`, `verificar-email`,
      `aceitar-convite`: alinhar aos primitivos (já são escuras).
- [ ] Remover `src/shared/components/ui/*` sem uso; `grep` por classes do tema
      claro órfãs.
- [ ] Passe final de contraste/reduced-motion/foco em todo o app.
- [ ] Atualizar `README`/`openspec/specs` afetadas; arquivar a change.
