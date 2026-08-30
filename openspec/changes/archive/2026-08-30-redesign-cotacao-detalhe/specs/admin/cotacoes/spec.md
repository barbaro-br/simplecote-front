## MODIFIED Requirements

### Requirement: Montar itens da Cotação
O sistema SHALL permitir, enquanto a Cotação está em `RASCUNHO`, adicionar itens escolhendo um Produto do catálogo (`POST /api/cotacoes/{id}/itens`), ajustar a quantidade solicitada diretamente na listagem de itens e remover itens (`DELETE /api/cotacoes/{id}/itens/{itemId}`). A listagem de itens SHALL exibir claramente a embalagem do produto juntamente com a sua quantidade por embalagem (ex.: Caixa (12x)). Fora de `RASCUNHO` a edição e remoção de itens SHALL ficar indisponível. Quando o Produto desejado ainda não existe no catálogo, o sistema SHALL permitir cadastrá-lo **sem sair da tela de montagem da Cotação** e usá-lo imediatamente no item.

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
- **WHEN** a Cotação está `ABERTA`, `ENCERRADA`, `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** os controles de adicionar, editar quantidade e remover item não são exibidos ou ficam desabilitados

#### Scenario: Cadastrar Produto novo sem sair da montagem
- **WHEN** ao adicionar um item o Comprador percebe que o Produto não está no catálogo e aciona "Cadastrar novo produto"
- **THEN** o formulário de Produto abre sobre a mesma tela (modal), e ao salvar com sucesso o novo Produto passa a existir no catálogo e fica pré-selecionado para o item, sem que o Comprador tenha navegado para fora do detalhe da Cotação

### Requirement: Convidar Empresas
O sistema SHALL permitir acessar a lista de convidados através de uma ação principal no cabeçalho fixo (sticky) da tela de detalhes. O formulário para selecionar uma ou mais Empresas ativas do Comprador e convidá-las para a Cotação (`POST /api/cotacoes/{id}/participantes` com `empresaIds`) SHALL ser exibido em um modal sobreposto, garantindo que o Comprador não perca o contexto da lista de itens, independentemente de quão longa ela seja. O sistema SHALL listar os participantes com seu status de convite (a partir de `GET /api/cotacoes/{id}/participantes`), reenviar o convite de um participante (`POST /api/participantes/{participanteId}/reenviar-convite`) e compartilhar o link mágico do participante.

O compartilhamento do link mágico SHALL oferecer três formas, com o link e uma mensagem amigável já montados pelo front:

- **WhatsApp** como ação primária: SHALL abrir `https://wa.me/` numa nova aba com o parâmetro `text` contendo uma mensagem no formato `Olá {representanteNome}, aqui está o link da cotação {titulo} da {empresaNome}. O prazo é até {prazo}. Acesse: {linkMagico}`, com todo o texto URL-encodado. Quando o telefone do representante estiver disponível na resposta da API, a URL SHALL ser `https://wa.me/{telefone-somente-digitos}?text=...`; quando não estiver, SHALL ser `https://wa.me/?text=...` (o Comprador escolhe o contato). Se o `prazo` for nulo, a frase do prazo SHALL ser omitida.
- **E-mail** como ação primária: SHALL abrir um link `mailto:` com `subject` (ex.: `Cotação {titulo}`) e `body` iguais à mensagem do WhatsApp, ambos URL-encodados. Quando o e-mail do representante estiver disponível na resposta da API, ele SHALL ser o destinatário (`mailto:{email}?subject=...&body=...`); quando não estiver, SHALL abrir sem destinatário.
- **Copiar link** SHALL deixar de ser ação primária e passar a ser uma ação secundária, junto com **Reenviar convite** e **Remover empresa**, dentro de um menu suspenso ("Mais ações") por participante. Copiar SHALL escrever `linkMagico` na área de transferência e dar retorno visual temporário ("Copiado!").

Ações de compartilhamento SHALL estar disponíveis para qualquer participante já listado, independentemente do estado da Cotação (diferente de "Convidar", que só vale em `RASCUNHO`).

#### Scenario: Convite de empresas via modal
- **WHEN** o Comprador aciona o botão de "Representantes" no cabeçalho fixo
- **THEN** um modal é aberto exibindo a lista de empresas disponíveis para convite, permitindo a seleção múltipla e envio

#### Scenario: Cabeçalho sempre visível
- **WHEN** o Comprador rola a lista contendo 200 itens
- **THEN** o cabeçalho com o título da cotação, status, e botões principais de ação (incluindo o acesso aos Representantes) permanece visível no topo da tela

#### Scenario: Reenviar convite
- **WHEN** o Comprador abre o menu "Mais ações" de um participante e aciona "Reenviar"
- **THEN** o sistema chama a API de reenvio e reflete o novo status/instante do convite

#### Scenario: Erro de convite é exibido
- **WHEN** a API rejeita o convite (ex.: Empresa sem representante, cotação fora de `RASCUNHO`)
- **THEN** a mensagem `ProblemDetail` do backend é exibida no modal, sem alterar a lista

#### Scenario: Lista de participantes sobrevive a um recarregamento
- **WHEN** o Comprador recarrega a tela de detalhe de uma Cotação que já tem participantes
- **THEN** a lista de participantes e seus status de convite são carregados de `GET /api/cotacoes/{id}/participantes`

#### Scenario: Enviar link por WhatsApp com mensagem pronta
- **WHEN** o Comprador aciona "Enviar por WhatsApp" num participante
- **THEN** abre-se uma nova aba em `https://wa.me/...?text=...` com a mensagem contendo o nome do representante, o título da cotação, a empresa, o prazo (quando houver) e o link mágico, todo o texto URL-encodado; o número do representante é usado no caminho quando a API o fornece

#### Scenario: Enviar link por e-mail com mensagem pronta
- **WHEN** o Comprador aciona "Enviar por e-mail" num participante
- **THEN** abre-se um rascunho `mailto:` com assunto e corpo pré-preenchidos com a mesma mensagem; o e-mail do representante é usado como destinatário quando a API o fornece, senão o rascunho abre sem destinatário

#### Scenario: Copiar link continua disponível como ação secundária
- **WHEN** o Comprador abre o menu "Mais ações" de um participante e aciona "Copiar link"
- **THEN** o `linkMagico` é escrito na área de transferência e o item mostra retorno visual temporário de confirmação

