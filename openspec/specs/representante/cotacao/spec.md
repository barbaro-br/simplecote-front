# representante/cotacao Specification

## Purpose

Tela pública por token para o representante responder uma Cotação sem login, do celular, com rede instável. A responsabilidade própria do front aqui é não perder o que já foi digitado; toda regra de domínio (tri-estado do lance, prazo, trava pós-finalização) é do backend.

## Requirements

### Requirement: Visualização da Cotação por token
O sistema SHALL, em `/cotacao/:token`, carregar `GET /public/cotacoes/:token` e exibir exatamente o que a API retorna: título/status/prazo da Cotação, saudação com o `representanteNome` e contexto de `empresaNome` e `compradorNome`, e a lista de itens com os dados de snapshot, o lance do próprio participante e o `precoUnitario` derivado (calculado pelo backend). A tela SHALL ser mobile-first, sem a navegação do painel, e SHALL forçar tema claro. A edição dos campos SHALL seguir o indicador `podeEditar` vindo da API; o front não decide se pode editar.

#### Scenario: Abrir a tela pelo token
- **WHEN** o representante acessa `/cotacao/:token` com um token válido
- **THEN** a tela mostra a saudação pelo nome da pessoa, a Empresa e o Comprador, e a lista de itens com o lance atual e o preço unitário já calculado

#### Scenario: Token inválido
- **WHEN** o token não corresponde a nenhum participante
- **THEN** a tela mostra um estado de "link inválido", sem vazar dados

#### Scenario: Somente leitura quando não pode editar
- **WHEN** a resposta traz `podeEditar` falso (prazo vencido, participante já `RESPONDIDO`, cotação não `ABERTA`)
- **THEN** os campos de preço aparecem desabilitados e o botão de finalizar não é oferecido

### Requirement: Autosave por item com máquina de estados de sincronização
O sistema SHALL, para cada item independentemente, aplicar o fluxo `digitando → (debounce de 800ms sem nova tecla) → enviando → sincronizado | falhou`. Ao entrar em `enviando`, o sistema SHALL gravar uma entrada na fila local e disparar `PUT /public/cotacoes/:token/lances` contendo **apenas aquele item** (preço, ou marcação de não cotado). Cada célula SHALL ter indicador visual distinto para `sincronizado` e `falhou`; o representante nunca precisa entender fila ou retry.

#### Scenario: Preço digitado sincroniza sozinho
- **WHEN** o representante digita um preço num item e para de digitar por 800ms
- **THEN** o sistema envia aquele item para a API e, no sucesso, a célula fica marcada como sincronizada, sem nenhum botão "salvar"

#### Scenario: Marcar não cotado
- **WHEN** o representante marca um item como "não cotado"
- **THEN** o item é enviado como não cotado e a célula fica sincronizada

#### Scenario: Um item por requisição
- **WHEN** o representante edita rapidamente três itens diferentes
- **THEN** o sistema dispara uma requisição por item (não um lote), para o feedback ser por célula

### Requirement: Fila de sincronização resiliente a rede ruim
O sistema SHALL manter, em `localStorage` sob a chave `simplecote:fila:{token}`, um mapa `itemCotacaoId → { preco?, naoCotado?, tentativas, ultimaTentativaEm }` dos itens ainda não confirmados pelo servidor. No sucesso de um item, sua entrada SHALL ser removida. Numa falha de rede, a entrada SHALL permanecer, `tentativas` SHALL ser incrementado e a célula SHALL ficar em `falhou`. Enquanto a fila não estiver vazia, um temporizador de 10s SHALL retentar cada entrada pendente na ordem de inserção; o evento `online` do navegador SHALL forçar uma tentativa imediata; e ao montar a tela com uma fila não-vazia o sistema SHALL disparar uma tentativa imediatamente.

#### Scenario: Falha de rede mantém o rascunho
- **WHEN** o envio de um item falha por rede
- **THEN** a entrada continua na fila em `localStorage`, `tentativas` aumenta, a célula mostra "falhou" e o valor digitado não é perdido

#### Scenario: Reenvio automático esvazia a fila
- **WHEN** a rede volta e o temporizador de 10s dispara (ou o evento `online` ocorre)
- **THEN** as entradas pendentes são reenviadas na ordem e, ao confirmar, saem da fila e as células ficam sincronizadas

#### Scenario: Reabrir a aba retoma pendências
- **WHEN** o representante fecha o navegador com itens pendentes e reabre `/cotacao/:token` depois
- **THEN** ao montar, a tela lê a fila do `localStorage` e dispara um reenvio imediato das pendências

### Requirement: Finalização com trava e limpeza da fila
O sistema SHALL manter o botão "Finalizar resposta" (`POST /public/cotacoes/:token/finalizar`) desabilitado, exibindo "Sincronizando N preço(s)…", enquanto a fila local daquele token não estiver vazia. A fila do token SHALL ser apagada inteira do `localStorage` somente quando o `finalizar` retornar sucesso (204).

#### Scenario: Não finaliza com pendência
- **WHEN** existe ao menos uma entrada na fila daquele token
- **THEN** o botão de finalizar fica desabilitado com a contagem de pendências

#### Scenario: Finalizar limpa a fila
- **WHEN** a fila está vazia e o representante finaliza com sucesso (204)
- **THEN** a chave `simplecote:fila:{token}` é removida do `localStorage` e a tela passa a refletir o estado `RESPONDIDO`

### Requirement: Visualização e confirmação do pedido por token
O sistema SHALL, em `/pedido/:token`, carregar `GET /public/pedidos/:token`, permitir baixar o PDF (`GET /public/pedidos/:token.pdf`) e confirmar o pedido (`POST /public/pedidos/:token/confirmar`). A tela SHALL ser mobile-first e sem a navegação do painel.

#### Scenario: Ver e baixar o pedido
- **WHEN** o representante acessa `/pedido/:token` com token válido
- **THEN** os dados do pedido são exibidos e o PDF pode ser baixado

#### Scenario: Confirmar o pedido
- **WHEN** o representante aciona "Confirmar"
- **THEN** o sistema chama a API de confirmação e a tela reflete o pedido confirmado; um erro `ProblemDetail` é exibido se a API recusar
