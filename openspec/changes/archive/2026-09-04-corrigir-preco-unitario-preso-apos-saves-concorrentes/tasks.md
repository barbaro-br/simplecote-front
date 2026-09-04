## 1. Corrigir aplicação de resposta concorrente

- [x] 1.1 Localizar o código responsável por aplicar a resposta de `PUT /public/cotacoes/:token/lances` ao estado local da cotação (fila/estado de sincronização por item na tela `/cotacao/:token`).
- [x] 1.2 Garantir que a atualização de estado usa o `itemCotacaoId` da resposta para atualizar apenas aquele item (merge por chave, nunca substituição de um snapshot inteiro que possa conter dados desatualizados de outro item ainda em voo).
- [x] 1.3 Reproduzir o bug localmente: preencher dois itens em sequência rápida (sem esperar o primeiro salvar) e confirmar hoje que o P.UN do primeiro item fica preso em "—" até um F5.
- [x] 1.4 Aplicar a correção e confirmar que os dois itens mostram o `precoUnitario` correto sem F5.
- [x] 1.5 Teste automatizado (unit ou integração de componente) cobrindo duas sincronizações concorrentes de itens diferentes e a atualização independente de cada P.UN.
