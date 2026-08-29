## MODIFIED Requirements

### Requirement: Visualização da Cotação por token
O sistema SHALL, em `/cotacao/:token`, carregar `GET /public/cotacoes/:token` e exibir exatamente o que a API retorna: título/status/prazo da Cotação, saudação com o `representanteNome` e contexto de `empresaNome` e `compradorNome`, e a lista de itens com os dados de snapshot, o lance do próprio participante e o `precoUnitario` derivado (calculado pelo backend). A tela SHALL ser mobile-first, sem a navegação do painel, e SHALL forçar tema claro. A edição dos campos SHALL seguir o indicador `podeEditar` vindo da API; o front não decide se pode editar.

O cabeçalho — saudação, contexto de Empresa/Comprador, título e a linha de **Prazo** — SHALL ficar fixo no topo da viewport (`sticky top`) durante a rolagem da lista de itens, ocupando o mínimo de altura vertical necessário. A linha de Prazo SHALL exibir a data/hora formatada e SHALL ganhar realce visual de alerta (ex.: texto vermelho) quando faltar menos de 2 horas para o `prazo`; com o prazo já vencido ou ausente, a linha SHALL usar um tom neutro (sem realce de alerta). O cálculo de "faltam menos de 2h" SHALL usar o horário atual do dispositivo comparado ao `prazo` da API.

Cada item SHALL ser apresentado num card com hierarquia visual clara: a **unidade de medida** e o **campo de preço da embalagem** SHALL ter destaque (rótulo legível, input com área de toque ampliada e prefixo "R$"). A escolha entre cotar e não cotar o item SHALL ser feita por um controle de alternância (toggle) de duas opções mutuamente exclusivas ("Vou cotar" / "Não cotado"), com área de toque ampla, no lugar de um checkbox simples; o comportamento de autosave por item permanece o mesmo.

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
- **THEN** o cabeçalho com o título da cotação e a linha de Prazo continuam visíveis fixos no topo da tela

#### Scenario: Prazo próximo do vencimento é destacado
- **WHEN** faltam menos de 2 horas para o `prazo` da cotação
- **THEN** a linha de Prazo aparece com realce de alerta (ex.: vermelho)

#### Scenario: Prazo folgado ou vencido sem alerta
- **WHEN** faltam 2 horas ou mais para o `prazo`, ou o prazo já venceu, ou não há `prazo`
- **THEN** a linha de Prazo aparece em tom neutro, sem realce de alerta

#### Scenario: Alternar item entre "vou cotar" e "não cotado"
- **WHEN** o representante toca no toggle de um item para "Não cotado" e depois volta para "Vou cotar"
- **THEN** o item é enviado como não cotado ao marcar, e o campo de preço volta a ficar habilitado ao desmarcar, seguindo o mesmo autosave por item

### Requirement: Finalização com trava e limpeza da fila
O sistema SHALL manter o botão "Finalizar resposta" (`POST /public/cotacoes/:token/finalizar`) numa barra de ação fixa na base da viewport (`sticky bottom`), sempre acessível sem rolar até o fim da lista. Essa barra SHALL exibir, junto do botão, um indicador de progresso com o texto "Respondidos: N/T" (N = itens com lance definido — preço informado ou marcado como não cotado; T = total de itens) e uma barra visual proporcional a N/T. O botão SHALL ficar desabilitado, exibindo "Sincronizando N preço(s)…", enquanto a fila local daquele token não estiver vazia. A fila do token SHALL ser apagada inteira do `localStorage` somente quando o `finalizar` retornar sucesso (204). Em modo somente leitura a barra fixa não SHALL ser exibida.

#### Scenario: Não finaliza com pendência
- **WHEN** existe ao menos uma entrada na fila daquele token
- **THEN** o botão de finalizar fica desabilitado com a contagem de pendências

#### Scenario: Finalizar limpa a fila
- **WHEN** a fila está vazia e o representante finaliza com sucesso (204)
- **THEN** a chave `simplecote:fila:{token}` é removida do `localStorage` e a tela passa a refletir o estado `RESPONDIDO`

#### Scenario: Botão de finalizar sempre acessível
- **WHEN** a cotação tem 50 itens e o representante está no topo ou no meio da lista
- **THEN** o botão "Finalizar resposta" e o indicador de progresso continuam visíveis na base da tela, sem precisar rolar até o último item

#### Scenario: Progresso reflete os itens respondidos
- **WHEN** o representante definiu lance (preço ou "não cotado") em 15 de 50 itens
- **THEN** a barra fixa mostra "Respondidos: 15/50" e a barra visual preenchida em 30%
