## 1. Atualizar os tokens

- [x] 1.1 Em `src/index.css`, bloco `:root`: trocar `--background: oklch(0.98 0.004 90)` por `--background: oklch(0.965 0.008 165)`, `--card: oklch(0.98 0.004 90)` por `--card: oklch(0.995 0.004 165)`, `--border: oklch(0.922 0 0)` por `--border: oklch(0.90 0.01 165)`, e `--input: oklch(0.922 0 0)` por `--input: oklch(0.90 0.01 165)`.
- [x] 1.2 Em `src/index.css`, bloco `.tema-claro`: aplicar exatamente os mesmos quatro valores (mantendo paridade com `:root`, como já documentado no comentário do bloco).
- [x] 1.3 Confirmar que o bloco `.dark` permanece intocado.

## 2. Verificação visual

- [ ] 2.1 Testar com dados reais (dev): navegar pelo painel admin (Dashboard, Cotações, Produtos, etc.) no tema claro e confirmar que o novo fundo aparece de forma consistente, sem nenhuma cor fixa destoando.
- [ ] 2.2 Testar a tela pública do representante (`/cotacao/:token`) e confirmar que usa o mesmo fundo do painel admin.
- [ ] 2.3 Conferir contraste de texto sobre o novo fundo (`--foreground` sobre `--background`, `--card-foreground` sobre `--card`) em pelo menos 2-3 telas com bastante texto.
- [ ] 2.4 Confirmar visualmente que o tema escuro (`.dark`) não mudou.
