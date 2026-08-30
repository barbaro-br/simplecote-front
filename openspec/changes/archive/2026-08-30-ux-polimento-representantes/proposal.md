## Why

O frontend atual funciona bem em termos de lógica de negócios, mas carece de refinamento visual e micro-interações que caracterizam produtos SaaS B2B modernos. Além disso, o fluxo de seleção de representantes e compartilhamento de links de cotação está truncado em modais difíceis de ler e usar. Esta mudança visa polir a experiência de ponta a ponta na tela de detalhes da Cotação e fornecer uma interface muito mais clara, animada e fluida para o Comprador gerenciar Representantes e enviar convites.

## What Changes

- Redesenho do Modal de Representantes para Rascunhos: focado unicamente na seleção de quem convidar, com tamanho fixo e sem abas confusas.
- Redesenho do Modal de Representantes para Cotações Abertas: focado na cópia rápida dos "Magic Links", com feedback visual imediato.
- Inclusão de sistema de Toasts (usando \`sonner\`) para feedback visual global de ações (ex: "Link copiado").
- Transformação do cabeçalho da página de Detalhes da Cotação em \`sticky\`, mantendo visibilidade das ações principais durante o scroll.
- Adição de micro-interações: botões com animações suaves de hover, escalas ao clicar, e modais com entrada e saída elegantes (\`backdrop-blur\`).
- **BREAKING (Visual)**: A aba "Participantes" na página principal deixará de existir, concentrando tudo no botão flutuante/modal de Representantes.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- \`admin/cotacoes\`: Modifica o fluxo de representantes e os requisitos de UI (tabelas, cabeçalho sticky e feedbacks) da Cotação.

## Impact

- \`src/admin/cotacoes/CotacaoDetalhePage.tsx\`: Alterações de layout e comportamento sticky.
- \`src/admin/cotacoes/RepresentantesModal.tsx\`: Redesenho para suportar os dois estados (Rascunho vs Aberta) e links rápidos.
- \`src/shared/components/ui\`: Ajustes e introdução de novos primitivos (como Toasts/Sonner se necessário) e refinamentos nos botões e dialogs.
- \`package.json\`: Possível adição de \`sonner\` para Toasts.
