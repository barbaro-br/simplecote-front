## 1. Unificar em um card

- [x] 1.1 Em `NovaCotacaoPage.tsx`: adicionar estado `modo: 'branco' | 'duplicar'` (default `'branco'`).
- [x] 1.2 Substituir os 2 `Card`s + divisor "Ou" (linhas ~70-139) por 1 `Card`, com duas abas/botões no topo pra alternar `modo`.
- [x] 1.3 Quando `modo === 'branco'`: mostrar o campo Título (`register('titulo')`) e o botão "Criar cotação" chamando `handleSubmit(aoCriar)`.
- [x] 1.4 Quando `modo === 'duplicar'`: mostrar o `<select>` de cotação de origem (mesmo já existente) e o botão "Duplicar cotação" chamando `aoDuplicar` diretamente (sem passar pelo `handleSubmit` do formulário de título, que não se aplica nesse modo).
- [x] 1.5 Manter `useCriarCotacao`/`useDuplicarCotacao`, `aoCriar`/`aoDuplicar`, tratamento de erro (`erroServidor`) exatamente como estão — só a apresentação muda.

## 2. Remover Duplicar da tela de detalhe

- [x] 2.1 Em `CotacaoDetalhePage.tsx`: remover o item `{ label: 'Duplicar', ... }` do array `acoesMenu` (adicionado pela change `revisar-acoes-tela-detalhe-cotacao`), deixando só o item "Cancelar" (quando aplicável ao status) dentro do `MenuAcoes`.
- [x] 2.2 Remover `aoDuplicar`, `duplicar` (`useDuplicarCotacao`) e qualquer outro código que só existia pra esse botão (ex.: o banner de itens omitidos que essa tela mostra após duplicar — conferir se ainda é usado por outra coisa antes de remover; se só servia pra esse fluxo, remover também).

## 3. Remover Duplicar da lista de Cotações

- [x] 3.1 Em `CotacoesPage.tsx`: remover o item `{ label: ..., onSelect: () => aoDuplicar(c.id), ... }` (linha ~278-285) do `MenuAcoes` de cada linha, deixando "Ver detalhes" e "Excluir".
- [x] 3.2 Remover `duplicar` (`useDuplicarCotacao`, linha ~65) e `aoDuplicar` (linha ~70), já que só existiam pra esse item de menu.

## 4. Testes

- [x] 4.1 Atualizar/ajustar `NovaCotacaoPage.test.tsx` (se existir) pros novos seletores (abas de modo, um só formulário visível por vez).
- [x] 4.2 Teste: alternar pra "Duplicar existente" esconde o campo Título e mostra o seletor de cotação de origem, e vice-versa.
- [x] 4.3 Teste: submeter em cada modo chama a mutation certa (`useCriarCotacao` vs `useDuplicarCotacao`).
- [x] 4.4 Teste: "Duplicar" não aparece mais no menu de `CotacaoDetalhePage` nem no menu de linha de `CotacoesPage` (ajustar os testes existentes que hoje procuram esse item).
- [x] 4.5 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
