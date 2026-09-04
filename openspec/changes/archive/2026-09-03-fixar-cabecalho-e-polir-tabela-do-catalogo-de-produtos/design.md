## Context

O projeto já resolveu exatamente este problema duas vezes, com dois
padrões diferentes que podem ser reaproveitados aqui:

1. Cabeçalho de página fixo: `CotacaoDetalhePage.tsx` tem
   `<div className="sticky top-0 bg-background z-10 pb-4 pt-4 border-b border-border mb-6 space-y-4">`
   envolvendo breadcrumb + título + botões — sticky simples relativo ao
   scroll do `<main overflow-y-auto>` do `AdminLayout`.
2. Tabela com cabeçalho de colunas fixo em lista longa:
   `GradeAoVivoTabela.tsx` tem seu **próprio** contêiner de rolagem
   vertical (altura limitada, `overflow-y` próprio, não depende do
   scroll da página) com o `<thead>` `sticky top-0` **dentro** desse
   contêiner.

Usar dois contextos de sticky independentes (cada um com seu próprio
`top: 0`) evita ter que calcular manualmente a altura do cabeçalho da
página para posicionar o `<thead>` — problema clássico de "sticky
empilhado" que quebra fácil se o cabeçalho mudar de altura
(responsivo, wrap de texto, etc.).

## Decision

**Cabeçalho da página**: envolver o bloco
`<div className="flex items-start justify-between">` (título + botão)
com o mesmo padrão de `CotacaoDetalhePage` — `sticky top-0 bg-background
z-10 border-b`, ajustando padding conforme o layout de `ProdutosPage`.

**Tabela**: dar ao `<div className="overflow-x-auto">` que envolve a
`<table>` também uma altura limitada com scroll vertical próprio (ex.:
`max-h-[calc(100vh-14rem)] overflow-y-auto`, o implementador ajusta o
valor exato testando visualmente para não cortar a tabela em telas
comuns) e tornar o `<thead className="bg-muted/50 border-b">` `sticky
top-0` **dentro** desse contêiner (com `bg-muted/50` opaco, já existente,
para não deixar linhas passarem por baixo do cabeçalho ao rolar).

**Coluna Qtd./Ações**: trocar o texto do `<th>` de "Qtd./embalagem" para
"Qtd." (mais curto, reduz a largura da coluna e aproxima visualmente o
número do próprio rótulo); adicionar `border-l` sutil (ou padding extra,
o que ficar melhor visualmente) na célula/cabeçalho de "Ações" para
separar do grupo de dados à esquerda.

**Ícones**: em `ProdutosPage.tsx`, trocar o import de `EyeOff`/`Eye`
(lucide-react) por `Archive`/`ArchiveRestore`, só nas duas chamadas de
`IconButton` desta tela. Em `icon-button.tsx`, adicionar
`tone?: 'default' | 'destructive'` (default `'default'`) ao tipo de
props; quando `tone === 'destructive'`, acrescentar classes de hover
mais quentes (ex.: `hover:bg-destructive/10 hover:text-destructive`) em
vez das classes neutras atuais — só quando o prop é passado
explicitamente, então todo uso existente do componente (que não passa
`tone`) continua idêntico. Passar `tone="destructive"` só no `IconButton`
de "Inativar" desta tela.

## Alternatives Considered

- **Calcular a altura do cabeçalho da página via `ref`/`useLayoutEffect`
  e usar esse valor como `top` do `<thead>`** (sticky empilhado numa
  única árvore de scroll): rejeitado — mais frágil (quebra se o
  cabeçalho mudar de altura) e mais código do que dar à tabela seu
  próprio contêiner de scroll, que é exatamente o padrão que o projeto já
  usa e testa para esse mesmo problema (grade ao vivo).
- **Restilizar `IconButton` globalmente (mudar a cor padrão de
  hover)**: rejeitado — afetaria todas as telas que usam o componente
  (`CotacoesPage`, `CotacaoDetalhePage`, `RepresentantesModal` via
  `MenuAcoes`) sem pedido nem verificação nessas outras telas; o prop
  opcional `tone` resolve só o caso pedido (Inativar em Produtos) sem
  ripple effect.
