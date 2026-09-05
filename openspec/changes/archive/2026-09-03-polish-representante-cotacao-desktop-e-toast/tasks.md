## 1. Investigar a causa

- [x] 1.1 Reproduzir manualmente (ou com um teste) o cenário: limpar o preço de um item e observar quanto tempo o toast "Preço removido" fica na tela, incluindo depois de navegar para outra tela do fluxo (ex.: tela de sucesso). Confirmar se é só a duração padrão do `sonner` parecendo mais longa do que o esperado, ou se há uma chamada duplicada de `toast()`/falta de dedup.

  Diagnóstico: não há chamada duplicada (único `toast()` no repo, `ItemLanceCard.tsx:64`). Sem `duration` → padrão do sonner `TOAST_LIFETIME = 4000` (`node_modules/sonner/dist/index.mjs:470`). Sem `id` → sonner gera id novo a cada chamada e empilha toasts do mesmo item. O `<Toaster>` em `App.tsx:25` fica fora do `<RouterProvider>`, então o toast persiste através de troca de rota até o timer expirar — por isso "sobreviveu" à tela de sucesso.

## 2. Corrigir

- [x] 2.1 Em `ItemLanceCard.tsx`, na chamada `toast('Preço removido', {...})`: adicionar `duration: 4000` e `id: \`preco-removido-${item.itemCotacaoId}\`` (ajustar o valor de `duration` conforme o diagnóstico da tarefa 1.1, se indicar que 4000ms não é suficiente/adequado).

## 3. Testes

- [x] 3.1 Teste: limpar o preço de um item duas vezes em sequência rápida resulta em um único toast visível (não dois empilhados).
- [x] 3.2 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [x] 4.1 Testar com dados reais (dev): limpar um preço, cronometrar quanto tempo o toast leva pra sumir sozinho, e confirmar que não sobrevive a uma navegação de tela (ex.: finalizar a cotação logo em seguida). **(verificado visualmente pelo dono do produto em 05/09/2026)**
