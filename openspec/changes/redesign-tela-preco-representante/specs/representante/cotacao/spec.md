## MODIFIED Requirements

### Requirement: Visualização da Cotação por token
O sistema SHALL, em `/cotacao/:token`, carregar `GET /public/cotacoes/:token` e exibir exatamente o que a API retorna: título/status/prazo da Cotação, saudação com o `representanteNome` e contexto de `empresaNome` e `compradorNome`, e a lista de itens com os dados de snapshot, o lance do próprio participante e o `precoUnitario` derivado (calculado pelo backend). A tela SHALL ser mobile-first, sem a navegação do painel, e SHALL forçar tema claro. A edição dos campos SHALL seguir o indicador `podeEditar` vindo da API; o front não decide se pode editar.

O contexto da cotação — título, saudação pelo `representanteNome`, linha de Empresa/Comprador e a linha de **Prazo** — SHALL ficar na **barra de ação fixa na base da viewport** (`sticky bottom`, junto do botão "Finalizar" e da bolha de progresso; ver requisito "Finalização com trava e limpeza da fila"), não mais num cabeçalho fixo no topo. A lista de itens SHALL ocupar a área rolável a partir do topo da tela. A linha de Prazo SHALL exibir a data/hora formatada e SHALL ganhar realce visual de alerta (ex.: texto vermelho) quando faltar menos de 2 horas para o `prazo` ou o prazo já tiver vencido (neste caso exibindo "Prazo expirado"); com prazo folgado ou ausente, a linha SHALL usar um tom neutro. O cálculo de "faltam menos de 2h" SHALL usar o horário atual do dispositivo comparado ao `prazo` da API.

Cada item SHALL ser apresentado num card com hierarquia visual clara: o **nome do produto** em destaque, o **código de barras** (quando houver) alinhado à direita numa fonte discreta, uma linha compacta com a unidade/embalagem e a quantidade a comprar (ex.: "fd com 20un · comprar 10"), e o **campo de preço da embalagem** com prefixo "R$" e área de toque ampliada. O card SHALL exibir um **indicador de status automático**, derivado apenas de haver ou não valor no campo de preço: **visto (✓) verde** quando há preço, **marca (✗) vermelha** quando o campo está vazio. NÃO SHALL existir toggle, checkbox ou qualquer outro controle explícito para "não cotar" um item: a ausência de preço no campo é, por si, a marcação de "não cotado". Quando o campo de um item passa de vazio para preenchido, a borda do card SHALL dar um flash verde breve. O comportamento de autosave por item permanece o mesmo.

As cores da tela SHALL usar os tokens de tema do projeto (`primary`, `success`, `destructive`, `background`, subárvore `.tema-claro`); não SHALL haver cores fixas de marca embutidas no componente.

#### Scenario: Abrir a tela pelo token
- **WHEN** o representante acessa `/cotacao/:token` com um token válido
- **THEN** a tela mostra a saudação pelo nome da pessoa, a Empresa e o Comprador, e a lista de itens com o lance atual e o preço unitário já calculado

#### Scenario: Token inválido
- **WHEN** o token não corresponde a nenhum participante
- **THEN** a tela mostra um estado de "link inválido", sem vazar dados

#### Scenario: Somente leitura quando não pode editar
- **WHEN** a resposta traz `podeEditar` falso (prazo vencido, participante já `RESPONDIDO`, cotação não `ABERTA`)
- **THEN** os campos de preço aparecem desabilitados e o botão de finalizar não é oferecido

#### Scenario: Cabeçalho e prazo permanecem visíveis ao rolar
- **WHEN** o representante rola a lista de itens para baixo
- **THEN** a barra de ação fixa na base — com o título da cotação e a linha de Prazo — continua visível

#### Scenario: Prazo próximo do vencimento é destacado
- **WHEN** faltam menos de 2 horas para o `prazo` da cotação
- **THEN** a linha de Prazo aparece com realce de alerta (ex.: vermelho)

#### Scenario: Prazo vencido é destacado como "Prazo expirado"
- **WHEN** o `prazo` da cotação já passou
- **THEN** a linha exibe o texto "Prazo expirado" com realce de alerta

#### Scenario: Prazo folgado ou vencido sem alerta
- **WHEN** faltam 2 horas ou mais para o `prazo`, ou não há `prazo`
- **THEN** a linha de Prazo aparece em tom neutro, sem realce de alerta

#### Scenario: Indicador de status acompanha o preço automaticamente
- **WHEN** o campo de preço de um item tem valor
- **THEN** o card mostra o visto (✓) verde
- **WHEN** o campo de preço de um item está vazio
- **THEN** o card mostra a marca (✗) vermelha, sem exigir nenhuma outra ação do representante

#### Scenario: Alternar item entre "vou cotar" e "não cotado"
- **WHEN** o representante apaga o preço de um item que estava preenchido e, depois, digita um preço de novo
- **THEN** ao esvaziar, o item é sincronizado como não cotado e o indicador do card vira a marca (✗) vermelha; ao digitar de novo, o item é sincronizado com preço e o indicador vira o visto (✓) verde — tudo pelo mesmo autosave por item, sem nenhum controle dedicado

#### Scenario: Flash verde ao preencher um preço
- **WHEN** o preço de um item passa de vazio para preenchido
- **THEN** a borda do card pisca em verde por um instante e depois volta ao normal

### Requirement: Autosave por item com máquina de estados de sincronização
O sistema SHALL, para cada item independentemente, aplicar o fluxo `digitando → (debounce de 800ms sem nova tecla) → enviando → sincronizado | falhou`. Ao entrar em `enviando`, o sistema SHALL gravar uma entrada na fila local e disparar `PUT /public/cotacoes/:token/lances` contendo **apenas aquele item**: `{ itemCotacaoId, preco }` quando há preço no campo, ou `{ itemCotacaoId, naoCotado: true }` quando um campo antes preenchido passou a vazio. Um campo que nunca teve preço não dispara requisição. Cada célula SHALL ter indicador visual distinto para `sincronizado` e `falhou`; o representante nunca precisa entender fila ou retry.

#### Scenario: Preço digitado sincroniza sozinho
- **WHEN** o representante digita um preço num item e para de digitar por 800ms
- **THEN** o sistema envia aquele item para a API e, no sucesso, a célula fica marcada como sincronizada, sem nenhum botão "salvar"

#### Scenario: Marcar não cotado
- **WHEN** o representante apaga o preço de um item que já havia sido enviado com preço e para de digitar por 800ms
- **THEN** o sistema envia `{ itemCotacaoId, naoCotado: true }` para aquele item e a célula fica sincronizada

#### Scenario: Um item por requisição
- **WHEN** o representante edita rapidamente três itens diferentes
- **THEN** o sistema dispara uma requisição por item (não um lote), para o feedback ser por célula

### Requirement: Finalização com trava e limpeza da fila
O sistema SHALL manter o botão "Finalizar" (`POST /public/cotacoes/:token/finalizar`) numa barra de ação fixa na base da viewport (`sticky bottom`), sempre acessível sem rolar até o fim da lista, junto do título da cotação, da saudação/contexto e da linha de Prazo. A barra SHALL exibir uma **bolha de progresso "N de T"** onde N = número de itens com preço informado e T = total de itens; o número N SHALL ter uma animação de "pop" a cada vez que muda, e a bolha SHALL trocar para um destaque de cor (fundo `primary`) quando N = T. O botão SHALL ficar desabilitado, exibindo "Sincronizando N preço(s)…", enquanto a fila local daquele token não estiver vazia. Acionar "Finalizar" SHALL abrir primeiro o modal de confirmação (ver requisito "Confirmação antes de enviar a resposta"); o `POST` só ocorre depois que o representante confirma. A fila do token SHALL ser apagada inteira do `localStorage` somente quando o `finalizar` retornar sucesso (204). Em modo somente leitura a barra fixa não SHALL ser exibida.

#### Scenario: Não finaliza com pendência
- **WHEN** existe ao menos uma entrada na fila daquele token
- **THEN** o botão de finalizar fica desabilitado com a contagem de pendências

#### Scenario: Finalizar limpa a fila
- **WHEN** a fila está vazia e o representante confirma a finalização com sucesso (204)
- **THEN** a chave `simplecote:fila:{token}` é removida do `localStorage`

#### Scenario: Botão de finalizar sempre acessível
- **WHEN** a cotação tem 50 itens e o representante está no topo ou no meio da lista
- **THEN** o botão "Finalizar" e a bolha de progresso continuam visíveis na base da tela, sem precisar rolar até o último item

#### Scenario: Progresso reflete os itens respondidos
- **WHEN** o representante informou preço em 15 de 50 itens
- **THEN** a bolha fixa de progresso mostra "15 de 50" (N conta apenas itens com preço)

#### Scenario: Bolha destaca quando todos os itens têm preço
- **WHEN** todos os itens da cotação têm preço informado
- **THEN** a bolha aparece com o destaque de cor de "completo" (fundo `primary`)

## ADDED Requirements

### Requirement: Gesto de deslizar para limpar o preço
Em telas de toque, o sistema SHALL permitir arrastar um card de item para a esquerda; ao passar de um limiar (~70px), ao soltar o card o sistema SHALL apagar o preço daquele item. Durante o arrasto, um fundo de "limpar" (com ícone) SHALL aparecer atrás do card. O gesto SHALL ficar disponível apenas quando `podeEditar` é verdadeiro. Apagar o preço por esse gesto tem o mesmo efeito de apagá-lo pelo teclado: o indicador volta para a marca (✗) vermelha e o item é sincronizado como não cotado.

#### Scenario: Deslizar além do limiar limpa o preço
- **WHEN** o representante arrasta um card com preço para a esquerda além do limiar e solta
- **THEN** o preço é apagado, o indicador do card volta para a marca vermelha e o item é sincronizado como não cotado

#### Scenario: Deslizar de leve não limpa
- **WHEN** o representante arrasta o card para a esquerda mas solta antes do limiar
- **THEN** o card volta à posição original e o preço é mantido

#### Scenario: Sem gesto em modo somente leitura
- **WHEN** `podeEditar` é falso
- **THEN** arrastar o card não altera o preço

### Requirement: Confirmação antes de enviar a resposta
Ao acionar "Finalizar", o sistema SHALL abrir um modal "Enviar cotação?" antes de chamar a API. Quando houver itens sem preço, o modal SHALL exibir um aviso destacado com a contagem de itens que serão **enviados sem preço / em branco** (com concordância singular/plural). Quando todos os itens tiverem preço, o modal SHALL informar que todos os itens estão preenchidos. O modal SHALL ter ações "Cancelar" (fecha sem enviar) e "Confirmar" (dispara o `POST /public/cotacoes/:token/finalizar`). O modal SHALL usar o componente de diálogo compartilhado do projeto.

#### Scenario: Aviso de itens em branco
- **WHEN** o representante aciona "Finalizar" com 3 itens sem preço
- **THEN** o modal aparece com o aviso "3 itens sem preço serão enviados em branco" e o `POST` ainda não foi chamado

#### Scenario: Confirmar envia
- **WHEN** o representante toca em "Confirmar" no modal
- **THEN** o sistema chama `POST /public/cotacoes/:token/finalizar`

#### Scenario: Cancelar não envia
- **WHEN** o representante toca em "Cancelar" ou fecha o modal
- **THEN** nenhuma chamada de finalização é feita e a tela volta ao estado anterior

#### Scenario: Todos os itens preenchidos
- **WHEN** o representante aciona "Finalizar" com todos os itens com preço
- **THEN** o modal informa que todos os itens estão preenchidos, sem aviso de itens em branco

### Requirement: Tela de sucesso após finalizar
Quando o `POST /public/cotacoes/:token/finalizar` retornar 204, o sistema SHALL exibir uma tela de sucesso em tela cheia (visto grande + mensagem "Cotação enviada!" com o primeiro nome do representante). A tela de sucesso SHALL se dispensar sozinha após cerca de 3 segundos e SHALL oferecer um botão "Fechar" para dispensá-la na hora. Ao ser dispensada, a tela SHALL refletir o estado `RESPONDIDO` (somente leitura), sem a barra de ação fixa.

#### Scenario: Sucesso mostra a confirmação
- **WHEN** a finalização retorna 204
- **THEN** a tela de sucesso em tela cheia aparece com "Cotação enviada!"

#### Scenario: Sucesso se dispensa e cai no estado respondido
- **WHEN** a tela de sucesso é dispensada (pelo botão "Fechar" ou pelo tempo)
- **THEN** a tela passa a mostrar os itens em modo somente leitura, sem a barra de ação fixa

### Requirement: Tutorial de primeira visita
Na primeira vez que o dispositivo abre `/cotacao/:token`, o sistema SHALL exibir um tutorial de onboarding em 3 passos: (1) anatomia do card de produto, (2) os estados do indicador (visto verde com preço / X vermelho sem preço) e que ele é automático, (3) tela final "pronto para começar". O tutorial SHALL ter indicador de progresso (pontos), botão "Próximo" / "Entendi, vamos lá!" no último passo, e "Pular tutorial" nos passos anteriores ao último. Depois de concluído ou pulado, o sistema SHALL registrar isso em `localStorage` e não exibir o tutorial de novo naquele dispositivo. O tutorial NÃO SHALL bloquear o carregamento dos dados por trás dele.

#### Scenario: Primeira visita mostra o tutorial
- **WHEN** o dispositivo abre `/cotacao/:token` e não há registro de tutorial concluído no `localStorage`
- **THEN** o tutorial de 3 passos aparece sobre a tela

#### Scenario: Concluir o tutorial não repete
- **WHEN** o representante conclui ("Entendi, vamos lá!") ou toca em "Pular tutorial"
- **THEN** o tutorial some, o `localStorage` registra a conclusão e o tutorial não aparece em visitas seguintes no mesmo dispositivo

#### Scenario: Visitas seguintes não mostram o tutorial
- **WHEN** o dispositivo abre `/cotacao/:token` e já há registro de tutorial concluído
- **THEN** a tela abre direto na lista de itens, sem o tutorial
