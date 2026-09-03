## Context

`ItemLanceCard.tsx` (linha 50-73): um único `useEffect` reage a `valorDebounced` — quando fica `''` e antes havia um valor enviado (`jaEnviadoRef.current !== ''`), chama `aoAssentar({ naoCotado: true })`. Esse efeito dispara igual seja o campo esvaziado pelo teclado (`onChange`, linha 215) ou pelo gesto de deslizar (`onTouchEnd`, linha 112-119, que só faz `setPrecoTexto('')` — o resto do fluxo é o mesmo). É o ponto certo e único pra plugar o desfazer, sem duplicar lógica entre os dois gatilhos.

`TutorialOnboarding.tsx` já tem um `MiniCard` de demonstração (linha 14-33) e três passos (`PASSOS`, linha 4-11); o último já menciona o gesto só em texto (`desc`).

O projeto já tem `sonner` montado na raiz (`App.tsx`, `<Toaster richColors position="bottom-right" />`) — `toast()` já funciona em qualquer tela, inclusive `/cotacao/:token`, sem nenhuma configuração adicional.

## Goals / Non-Goals

**Goals:**
- Tornar o gesto de deslizar descobrível sem adicionar nenhum controle novo, permanente, no card (que violaria a regra já deliberada de "sem toggle explícito de não-cotado").
- Dar uma rede de segurança (desfazer) pra limpar um preço já digitado, seja por deslizar ou por teclado.

**Non-Goals:**
- Não adiciona nenhum botão/ícone clicável permanente no card em repouso — o achado de que "swipe é 100% dependente de touch" era impreciso (o teclado já funciona); não há gap funcional de acesso a resolver, só de descoberta (gesto) e de segurança (desfazer).
- Não muda o comportamento de sincronização em si (`aoAssentar`, debounce) — só adiciona a possibilidade de reverter antes que o usuário se esqueça do valor anterior.

## Decisions

- **Afford­ance do gesto vive só no tutorial (demonstração animada), não no card em repouso.** Alternativa considerada: um indício visual permanente em todo card (ex.: uma fatia do ícone "limpar" sempre visível na borda). Rejeitada — numa lista com 70+ itens, um indício repetido em cada linha vira ruído visual constante pra um gesto usado raramente; a demonstração no tutorial (uma vez, no início) já resolve a descoberta sem poluir a lista inteira.
- **Toast "Desfazer" plugado no único ponto do código que já centraliza os dois gatilhos** (o efeito de `valorDebounced === ''`) — captura o valor anterior (`jaEnviadoRef.current` antes de zerar) antes de chamar `aoAssentar`, e o toast oferece restaurá-lo chamando `setPrecoTexto(valorAnterior)`.
- **`position` do toast sobrescrita pra essa chamada específica** (ex. `top-center`), não a configuração global do `<Toaster>` — a tela do representante já tem uma barra de ação fixa na base da viewport (`sticky bottom`); um toast no canto inferior direito colidiria com ela.

## Risks / Trade-offs

- [Risco] Nenhum identificado — mudança aditiva (toast + animação de demonstração), sem alterar nenhum contrato com o backend nem o comportamento de sincronização já existente.
