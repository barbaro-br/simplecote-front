## MODIFIED Requirements

### Requirement: Autosave por item com máquina de estados de sincronização
O sistema SHALL, para cada item independentemente, aplicar o fluxo `digitando → (debounce de 800ms sem nova tecla) → enviando → sincronizado | falhou`. Ao entrar em `enviando`, o sistema SHALL gravar uma entrada na fila local e disparar `PUT /public/cotacoes/:token/lances` contendo **apenas aquele item**: `{ itemCotacaoId, preco }` quando há preço no campo, ou `{ itemCotacaoId, naoCotado: true }` quando um campo antes preenchido passou a vazio. Um campo que nunca teve preço não dispara requisição. Cada célula SHALL ter indicador visual distinto para `sincronizado` e `falhou`; o representante nunca precisa entender fila ou retry. No sucesso da requisição, o sistema SHALL aplicar a resposta ao estado local da cotação (incluindo o `precoUnitario` recalculado pelo backend), para que o valor unitário do item reflita imediatamente, sem exigir refresh manual. Enquanto a célula está em `enviando` e ainda não há `precoUnitario` vindo do servidor, o campo de preço unitário SHALL exibir o estado "calculando…" em vez de "—".

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

## ADDED Requirements

### Requirement: Destaque do preço unitário
O preço unitário de cada item SHALL ser exibido com destaque visual — tamanho legível, algarismos tabulares (`tabular-nums`), alinhado à direita e na cor de primeiro plano do tema (`foreground`) — em vez de um texto apagado, para que o representante consiga comparar os valores unitários enquanto digita.

#### Scenario: Unitário legível e alinhado
- **WHEN** o card exibe um item com `precoUnitario`
- **THEN** o valor aparece com tamanho legível, algarismos tabulares, alinhado à direita e usando token de cor do tema (não cor fixa)
