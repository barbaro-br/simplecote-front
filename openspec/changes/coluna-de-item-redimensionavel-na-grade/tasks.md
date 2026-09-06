## 1. Largura controlada

- [ ] 1.1 `GradeAoVivoTabela.tsx`: `table-layout: fixed`; largura da coluna do item por CSS var `--w-item` (ou `width` no `<col>`/`<th>`), default 240px
- [ ] 1.2 Estado `larguraItem` iniciado de `localStorage['grade-largura-coluna-item']` dentro de try/catch (fallback = default)
- [ ] 1.3 Container da grade mantém `overflow-x: auto`

## 2. Alça de redimensionamento

- [ ] 2.1 `<span>` na borda direita do `<th>` do item, `cursor: col-resize`, `aria-hidden`
- [ ] 2.2 `onPointerDown` (setPointerCapture) → `onPointerMove` acumula `deltaX` e aplica `clamp(140, largura, 520)` → `onPointerUp` grava no `localStorage`
- [ ] 2.3 `onDoubleClick` na alça reseta para o default e limpa a chave do `localStorage`

## 3. Testes

- [ ] 3.1 `GradeAoVivoTabela.test.tsx`: arrastar a alça (eventos de pointer) muda a largura aplicada no DOM
- [ ] 3.2 O valor é persistido no `localStorage` e um novo render parte dele
- [ ] 3.3 Duplo-clique volta ao default
- [ ] 3.4 `localStorage` indisponível (mock que lança) → usa o default sem quebrar
- [ ] 3.5 `npm test` + `npm run build` + `npm run lint` verdes
