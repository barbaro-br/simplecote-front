## Why

`BottomNavBar.tsx` (de `menu-configuravel-lateral-ou-inferior`) sempre mostra só 3 itens fixos + "Mais", independentemente da largura da tela — regra pensada para celular, onde o espaço é curto. Só que a barra inferior é uma **escolha manual** do lojista, não algo restrito a celular: num desktop largo (confirmado visualmente pelo usuário), sobra espaço de sobra pra mostrar os 7 itens direto, sem precisar esconder a maioria atrás de "Mais".

## What Changes

- `BottomNavBar.tsx` passa a decidir quantos itens mostrar direto com base na largura da tela: abaixo de 768px mantém o comportamento atual (3 fixos + "Mais"); a partir de 768px mostra os 7 itens direto, sem o botão "Mais".
- Reaproveita o mesmo padrão de detecção de largura já usado em `AdminLayout.tsx` (`window.matchMedia`), para consistência.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `admin/layout`: o requirement "Estilo de navegação configurável" (de `menu-configuravel-lateral-ou-inferior`) ganha uma precisão — a barra inferior aproveita o espaço disponível, mostrando mais itens direto em telas largas, em vez de aplicar sempre o limite pensado para celular.

## Impact

- `src/admin/layout/BottomNavBar.tsx` — lógica de quantos itens mostrar direto.
- Achado durante a verificação visual da change anterior; escopo pequeno e contido no mesmo arquivo.
