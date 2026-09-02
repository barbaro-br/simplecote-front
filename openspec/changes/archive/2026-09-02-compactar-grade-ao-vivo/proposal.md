## Why

Na grade ao vivo (`GradeAoVivoTabela.tsx`), cada linha tem bastante espaço em branco: o cabeçalho/primeira coluna usam `px-4 py-3`, e cada célula de preço é um botão com `min-h-[3rem]` (48px) mais `px-3 py-2` internos. Numa cotação com muitos itens, isso empurra a maior parte da lista para fora da tela, obrigando a rolar bastante para comparar preços entre fornecedores — o cenário mais comum de uso dessa tela (acompanhar lances ao vivo item a item).

## What Changes

- Reduzir o padding vertical do cabeçalho e da primeira coluna (`py-3` → `py-2`).
- Reduzir a altura mínima e o padding interno do botão de cada célula de preço (`min-h-[3rem]` → um valor menor, preservando um alvo de toque/clique ainda confortável).
- Apertar o espaçamento interno entre o rótulo de status e o preço dentro de cada célula.
- **Não** reduzir abaixo de um alvo de toque utilizável — mantém acessibilidade de clique em telas touch (tablet é um dispositivo plausível para essa tela, usada durante a cotação ao vivo).

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/cotacoes-live-stream`: novo requirement formalizando que a grade renderiza linhas de forma compacta para maximizar itens visíveis sem rolar, com um piso mínimo de alvo de toque/clique.

## Impact

- `src/admin/cotacoes/GradeAoVivoTabela.tsx` — apenas classes Tailwind (padding, min-height, espaçamento interno); nenhuma mudança de dado ou lógica.
- Recomendo aplicar **depois** de `fixar-sidebar-e-scroll-admin` (mesma tela, evita conflito de edição simultânea nos mesmos arquivos e permite validar o resultado final — scroll fixo + linhas compactas — de uma vez).
