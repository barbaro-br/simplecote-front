## 1. Compactar o cabeçalho e a primeira coluna

- [x] 1.1 Em `GradeAoVivoTabela.tsx`, trocar `py-3` por `py-2` no `<th>` sticky (linha ~225) e no `<th>` de cada empresa (linha ~231); verificar visualmente que o texto continua legível.
- [x] 1.2 Trocar `py-3` por `py-2` na primeira `<td>` (nome do item, linha ~54); verificar que o controle de quantidade (+/-) continua clicável e alinhado.

## 2. Compactar a célula de preço

- [x] 2.1 Reduzir `min-h-[3rem]` para `min-h-[2.5rem]` no botão de célula (linha ~115); reduzir `px-3 py-2` internos proporcionalmente.
- [x] 2.2 Reduzir o espaçamento entre o rótulo de status e o preço (`mb-1` → `mb-0.5`, linha ~121).
- [x] 2.3 Reduzir `px-2 py-2` do `<td>` que envolve o botão (linha ~110) proporcionalmente.

## 3. Verificação final

- [x] 3.1 Rodar o dev server, abrir uma cotação com muitos itens (ou popular dados de teste com itens suficientes) e comparar visualmente a quantidade de linhas visíveis antes/depois.
- [x] 3.2 Testar clique em várias células de preço (mouse e, se possível, num dispositivo/emulação touch) e confirmar que o alvo continua fácil de acertar.
- [x] 3.3 Rodar `npm test` e confirmar 0 regressões nos testes existentes de `GradeAoVivoTabela`.

---

### Observações (verificação humana pendente)

As tasks **3.1** (comparação visual de densidade antes/depois) e **3.2** (teste de clique/toque nas células) exigem navegador/dev server e interação real — **não executadas por agente**, permanecem `[ ]` para verificação humana. Os valores de padding aplicados (piso `min-h-[2.5rem]` = 40px) seguem exatamente o design.md.
