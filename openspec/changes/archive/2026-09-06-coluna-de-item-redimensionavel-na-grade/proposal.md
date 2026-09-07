## Why

Na grade ao vivo (`GradeAoVivoTabela`), com muitos representantes (colunas), a coluna do **item** fica espremida e o nome do produto quebra em várias linhas, difícil de ler. O usuário quer poder **ajustar a largura da coluna do item arrastando**, como no Excel.

## What Changes

- A coluna do **item** (a primeira, com o nome do produto) ganha uma alça de redimensionamento na borda direita do cabeçalho. Arrastar ajusta a largura da coluna (com um mínimo e um máximo).
- A largura escolhida é **lembrada por navegador** (`localStorage`), por Comprador ou global — decidir; global é mais simples.
- Um duplo-clique na alça volta a coluna para a largura padrão.
- Sem biblioteca de tabela — implementação própria (mousedown na alça → `pointermove` acumula `deltaX` → seta a largura via style/CSS var → `pointerup` persiste).

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a grade ao vivo passa a permitir redimensionar a largura da coluna do item arrastando a borda do cabeçalho, com a largura lembrada localmente e um duplo-clique para restaurar o padrão.

## Impact

- `src/admin/cotacoes/GradeAoVivoTabela.tsx`:
  - `table-layout: fixed` na tabela (se ainda não for) para a largura da 1ª coluna ser respeitada.
  - Estado `larguraItem` inicial de `localStorage` (`grade-largura-coluna-item`), default (ex.: 240px). Aplicado como `width`/`min-width` do `<col>`/`<th>` do item, ou uma CSS var `--w-item`.
  - Alça: um `<span>` posicionado na borda direita do `<th>` do item, `cursor: col-resize`; handlers `onPointerDown` → captura → `onPointerMove` (clamp entre ~140 e ~520) → `onPointerUp` grava no `localStorage`. `onDoubleClick` reseta.
  - Respeitar `prefers-reduced-motion` não se aplica (sem animação); a11y: a alça não precisa ser focável, mas manter `aria-hidden` e não atrapalhar navegação por teclado.
  - Container da grade mantém `overflow-x: auto`.
- `GradeAoVivoTabela.test.tsx`: simular arrastar a alça muda a largura aplicada; `localStorage` guarda o valor e o próximo render usa; duplo-clique volta ao default; sem `localStorage` (try/catch) usa o default sem quebrar.
- Sem dependência nova, sem mudança no back.
