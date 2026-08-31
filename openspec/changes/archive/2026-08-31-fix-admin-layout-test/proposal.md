## Why

O teste `3.2 — o botão sanduíche colapsa a sidebar e persiste em localStorage` no arquivo `AdminLayout.test.tsx` está falhando. Isso ocorre porque o componente `AdminLayout` foi modificado para suportar o estado `isHovered` na sidebar. Como o teste usa `userEvent.click`, a biblioteca dispara eventos de mouse (incluindo `onMouseEnter`), que ativam o estado `isHovered` da sidebar, impedindo que ela entre na classe de estilo colapsada (`opacity-0`) e levando a falha nas asserções.

## What Changes

- Modificar o teste `3.2` em `AdminLayout.test.tsx` para simular o movimento do mouse para fora do menu lateral (unhover) após o clique, ou usar o `fireEvent.click` para não disparar eventos extras de ponteiro que não são alvo do teste.
- Isso permitirá que o `isHovered` se torne falso, refletindo assim a classe `opacity-0` e permitindo que as asserções de opacidade passem com sucesso.

## Capabilities

Nenhuma capacidade de sistema ou requisito de usuário está sendo modificado. O comportamento atual do front-end na web é desejável (a sidebar abre automaticamente ao passar o mouse). Esta change visa exclusivamente alinhar o teste ao novo comportamento. (A change foi marcada com `skip_specs: true`).

## Impact

- `src/admin/layout/AdminLayout.test.tsx`
