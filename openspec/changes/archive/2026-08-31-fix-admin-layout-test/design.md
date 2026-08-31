## Context

O componente `AdminLayout` possui um evento de hover (`onMouseEnter`/`onMouseLeave`) na tag `<aside>`. A biblioteca de testes `@testing-library/user-event` simula um ponteiro de mouse real ao invocar `userEvent.click`, o que aciona o `onMouseEnter` no container pai do botão.

## Goals / Non-Goals

**Goals:**
- Ajustar o teste para que o mouse não fique sob o elemento, reativando a classe `opacity-0` e permitindo a passagem do teste.

**Non-Goals:**
- Nenhuma alteração no código fonte do projeto (`src/admin/layout/AdminLayout.tsx` permanecerá inalterado).

## Decisions

Foi decidido utilizar a função `user.unhover(element)` (onde `element` é a sidebar ou o próprio botão) ou simplesmente o `user.hover(document.body)` para remover o hover do menu lateral após clicar no botão, mantendo o uso da biblioteca `@testing-library/user-event` (mais fiel a um clique real do que `fireEvent`).

## Risks / Trade-offs

Não há riscos associados à modificação do teste, pois o comportamento real em produção está intacto e correto.
