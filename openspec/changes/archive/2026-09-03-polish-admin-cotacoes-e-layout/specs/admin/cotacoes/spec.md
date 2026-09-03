## MODIFIED Requirements

### Requirement: Montar itens da Cotação
O sistema SHALL permitir, enquanto a Cotação está em `RASCUNHO`, adicionar itens escolhendo um Produto do catálogo (`POST /api/cotacoes/{id}/itens`), ajustar a quantidade solicitada diretamente na listagem de itens e remover itens (`DELETE /api/cotacoes/{id}/itens/{itemId}`). A listagem de itens SHALL exibir claramente a embalagem do produto juntamente com a sua quantidade por embalagem (ex.: Caixa (12x)). Fora de `RASCUNHO` a edição de quantidade e a remoção de itens SHALL ficar indisponível. Quando o Produto desejado ainda não existe no catálogo, o sistema SHALL permitir cadastrá-lo **sem sair da tela de montagem da Cotação** e usá-lo imediatamente no item. Enquanto a Cotação está `ABERTA`, o sistema SHALL também permitir adicionar um novo item — a partir da tela de acompanhamento da grade ao vivo, não da listagem de montagem — reaproveitando o mesmo formulário de escolha de Produto. O sistema SHALL, do mesmo jeito, permitir **editar** um Produto já existente diretamente da lista de escolha de produtos, sem sair da tela de montagem.

No modal "Adicionar Produtos", o subtítulo do cabeçalho (contagem de produtos) SHALL refletir a seleção em andamento nesta sessão do modal — produtos já na Cotação combinados com o que foi marcado/desmarcado desde que o modal abriu — e não só a contagem de itens já persistidos antes de abrir o modal.

#### Scenario: Adicionar e remover item em rascunho
- **WHEN** a Cotação está em `RASCUNHO` e o Comprador adiciona um Produto e depois remove um item
- **THEN** a lista de itens reflete cada operação após a resposta da API

#### Scenario: Ajustar quantidade do item na listagem
- **WHEN** a Cotação está em `RASCUNHO` e o Comprador ajusta a "Qtd. Solicitada" de um item diretamente na listagem
- **THEN** a interface atualiza a quantidade exibida (utilizando API de atualização se disponível, ou mockando visualmente caso contrário)

#### Scenario: Exibição detalhada da embalagem
- **WHEN** o Comprador visualiza a lista de itens
- **THEN** a coluna de embalagem exibe o formato combinado da unidade e sua quantidade interna (ex: "Fardo (24x)")

#### Scenario: Edição de itens travada fora de rascunho
- **WHEN** a Cotação está `ENCERRADA`, `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** os controles de adicionar, editar quantidade e remover item não são exibidos ou ficam desabilitados

#### Scenario: Cadastrar Produto novo sem sair da montagem
- **WHEN** ao adicionar um item o Comprador percebe que o Produto não está no catálogo e aciona "Cadastrar novo produto"
- **THEN** o formulário de Produto abre sobre a mesma tela (modal), e ao salvar com sucesso o novo Produto passa a existir no catálogo e fica pré-selecionado para o item, sem que o Comprador tenha navegado para fora do detalhe da Cotação

#### Scenario: Adicionar item com a Cotação ABERTA

- **WHEN** o Comprador aciona "Adicionar item" na tela de acompanhamento de uma Cotação `ABERTA`
- **THEN** o mesmo formulário de escolha de Produto e quantidade abre, e ao confirmar o item passa a aparecer na grade ao vivo

#### Scenario: Editar Produto existente sem sair da montagem

- **WHEN** o Comprador, ao escolher um Produto pra adicionar à Cotação, aciona editar num Produto já existente na lista
- **THEN** o mesmo formulário de Produto abre sobre a tela em modo edição, pré-preenchido com os dados atuais, e ao salvar as mudanças ficam refletidas na lista sem que o Comprador tenha saído da tela de montagem

#### Scenario: Subtítulo do modal acompanha a seleção em andamento

- **WHEN** o Comprador marca ou desmarca produtos no modal "Adicionar Produtos", antes de clicar "Concluído"
- **THEN** o subtítulo do cabeçalho do modal atualiza a contagem imediatamente a cada marcação/desmarcação, sem esperar o clique em "Concluído"

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação antes de `encerrar`, `cancelar` e `apurar`, nomeando a consequência de cada uma. O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida. Quando existirem participantes em status `VISUALIZOU` (engajaram mas não finalizaram a resposta), o diálogo de confirmação de `apurar` SHALL listar seus nomes como aviso informativo, sem bloquear a confirmação. "Cancelar" SHALL ser acionado a partir de um menu overflow ("⋯"), separado dos botões de transição primária (Abrir/Encerrar/Reabrir/Apurar) — nunca um botão de primeiro nível na mesma fileira.

#### Scenario: Abrir a Cotação
- **WHEN** o Comprador informa um `prazo` e confirma "Abrir"
- **THEN** o sistema chama `POST /{id}/abrir` e a tela passa a refletir o status `ABERTA` e o prazo

#### Scenario: Apurar pede confirmação explícita
- **WHEN** o Comprador aciona "Apurar"
- **THEN** um diálogo descreve a consequência (a apuração não pode ser desfeita; itens sem lance ficam sem vencedor) e só após a confirmação a API é chamada

#### Scenario: Cancelar pede confirmação explícita
- **WHEN** o Comprador abre o menu overflow ("⋯") e aciona "Cancelar"
- **THEN** um diálogo nomeia a consequência antes de a API ser chamada

#### Scenario: Transição inválida mostra o erro do backend
- **WHEN** a API rejeita uma transição (ex.: apurar uma cotação ainda `ABERTA` com pendências que o backend não permite)
- **THEN** a mensagem `ProblemDetail` é exibida e o status na tela não muda

#### Scenario: Apurar avisa sobre participantes não finalizados
- **WHEN** o Comprador aciona "Apurar" e há um ou mais participantes em `VISUALIZOU`
- **THEN** o diálogo de confirmação lista os nomes desses participantes como aviso, além da descrição padrão da consequência

#### Scenario: Cancelar fica no menu overflow, não em botão visível

- **WHEN** o Comprador abre o detalhe de uma Cotação em qualquer status onde "Cancelar" é aplicável
- **THEN** "Cancelar" aparece dentro do menu "⋯", não como botão de primeiro nível ao lado das transições de estado

#### Scenario: Encerrar pede confirmação explícita

- **WHEN** o Comprador aciona "Encerrar" numa Cotação `ABERTA`
- **THEN** um diálogo descreve a consequência (a Cotação para de aceitar novas respostas dos representantes; pode ser reaberta depois) e só após a confirmação a API é chamada
