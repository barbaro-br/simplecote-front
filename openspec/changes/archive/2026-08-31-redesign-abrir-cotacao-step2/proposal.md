# Ajuste de UX: Modal de Data Personalizada

## Problem
Quando o usuário clica na opção "Data Personalizada", o calendário se expande para baixo dentro do próprio modal. Isso faz com que o modal mude de tamanho bruscamente, gerando uma barra de rolagem (scrollbar) indesejada e prejudicando a estética fluida da interface.

## Proposed Solution
Em vez de expandir o calendário para baixo empurrando os outros botões, adotaremos um modelo de **"Multi-step" (ou visualização alternada)**.
Ao clicar em "Data Personalizada", o conteúdo atual do modal (as 4 pílulas) desliza ou é substituído pela visualização apenas do Calendário e Horário.
O usuário seleciona a data, clica em "Confirmar Data" e volta para a tela inicial das pílulas, que agora exibirá a data que ele escolheu no botão "Personalizado". Isso mantém o modal sempre num tamanho contido, sem barras de rolagem e sem layout quebrado.

## Capabilities
- **cotacoes/abrir-cotacao-modal**: Suportar visualização multi-etapa (seleção de data personalizada isolada).
