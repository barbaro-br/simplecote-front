## Context

Ver `proposal.md` para a motivação. As 9 páginas admin drift do padrão de centralização de forma independente — todas nasceram como `<div className="... max-w-Nxl">` copiado de tela em tela, sem um único ponto de verdade. Isso já causou o bug 9 vezes em poucas semanas de projeto.

## Goals / Non-Goals

**Goals:**
- Corrigir a centralização nas 9 páginas hoje.
- Impedir que a página #10 repita o mesmo bug.

**Non-Goals:**
- Não muda a largura máxima que cada página já usa hoje (`5xl`/`4xl`/`lg`) — só corrige o centering.
- Não introduz nenhum sistema de layout novo além do já existente em `AdminLayout.tsx`.

## Decisions

- **Criar `PageContainer` em vez de só adicionar `mx-auto` em cada `<div>`.** Alternativa considerada: editar as 9 linhas adicionando `mx-auto`. Rejeitada como única medida porque não resolve a causa raiz — a próxima página nova pode reintroduzir o mesmo bug copiando um padrão antigo. Um componente compartilhado torna o `mx-auto` estrutural, não uma convenção que depende de lembrança.
- **`PageContainer` aceita uma prop `maxWidth`** (`'lg' | '4xl' | '5xl'`, mapeando para as classes Tailwind já em uso) em vez de um valor fixo — preserva a largura que cada página já escolheu, só corrige o centering; não é objetivo desta change uniformizar a largura entre páginas.
- **`PageContainer` só é dono de `mx-auto w-full max-w-{N}`, não do `space-y-*`.** O espaçamento vertical entre seções varia por página (`space-y-5`, `space-y-6`, `space-y-8`) e é conteúdo daquela página, não parte do problema de centering. `PageContainer` aceita `className` e repassa para a `<div>` interna, então cada página continua passando seu próprio `space-y-N` como hoje.

## Risks / Trade-offs

- [Risco] Trocar o `<div>` raiz por `<PageContainer>` pode alterar algum seletor de teste que dependa da estrutura DOM exata → Mitigação: `PageContainer` renderiza um único `<div>` (mesma tag, mesmas classes finais via `className` repassado), preservando a estrutura; rodar a suíte de testes de cada página afetada após a migração.
