## MODIFIED Requirements

### Requirement: Autosave por item com máquina de estados de sincronização
O sistema SHALL, para cada item independentemente, aplicar o fluxo `digitando → (debounce de 800ms sem nova tecla) → enviando → sincronizado | falhou`. Ao entrar em `enviando`, o sistema SHALL gravar uma entrada na fila local e disparar `PUT /public/cotacoes/:token/lances` contendo **apenas aquele item**: `{ itemCotacaoId, preco }` quando há preço no campo, ou `{ itemCotacaoId, naoCotado: true }` quando um campo antes preenchido passou a vazio. Um campo que nunca teve preço não dispara requisição. Cada célula SHALL ter indicador visual distinto para `sincronizado` e `falhou`; o representante nunca precisa entender fila ou retry. No sucesso da requisição, o sistema SHALL aplicar a resposta ao estado local da cotação (incluindo o `precoUnitario` recalculado pelo backend), para que o valor unitário do item reflita imediatamente, sem exigir refresh manual. Enquanto a célula está em `enviando` e ainda não há `precoUnitario` vindo do servidor, o campo de preço unitário SHALL exibir o estado "calculando…" em vez de "—". A aplicação da resposta de sincronização de um item ao estado local SHALL ser isolada por `itemCotacaoId`: quando duas ou mais sincronizações de itens diferentes estiverem em andamento ao mesmo tempo, a resposta de cada uma SHALL atualizar somente a célula do item correspondente, e a ordem de chegada das respostas NÃO SHALL fazer a resposta de um item sobrescrever ou apagar o `precoUnitario` já aplicado de outro item.

#### Scenario: Preço digitado sincroniza sozinho
- **WHEN** o representante digita um preço num item e para de digitar por 800ms
- **THEN** o sistema envia aquele item para a API e, no sucesso, a célula fica marcada como sincronizada, sem nenhum botão "salvar"

#### Scenario: Marcar não cotado
- **WHEN** o representante apaga o preço de um item que já havia sido enviado com preço e para de digitar por 800ms
- **THEN** o sistema envia `{ itemCotacaoId, naoCotado: true }` para aquele item e a célula fica sincronizada

#### Scenario: Um item por requisição
- **WHEN** o representante edita rapidamente três itens diferentes
- **THEN** o sistema dispara uma requisição por item (não um lote), para o feedback ser por célula

#### Scenario: Preço unitário atualiza após sincronizar
- **WHEN** o representante digita um preço num item que ainda não tinha lance e a sincronização retorna sucesso
- **THEN** o card passa a exibir o `precoUnitario` recalculado devolvido pela API, sem exigir refresh manual

#### Scenario: Unitário mostra "calculando…" durante o envio
- **WHEN** um item está em `enviando` e o servidor ainda não devolveu o `precoUnitario`
- **THEN** o campo de preço unitário exibe "calculando…" em vez de "—"

#### Scenario: Sincronizações concorrentes de itens diferentes não se atropelam

- **WHEN** o representante preenche o preço de dois itens diferentes em sequência rápida, de forma que as duas sincronizações fiquem em andamento ao mesmo tempo e terminem próximas uma da outra
- **THEN** ambos os itens exibem o respectivo `precoUnitario` recalculado corretamente assim que sua própria sincronização termina, sem que a resposta de um item deixe o P.UN do outro travado em "—" ou "calculando…"

#### Scenario: Recarregar a página nunca é necessário para ver o preço unitário

- **WHEN** o representante sincroniza dois ou mais itens em sequência rápida
- **THEN** o valor de `precoUnitario` exibido em cada item, sem precisar recarregar a página, é o mesmo valor que apareceria após um F5
