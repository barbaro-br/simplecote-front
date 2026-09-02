## Context

Ver `proposal.md`. Hoje `AdminLayout.tsx:59` monta `<div className="flex min-h-screen">` com `<aside>` (linha 61) e `<main className="flex-1 overflow-hidden">` (linha 144) como irmãos num flex row. `min-h-screen` só garante altura **mínima** — o container cresce livremente com o conteúdo, e quem rola é o documento/`body`. A `<aside>` não tem `position: sticky/fixed` nem altura própria, então rola junto.

`GradeAoVivoTabela.tsx` já usa `sticky top-0`/`sticky left-0` no header e primeira coluna (linhas 225, 231, 54) — isso funciona hoje porque o scroll acontece no documento, sem nenhum container `overflow` intermediário "roubando" o contexto de sticky.

## Goals / Non-Goals

**Goals:**
- Sidebar sempre visível durante scroll, em qualquer rota `/admin/**`.
- Um único ponto de mudança no shell (`AdminLayout.tsx`), sem exigir alteração em cada página individual.
- Não quebrar o sticky já existente na grade ao vivo.

**Non-Goals:**
- Não trata comportamento mobile/responsivo aqui — isso é escopo de `menu-configuravel-lateral-ou-inferior`.
- Não altera a densidade/altura das linhas da grade ao vivo — isso é escopo de `compactar-grade-ao-vivo`.

## Decisions

- **`<main>` vira o container de scroll (`h-screen overflow-y-auto`), a `<aside>` vira `sticky top-0 h-screen`.** Alternativa considerada: `position: fixed` na sidebar com `margin-left` no main. Rejeitada porque `sticky` dentro do mesmo container flex é mais simples (não precisa recalcular a largura do main a cada expand/colapso da sidebar) e já é o padrão usado pela própria grade ao vivo para o header/coluna — mantém o mesmo mecanismo CSS em uso no projeto.
- **A raiz do documento (`html`/`body`) deixa de ser o elemento que rola.** É uma mudança de comportamento perceptível (barra de rolagem passa a aparecer dentro do `<main>`, não na janela) — aceitável e é exatamente o objetivo.
- **Verificação obrigatória do sticky da grade ao vivo como parte desta change** (task 3), não só na change seguinte — porque mover o contexto de scroll é o que pode quebrá-lo; não faz sentido adiar essa verificação para depois.

## Risks / Trade-offs

- [Risco] Mover o scroll pra dentro de `<main>` muda o "nearest scrolling ancestor" do `sticky` da grade ao vivo — o header/coluna sticky pode parar de funcionar (ou funcionar diferente) → Mitigação: task dedicada de verificação manual + teste (task 3) logo após a restruturação, antes de considerar a change concluída.
- [Risco] Algum componente/modal existente pode assumir que o scroll é do documento (ex.: cálculo de posição de tooltip/dropdown relativo à janela) → Mitigação: rodar a suíte completa de testes após a mudança; fazer uma passada visual pelas rotas principais (dashboard, cotações, produtos, grade ao vivo) verificando dropdowns/modais.
- [Risco] `ScrollRestoration` (react-router, `AdminLayout.tsx:60`) assume hoje que o scroll é da janela — pode precisar de ajuste para restaurar o scroll do `<main>` em vez do documento → Mitigação: testar navegação entre rotas com o novo container e confirmar que a posição de scroll é restaurada corretamente (ou resetada de forma aceitável).
