## Why

O refresh visual (baseado em `docs/figma-make/north-star.md`) fez a fundação de UI e
a **lista de cotações** (PR #5). As outras telas ainda estão no visual antigo — o
sistema fica pela metade. Esta change leva o resto das telas pro mesmo sistema
(tokens oklch, `Card`/`Skeleton`/`Button` da fundação, ritmo de espaçamento,
badges, estados de vazio/erro/carregando).

É **re-estilização de telas que já existem e estão testadas** — não construção. Todo
o comportamento (rotas, hooks de API, autosave/fila do representante, polling da
grade, transições de estado, i18n pt-BR) fica intacto.

## What Changes

Ajuste de markup/classes Tailwind nas telas abaixo, arquivo por arquivo, mantendo
props, handlers e testes:

- **Admin:** `AdminLayout` (sidebar), `LoginPage`, `CotacaoDetalhePage` + `ItensSection`
  + `ParticipantesSection` + `RespostasSection`, `GradeAoVivoPage` + `GradeAoVivoTabela`
  + `UltimaCompraPopover`, `ResultadoPage`, `NovaCotacaoPage`, `ProdutosPage` +
  `ProdutoForm`, `EmpresasPage` + `EmpresaForm`.
- **Representante:** `CotacaoPorTokenPage` + `ItemLanceCard`, `PedidoPorTokenPage`.
- Extensão dos primitivos da fundação (`Button`/`Card`/`Skeleton`/`StatusBadge`)
  quando uma tela precisar de uma variante nova — sempre estendendo, nunca forkando.

Fora de escopo (viram changes próprias): analytics/Recharts, import de catálogo,
scanner GTIN, "duplicar cotação", e o walkthrough da demo (ação local, não é
mudança de repo). Sem redesenho do dark mode do admin — os tokens `.dark` atuais
ficam.

## Capabilities

### New Capabilities
_Nenhuma._ Re-estilização — nenhum comportamento observável em spec muda.
`.openspec.yaml` declara `skip_specs: true`. As specs de `admin/cotacoes` e
`representante/cotacao` já descrevem o comportamento e não são tocadas.

### Modified Capabilities
_Nenhuma._

## Impact

- **Arquivos:** só `src/**` (markup/classes) + possivelmente `src/index.css` se um
  token precisar de ajuste fino. Nenhuma dependência nova — o popover continua em
  `@base-ui/react` / no `UltimaCompraPopover` atual (**não** entra `@radix-ui/*`).
- **Testes:** cada tela mantém seus testes verdes; ajuste só de asserção quando um
  seletor de layout mudar (ex.: `<select>` → pills, como no PR #5).
- **Risco:** regressão visual/comportamental numa tela. Mitigação: um PR por tela
  (ou grupo pequeno), `tsc -b` + `vitest` + `oxlint` verdes em cada, diff revisável.
