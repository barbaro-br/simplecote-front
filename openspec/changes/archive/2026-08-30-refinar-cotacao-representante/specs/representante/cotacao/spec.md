## MODIFIED Requirements

### Requirement: Layout limpo do Card e informações contextuais na base
O contexto da cotação — título, saudação pelo `representanteNome`, linha de Empresa/Comprador e a linha de **Prazo** — SHALL ficar na **barra de ação fixa na base da viewport** (`sticky bottom`, junto do botão "Finalizar" e da bolha de progresso; ver requisito "Finalização com trava e limpeza da fila"), não mais num cabeçalho fixo no topo. A lista de itens SHALL ocupar a área rolável a partir do topo da tela. A linha de Prazo SHALL exibir a data/hora formatada e SHALL ganhar realce visual de alerta (ex.: texto vermelho) quando faltar menos de 2 horas para o `prazo` ou o prazo já tiver vencido (neste caso exibindo "Prazo expirado"); com prazo folgado ou ausente, a linha SHALL usar um tom neutro. O cálculo de "faltam menos de 2h" SHALL usar o horário atual do dispositivo comparado ao `prazo` da API.

Cada item SHALL ser apresentado num card com hierarquia visual clara: o **nome do produto** em destaque, o **código de barras** (quando houver) alinhado à direita numa fonte discreta, uma linha compacta com a unidade/embalagem e a quantidade a comprar (ex.: "fd com 20un · comprar 10"), e o **campo de preço da embalagem** com prefixo "R$" e área de toque ampliada. A formatação da embalagem SHALL utilizar as seguintes siglas abreviadas em vez da palavra crua do banco de dados: Fardo vira "fd", Caixa vira "cx", Cartela vira "crt", e Unidade vira "un". Se a embalagem for do tipo Unidade, a string formatada SHALL ser simplificada apenas para "un · comprar X" (ocultando a porção redundante "com Y un"). O card SHALL exibir um **indicador de status automático**, derivado apenas de haver ou não valor no campo de preço: **visto (✓) verde** quando há preço, **marca (✗) vermelha** quando o campo está vazio. NÃO SHALL existir toggle, checkbox ou qualquer outro controle explícito para "não cotar" um item: a ausência de preço no campo é, por si, a marcação de "não cotado". Quando o campo de um item passa de vazio para preenchido, a borda do card SHALL dar um flash verde breve. O comportamento de autosave por item permanece o mesmo.

As cores da tela SHALL usar os tokens de tema do projeto (`primary`, `success`, `destructive`, `background`, subárvore `.tema-claro`); não SHALL haver cores fixas de marca embutidas no componente.

#### Scenario: Abrir a tela pelo token
- **WHEN** o representante acessa `/cotacao/:token` com um token válido
- **THEN** a tela mostra a saudação pelo nome da pessoa, a Empresa e o Comprador, e a lista de itens com o lance atual e o preço unitário já calculado

#### Scenario: Token inválido
- **WHEN** o token não corresponde a nenhum participante
- **THEN** a tela mostra um estado de "link inválido", sem vazar dados

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

#### Scenario: Exibição da unidade de medida do produto
- **WHEN** o item tem unidade "Fardo" com quantidade 20
- **THEN** a interface exibe "fd com 20un"
- **WHEN** o item tem unidade "Unidade"
- **THEN** a interface exibe apenas "un" (omitindo o "com X un" repetitivo)

### Requirement: Tutorial de primeira visita
Na primeira vez que o dispositivo abre `/cotacao/:token`, o sistema SHALL exibir um tutorial de onboarding em 3 passos: (1) anatomia do card de produto, (2) os estados do indicador (visto verde com preço / X vermelho sem preço) e que ele é automático, (3) tela final "pronto para começar", que SHALL possuir um texto forte e explícito informando que tocar em "Finalizar" é obrigatório para enviar a resposta (senão ela fica apenas como rascunho). O tutorial SHALL ter indicador de progresso (pontos), botão "Próximo" / "Entendi, vamos lá!" no último passo, e "Pular tutorial" nos passos anteriores ao último. Depois de concluído ou pulado, o sistema SHALL registrar isso em `localStorage` e não exibir o tutorial de novo naquele dispositivo. O tutorial NÃO SHALL bloquear o carregamento dos dados por trás dele.

#### Scenario: Primeira visita mostra o tutorial
- **WHEN** o dispositivo abre `/cotacao/:token` e não há registro de tutorial concluído no `localStorage`
- **THEN** o tutorial de 3 passos aparece sobre a tela, com o terceiro passo enfatizando a necessidade de Finalizar

#### Scenario: Concluir o tutorial não repete
- **WHEN** o representante conclui ("Entendi, vamos lá!") ou toca em "Pular tutorial"
- **THEN** o tutorial some, o `localStorage` registra a conclusão e o tutorial não aparece em visitas seguintes no mesmo dispositivo

#### Scenario: Visitas seguintes não mostram o tutorial
- **WHEN** o dispositivo abre `/cotacao/:token` e já há registro de tutorial concluído
- **THEN** a tela abre direto na lista de itens, sem o tutorial
