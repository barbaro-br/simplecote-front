## MODIFIED Requirements

### Requirement: Visualização da Cotação por token
O sistema SHALL, em `/cotacao/:token`, carregar `GET /public/cotacoes/:token` e exibir exatamente o que a API retorna: título/status/prazo da Cotação, saudação com o `representanteNome` e contexto de `empresaNome` e `compradorNome`, e a lista de itens com os dados de snapshot, o lance do próprio participante e o `precoUnitario` derivado (calculado pelo backend). A tela SHALL ser mobile-first, sem a navegação do painel, e SHALL forçar tema claro. A edição dos campos SHALL seguir o indicador `podeEditar` vindo da API; o front não decide se pode editar.

O contexto da cotação — título, saudação pelo `representanteNome`, linha de Empresa/Comprador e a linha de **Prazo** — SHALL ficar na **barra de ação fixa na base da viewport** (`sticky bottom`, junto do botão "Finalizar" e da bolha de progresso; ver requisito "Finalização com trava e limpeza da fila"), não mais num cabeçalho fixo no topo. A lista de itens SHALL ocupar a área rolável a partir do topo da tela. A linha de Prazo SHALL exibir a data/hora formatada e SHALL ganhar realce visual de alerta (ex.: texto vermelho) quando faltar menos de 2 horas para o `prazo` ou o prazo já tiver vencido (neste caso exibindo "Prazo expirado"); com prazo folgado ou ausente, a linha SHALL usar um tom neutro. O cálculo de "faltam menos de 2h" SHALL usar o horário atual do dispositivo comparado ao `prazo` da API.

Cada item SHALL ser apresentado num card com hierarquia visual clara: o **nome do produto** em destaque, o **código de barras** (quando houver) alinhado à direita numa fonte discreta, uma linha compacta com a unidade/embalagem e a quantidade a comprar (ex.: "fd com 20un · comprar 10"), e o **campo de preço da embalagem** com prefixo "R$" e área de toque ampliada, com o rótulo **"P.CX"** exibido acima do campo. O **preço unitário derivado** SHALL ser exibido como texto simples (nunca como input), com o rótulo **"P.UN"** acima do valor — ambos os rótulos ("P.CX"/"P.UN") SHALL ficar sempre na mesma posição relativa (acima do respectivo valor) em todo item, nunca ao lado. O card SHALL exibir um **indicador de status automático**, derivado apenas de haver ou não valor no campo de preço: **visto (✓) verde** quando há preço, **marca (✗) vermelha** quando o campo está vazio. NÃO SHALL existir toggle, checkbox ou qualquer outro controle explícito para "não cotar" um item: a ausência de preço no campo é, por si, a marcação de "não cotado". Quando o campo de um item passa de vazio para preenchido, a borda do card SHALL dar um flash verde breve. O comportamento de autosave por item permanece o mesmo.

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

#### Scenario: Rótulos de preço ficam acima dos valores, não ao lado

- **WHEN** o representante visualiza um item da lista
- **THEN** o rótulo "P.CX" aparece acima do campo de preço da embalagem, e o rótulo "P.UN" aparece acima do preço unitário calculado, sem que o texto de nenhum dos dois transborde seu espaço nem sobreponha o ícone de status ao lado

#### Scenario: Preço unitário continua sendo só leitura

- **WHEN** o representante visualiza o preço unitário de um item
- **THEN** ele aparece como texto simples (não um campo editável), com peso visual menor que o preço da embalagem

### Requirement: Tutorial de primeira visita
Na primeira vez que o dispositivo abre `/cotacao/:token`, o sistema SHALL exibir um tutorial de onboarding em 3 passos: (1) anatomia do card de produto — incluindo o que os rótulos **"P.CX"** (preço da embalagem) e **"P.UN"** (preço unitário calculado) significam, (2) os estados do indicador (visto verde com preço / X vermelho sem preço) e que ele é automático, (3) tela final "pronto para começar", com uma **demonstração visual animada** do gesto de deslizar (o mini-card de exemplo desliza para a esquerda e revela o ícone de limpar), não só uma descrição em texto. O tutorial SHALL ter indicador de progresso (pontos), botão "Próximo" / "Entendi, vamos lá!" no último passo, e "Pular tutorial" nos passos anteriores ao último. Depois de concluído ou pulado, o sistema SHALL registrar isso em `localStorage` e não exibir o tutorial de novo naquele dispositivo. O tutorial NÃO SHALL bloquear o carregamento dos dados por trás dele.

#### Scenario: Primeira visita mostra o tutorial
- **WHEN** o dispositivo abre `/cotacao/:token` e não há registro de tutorial concluído no `localStorage`
- **THEN** o tutorial de 3 passos aparece sobre a tela

#### Scenario: Concluir o tutorial não repete
- **WHEN** o representante conclui ("Entendi, vamos lá!") ou toca em "Pular tutorial"
- **THEN** o tutorial some, o `localStorage` registra a conclusão e o tutorial não aparece em visitas seguintes no mesmo dispositivo

#### Scenario: Visitas seguintes não mostram o tutorial
- **WHEN** o dispositivo abre `/cotacao/:token` e já há registro de tutorial concluído
- **THEN** a tela abre direto na lista de itens, sem o tutorial

#### Scenario: Último passo demonstra o gesto de deslizar
- **WHEN** o representante chega no último passo do tutorial
- **THEN** o mini-card de exemplo anima um deslize para a esquerda, revelando o ícone de limpar, demonstrando o gesto (não só descrevendo em texto)

#### Scenario: Primeiro passo explica as abreviações de preço

- **WHEN** o representante vê o primeiro passo do tutorial (anatomia do card)
- **THEN** o passo explica o que "P.CX" e "P.UN" significam
