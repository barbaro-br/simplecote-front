## Context

O componente `RepresentantesModal.tsx` tem o comportamento esperado, mas a marcação DOM atual (`divs` e `flex-directions`) não agrupa os itens da mesma maneira que a visão espacial do wireframe exige, gerando sobreposições ou alinhamentos confusos.

## Goals / Non-Goals

**Goals:**
- Reproduzir com exatidão a disposição dos blocos do wireframe: Checkbox (esquerda) | Dados e Status (centro-esquerda) | Ações verticais (direita).

**Non-Goals:**
- Alterar cores do design system ou criar novos ícones.
- Modificar o fluxo de chamadas das Mutations do React Query.

## Decisions

**1. Estrutura Flexbox do Card Principal (`<li>`)**
O contêiner principal de cada representante será um `flex row` com `justify-between` e `items-center` ou `items-start`.
- Bloco Esquerdo: Checkbox.
- Bloco Central (`flex-1`): Agrupa o título da empresa, nome do representante, e uma sub-linha `flex row` para Status + Botão Fechar.
- Bloco Direito: `flex-col` para empilhar os 3 botões (E, W, C) verticalmente, justificados à direita.

## Risks / Trade-offs

- **Risk**: Os botões de ações verticais (E, W, C) podem aumentar muito a altura do card se não tiverem o padding correto.
- **Mitigation**: Usar botões/ícones pequenos (`size-3` ou `size-4`) e `gap-1` na pilha vertical para manter o *bounding box* do representante enxuto.
