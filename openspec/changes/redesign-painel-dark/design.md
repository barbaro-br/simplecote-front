# Design — Painel escuro SimpleCote

Linguagem visual extraída das telas do deck da landing
(`src/site/tech/telas/`). Este documento é a fonte da verdade do redesign.

## 1. Tokens (escopo `[data-painel="dark"]`)

Aplicado num wrapper alto do app autenticado (não no `<html>`, pra não
afetar o site). Reusa `--brand-*` do `index.css`.

| Token            | Valor                              | Uso                                    |
| ---------------- | ---------------------------------- | -------------------------------------- |
| `--pnl-bg`       | `linear-gradient(160deg,#12263f,#1e3a5f)` fixo | fundo da página              |
| `--pnl-superficie` | `#12263f` (`brand-navy-deep`)     | cards, rail, barras                    |
| `--pnl-superficie-2` | `rgba(255,255,255,.03)`         | rodapés de card, faixas                |
| `--pnl-borda`    | `rgba(255,255,255,.10)`            | divisórias fortes                      |
| `--pnl-borda-fraca` | `rgba(255,255,255,.07)`          | divisória entre linhas de lista        |
| `--pnl-ring`     | `rgba(255,255,255,.06)` inset      | contorno sutil dos cards               |
| `--pnl-txt`      | `#fff`                             | títulos, valores                       |
| `--pnl-txt-2`    | `rgba(255,255,255,.70)`            | **corpo de texto** (mínimo p/ leitura) |
| `--pnl-txt-3`    | `rgba(255,255,255,.45)`            | rótulos curtos, meta                   |
| `--pnl-txt-4`    | `rgba(255,255,255,.30)`            | EAN, "/un", timestamps                 |
| `--pnl-acento`   | `#57bf8e` (`brand-mint`)           | acento, sucesso, CTA, dot "ao vivo"    |
| `--pnl-acento-hi` | `#6fe6ac` (`brand-mint-bright`)   | números em destaque, economia          |
| `--pnl-atencao`  | `--warning` (`oklch(.75 .15 70)`)  | status "visualizou", avisos            |
| `--pnl-perigo`   | `--destructive`                    | erro, exclusão                         |

Raios: `rounded-2xl` superfícies · `rounded-lg` elementos internos · `rounded-full` chips/dots.
Números: **sempre** `tabular-nums`. Códigos: `font-mono`. Headings: `tracking-tight`.
Contraste: nada de texto de corpo abaixo de `--pnl-txt-2`. `--pnl-txt-3/4` só para
rótulos ≤ 2 palavras e metadados não essenciais.

## 2. Primitivos (`src/shared/ui/`)

Nomes em pt-BR, como o resto do repo.

### `Superficie` — o card base
`<Superficie>` = `bg-[--pnl-superficie] border border-[--pnl-borda] ring-1 ring-inset ring-[--pnl-ring] rounded-2xl overflow-hidden shadow-[0_24px_60px_-24px_rgba(0,0,0,.6)]`.
Props: `className`.

### `SecaoCabecalho` — topo do card
Linha `px-4/5 py-2.5 border-b border-[--pnl-borda]`. Esquerda: `titulo`
(13px, `--pnl-txt`) com dot opcional (`pulso` → `animate-ping` verde).
Direita: `acao` (ReactNode livre — selo de status, contador, botão-ícone).

### `SubFaixa` — faixa de contexto
`px-4/5 py-2.5 border-b border-[--pnl-borda] text-[11px]`. `esquerda` (`--pnl-txt-3`)
e `direita` (`--pnl-txt-2`). Ex.: "Convites da cotação" · "3 de 5 responderam".

### `LinhaLista` — item de lista
`px-4/5 py-3`, dentro de `<ul className="divide-y divide-[--pnl-borda-fraca]">`.
Slots: `avatar` (tile 32px `rounded-lg bg-white/[.06]` com iniciais, ou ícone),
`titulo` (13px semibold `--pnl-txt`), `meta` (11px `--pnl-txt-3`), `fim`
(ReactNode à direita — selo, valor, contato, ações). `onClick` opcional
(vira `<button>`/`<a>` com hover `bg-white/[.03]`).

### `Selo` — status chip
`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset`.
`tom`: `sucesso` (mint) · `atencao` (warning) · `neutro` (white/60) · `info` · `perigo`.
`icone` opcional (phosphor, `weight="fill"`, `size-3`).

### `GradeDados` — tabela de valores
`<table className="w-full border-collapse text-left">`. Cabeçalho: `text-[10px]
uppercase tracking-wide text-[--pnl-txt-3]`. Corpo: linhas `border-t
border-[--pnl-borda-fraca]`. Coluna 0 = rótulo do item (titulo + sub + código
mono). Colunas de valor: right, `tabular-nums`, cada célula um
`<CelulaValor>`:
- normal: `text-[--pnl-txt-2]`
- **destaque** (`vencedor` / `selecionado`): `bg-[--pnl-acento]/15
  text-[--pnl-acento-hi] font-semibold ring-1 ring-[--pnl-acento]/40` + `<CaretDown>`
- `acabouDeMudar` → classe `flash-green` (keyframe já em `index.css`)
- linha secundária opcional sob o valor (`text-[10px] text-[--pnl-txt-4]`, ex. "R$ 6,67/un")
Suporta 1 coluna editável (input inline `tabular-nums`, sem spinner) — usada
pelo representante.

### `CampoEstat` — número grande
`rótulo` (11px `--pnl-txt-3`) + `valor` (`text-lg/xl font-bold tabular-nums
text-[--pnl-acento-hi]`). Variante inline (footer de card) e bloco (dashboard).

### `RodapeAcao` — rodapé de card
`border-t border-[--pnl-borda] bg-[--pnl-superficie-2] px-4/5 py-3 flex items-center justify-between`.
Esquerda: `CampoEstat` inline ou texto. Direita: `BotaoPrimario` (`bg-[--pnl-acento]
text-[--pnl-superficie] rounded-lg px-3 py-1.5 text-xs font-semibold`).

### `ChipsFiltro`
Linha de pills. Ativo: `bg-[--pnl-acento]/15 text-[--pnl-acento-hi] ring-1
ring-inset ring-[--pnl-acento]/30`. Inativo: `bg-white/[.06] text-[--pnl-txt-3]`.
Controlado (`valor`, `aoTrocar`).

### `BotaoPrimario` / `BotaoFantasma` / `BotaoIcone`
Versões escuras do `button-classes` atual. Primário = mint sólido sobre navy.
Fantasma = `border-[--pnl-borda] bg-white/5 text-[--pnl-txt] hover:bg-white/10`.

### `CampoTexto` / `Busca` — inputs
`bg-white/[.04] border border-[--pnl-borda] rounded-md text-[--pnl-txt]
placeholder:text-[--pnl-txt-4] focus:ring-1 focus:ring-[--pnl-acento]/50`.

### `Modal` — reusa o `Dialog` atual
Só re-tematiza o painel interno com `Superficie`. Foco/trap/scroll-lock já
resolvidos.

## 3. Casca do app (`CascaPainel`)

- **Fundo**: `--pnl-bg` fixo atrás de tudo (como `HeroFundo` faz na home).
- **Desktop (≥lg)**: rail vertical `w-16 hover:w-56` (ou fixo 56) à esquerda,
  `bg-[--pnl-superficie]/95 border-r border-[--pnl-borda]`, itens = ícone +
  rótulo, ativo com barra mint à esquerda + `text-[--pnl-txt]`.
- **Mobile**: barra inferior (reusa a ideia do `BottomNavBar` atual) no mesmo
  tom, 4–5 itens.
- **Cabeçalho de página**: `<CabecalhoPagina titulo acao />` — título 20px
  bold + breadcrumb 12px `--pnl-txt-3` + slot de ação primária à direita.
- **Conteúdo**: `max-w-5xl mx-auto px-4 py-6 space-y-4`, pilha de `Superficie`.
- Sem `CursorMais`, sem Lenis, sem shader. `prefers-reduced-motion` desliga o
  `flash-green`, o `animate-ping` e transições > 150ms.

## 4. Simplificações de fluxo

### 4.1 Cotação — uma superfície, todos os estados

Hoje: `CotacoesPage` (lista) → `NovaCotacaoWizard` (passos) →
`CotacaoDetalhePage` com `AdicionarItemModal`, `RepresentantesModal`,
`AbrirCotacaoDialog`, `GradeAoVivoContainer`, `ItensSection`, `ResultadoPage`.

Proposta: **`CotacaoPage` única**, uma `Superficie` "Cotação #123" que é a mesma
em RASCUNHO / ABERTA / ENCERRADA / PEDIDOS_GERADOS:

```
┌ Superficie ──────────────────────────────────────────────┐
│ SecaoCabecalho: "Compra semanal"        [Selo: RASCUNHO]  │
│ SubFaixa: "5 itens · 3 fornecedores"   prazo · criada em  │
│ ── Fornecedores (chip-input inline; em RASCUNHO/ABERTA) ──│
│  [Aurora ×] [Meridiano ×] [+ convidar…]                   │
│ ── GradeDados ───────────────────────────────────────────│
│  Item            Aurora   Meridiano   Litoral            │
│  Arroz tipo 1    …        …           …                  │
│  [+ adicionar item ▸ busca inline]   (só RASCUNHO/ABERTA) │
│ ── RodapeAcao ───────────────────────────────────────────│
│  CampoEstat "economia projetada"   [ Abrir cotação ]      │
└──────────────────────────────────────────────────────────┘
```

- **Sem wizard**: cria a cotação (só o nome) e cai direto nessa tela em
  RASCUNHO. Tudo o mais é inline.
- **Sem modais de montagem**: adicionar item = campo de busca que aparece na
  última linha da grade e faz `POST /itens` no clique (já é assim no
  `AdicionarItemModal` de hoje — só tira o modal). Convidar = chip-input que
  faz `POST /participantes`.
- **Botão primário único**, rótulo por estado:
  RASCUNHO → "Abrir cotação" (abre o dialog de prazo, que continua) ·
  ABERTA → "Encerrar" · ENCERRADA → "Apurar" · PEDIDOS_GERADOS → "Ver pedidos".
- **Grade ao vivo** = a mesma `GradeDados` com polling (o de `useGradeAoVivo`)
  quando ABERTA; em RASCUNHO mostra as células vazias/editáveis.
- **Resultado** deixa de ser página: em ENCERRADA/PEDIDOS_GERADOS a `GradeDados`
  entra em modo "resultado" (mostra vencedor + economia por item) e o
  `RodapeAcao` vira `CampoEstat "economia total"` + "Gerar pedidos".
- **Lista de cotações** (`CotacoesPage`): `Superficie` com `LinhaLista` por
  cotação (título + `Selo` de estado + nº de respostas + prazo). Botão
  "+ Nova cotação" no `CabecalhoPagina`.

Endpoints: idênticos aos de hoje. Só some marcação/rota (`/resultado`,
`/nova` viram estado da mesma tela; manter redirect das rotas antigas).

### 4.2 Representante (`/representante/:token`)

Uma `Superficie` "Cotação de {loja}" → `GradeDados` com a **coluna de preço
editável** (uma célula por item) + `RodapeAcao` fixo "Enviar respostas"
(sticky no mobile). "Não cotado" = toggle na célula. Correção depois de enviar
= reabrir pelo admin (já existe). Fim dos cards por item (`ItemLanceCard`) —
vira linha de grade; o offline/fila de sync (`useFilaDeSincronizacao`)
continua igual, só muda a casca.

### 4.3 Colaborador (`/colaborador/:token`)

`Superficie` "Adicionar itens" → `Busca` + `LinhaLista` de produtos com
`[+ adicionar]` / `✓ na lista`. Igual ao modal novo de itens, sem modal.

### 4.4 Catálogo (produtos / empresas / representantes / usuários)

Cada um: `CabecalhoPagina` + `Superficie` com `ChipsFiltro` (quando faz
sentido: ramo, ativo/inativo, papel) + `LinhaLista`. Form de
criar/editar = `Modal` re-tematizado (mantém validação `zod` + RHF).

### 4.5 Dashboard / análise

`CampoEstat` em bloco (grade de KPIs) + `Superficie` de "últimas cotações" +
`GradeDados` de "insight de produtos" (última compra, variação).

## 5. Estratégia de migração

- **Fase 0** — `src/shared/ui/` (tokens + primitivos + testes). App intacto.
- **Fase 1** — `CascaPainel` + telas por token (representante, colaborador).
  Alto impacto visual, escopo isolado, sem back.
- **Fase 2** — `CotacaoPage` unificada (lista + detalhe + resultado) com a
  simplificação de fluxo. Redireciona rotas antigas.
- **Fase 3** — catálogo (produtos, empresas, representantes, usuários).
- **Fase 4** — conta (organização, configurações, análise, onboarding, ajuda).
- **Fase 5** — backoffice.
- **Fase 6** — auth (login, cadastro, recuperar-senha) já quase escuras; só
  alinhar aos primitivos. Remover `src/shared/components/ui/*` órfãos.

Cada fase: merge em `main` só com o app navegável e `npm test` verde. Sem
feature-flag — a fase troca a tela de vez. `RISCOS-TRANSVERSAIS.md` §G
(contrato do back) intocado.

## 6. Acessibilidade

- Contraste AA: título/valor (`#fff` sobre `#12263f` ≈ 15:1 ✓); corpo
  `--pnl-txt-2` (.70 ≈ 9:1 ✓); `--pnl-txt-3` (.45 ≈ 4.6:1 — ok só p/ rótulo
  ≥ 12px); `--pnl-txt-4` **decorativo**, nunca info essencial só nele.
- Selo: cor + **ícone + texto** (nunca só cor).
- `prefers-reduced-motion`: sem `flash-green`, sem `ping`, sem polling-highlight.
- Foco visível em tudo (`focus-visible:ring-1 ring-[--pnl-acento]`).
- `GradeDados` editável: `<input>` real com `<label>` sr-only por célula.
