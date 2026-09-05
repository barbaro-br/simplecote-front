## Why

Apesar da lógica de negócio já estar implementada no modal de representantes, a estrutura visual (box model) atual no código não reflete perfeitamente o wireframe desenhado pelo usuário. Os elementos estão desorganizados no eixo principal, quebrando a harmonia da interface. O objetivo desta mudança é realizar um *pixel-perfect* alignment da estrutura HTML/Tailwind baseando-se estritamente na planta baixa do wireframe fornecido.

## What Changes

- **Alinhamento e Estrutura Principal do Card**: 
  - O checkbox de participação será isolado no extremo lado esquerdo com alinhamento centralizado em relação ao card.
  - O bloco de informações centrais será empilhado verticalmente (`flex-col`):
    - 1ª Linha: Nome da empresa em fonte destacada e legível.
    - 2ª Linha: Nome do representante, com tipografia secundária.
    - 3ª Linha (Ações da Empresa): Na mesma linha ficarão, lado a lado, a *Badge de Status* e o botão *[ Fechar / Abrir ]*.
  - O bloco de "Ações Rápidas" será posicionado no extremo lado direito, com os botões (E-mail, WhatsApp, Copiar) **alinhados verticalmente** (empilhados) conforme a anotação explícita no wireframe.

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- Código afetado: Refatoração puramente visual/CSS do componente `src/admin/cotacoes/RepresentantesModal.tsx`.
- Não altera regras de negócio, chamadas de API ou lógicas de estado.
