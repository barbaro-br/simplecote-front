# admin/cotacoes Specification

## Purpose

Interface administrativa do ciclo de vida da Cotação: montar, convidar, abrir, acompanhar as respostas, apurar e ver o resultado. O front exibe e dispara ações; toda regra de estado e apuração é do backend (`simplecote-back/spec.md`).

## Requirements

### Requirement: Lista de cotações por status

O sistema SHALL exibir, em `/admin/cotacoes`, a lista de Cotações do Comprador (`GET /api/cotacoes`) com título, status e prazo, e um atalho para criar uma nova Cotação. O filtro por status SHALL ser refletido na URL como parâmetro `status` (`/admin/cotacoes?status=ENCERRADA`), de modo que a lista possa ser acessada já filtrada a partir de um link (ex.: os atalhos do dashboard). Um `status` ausente ou inválido SHALL exibir todas as cotações. A busca por título SHALL permanecer local (estado da página, sem ir para a URL).

#### Scenario: Painel lista as cotações

- **WHEN** o admin acessa `/admin/cotacoes`
- **THEN** as cotações retornadas pela API aparecem com seu status, e o usuário pode filtrar a lista por um status específico

#### Scenario: Filtro refletido na URL

- **WHEN** o admin seleciona o filtro "Encerrada" (ou chega por um link com `?status=ENCERRADA`)
- **THEN** a URL passa a conter `?status=ENCERRADA` e a lista exibe apenas as cotações encerradas

#### Scenario: Status ausente ou inválido

- **WHEN** a URL não traz `status`, ou traz um valor que não corresponde a um `StatusCotacao`
- **THEN** a lista exibe todas as cotações (comportamento de "Todos")

#### Scenario: Atalho para nova cotação

- **WHEN** o Comprador aciona "Nova cotação"
- **THEN** o sistema abre o formulário de criação

### Requirement: Criar e duplicar Cotação

O sistema SHALL permitir criar uma Cotação informando o título (`POST /api/cotacoes`,
nasce em `RASCUNHO`) e SHALL permitir duplicar uma Cotação existente
(`POST /api/cotacoes/{id}/duplicar`, retorna a nova Cotação e a lista de itens
omitidos).

A ação **"Duplicar"** SHALL estar disponível **só** a partir do formulário de Nova
Cotação (modo "Duplicar existente") — não na lista de Cotações nem na tela de
detalhe de uma Cotação. O formulário de Nova Cotação SHALL apresentar os dois modos
("Em branco" e "Duplicar existente") como uma escolha única dentro de um só
formulário — não dois cards separados por um divisor — mostrando apenas o campo
relevante ao modo selecionado (Título para "Em branco"; seleção de cotação de
origem para "Duplicar existente"), com um único controle de submit cujo rótulo e
ação acompanham o modo escolhido. A seleção da cotação de origem SHALL usar um
combobox com busca (filtra a lista pelo título digitado), não um `<select>` nativo
do navegador. Ao ser acionada, o sistema SHALL chamar
`POST /api/cotacoes/{id}/duplicar` e, no sucesso, navegar para o detalhe da Cotação
recém-criada (que nasce em `RASCUNHO`).

Enquanto a chamada de duplicação está em andamento, o controle acionado SHALL indicar
o progresso ("Duplicando…") e ficar desabilitado, impedindo disparo duplicado.

Quando a resposta traz itens omitidos (`omitidos`, cada um com nome e motivo — ex.:
Produto inativado), a tela da Cotação nova SHALL exibir um aviso **não-bloqueante**
listando cada item omitido com seu motivo. Quando `omitidos` é vazio, nenhum aviso
SHALL ser exibido. Quando a duplicação falha, o sistema SHALL exibir a mensagem
`ProblemDetail` do backend no ponto de origem da ação e **não** navegar.

#### Scenario: Criação com sucesso
- **WHEN** o Comprador informa um título válido e confirma
- **THEN** a Cotação é criada em `RASCUNHO` e o sistema navega para o detalhe dela

#### Scenario: Título vazio é bloqueado localmente
- **WHEN** o Comprador tenta criar sem título
- **THEN** o formulário exibe erro de validação e não envia a requisição

#### Scenario: Duplicar cotação anterior
- **WHEN** o Comprador escolhe duplicar uma Cotação existente
- **THEN** uma nova Cotação em `RASCUNHO` é criada a partir dela e o sistema abre seu detalhe

#### Scenario: Formulário de Nova Cotação alterna entre os dois modos num único card

- **WHEN** o Comprador abre "Nova Cotação" e alterna entre "Em branco" e "Duplicar existente"
- **THEN** o campo relevante ao modo muda (Título, ou a seleção de cotação de origem), dentro do mesmo card, sem navegar pra outra tela nem exibir os dois formulários simultaneamente

#### Scenario: Duplicar a partir da lista e do detalhe

- **WHEN** o Comprador vê uma linha da lista de Cotações, ou está na tela de detalhe de uma Cotação
- **THEN** nenhum controle de "Duplicar" é exibido em nenhum dos dois lugares — a única forma de duplicar é pelo formulário de Nova Cotação (isso substitui o comportamento anterior, em que "Duplicar" também estava disponível nesses dois pontos)

#### Scenario: Itens omitidos são avisados sem bloquear
- **WHEN** a duplicação retorna com sucesso e a lista `omitidos` tem um ou mais itens
- **THEN** a tela da Cotação nova mostra um aviso não-bloqueante com o nome e o motivo de cada item omitido, e o Comprador segue podendo trabalhar na Cotação

#### Scenario: Duplicação sem itens omitidos
- **WHEN** a duplicação retorna com sucesso e `omitidos` é vazio
- **THEN** a tela da Cotação nova não exibe nenhum aviso de itens omitidos

#### Scenario: Falha na duplicação
- **WHEN** a API rejeita a duplicação (`ProblemDetail`)
- **THEN** a mensagem do backend é exibida no ponto de origem da ação e o sistema não navega

#### Scenario: Duplicação em andamento trava o controle
- **WHEN** o Comprador aciona "Duplicar" e a resposta ainda não chegou
- **THEN** o controle mostra "Duplicando…" e fica desabilitado até a resposta

#### Scenario: Buscar a cotação de origem pelo título

- **WHEN** o Comprador abre o combobox de "Cotação de origem" e digita parte do título de uma cotação anterior
- **THEN** a lista mostra só as cotações cujo título contém o texto digitado, e selecionar uma delas preenche `origemId` como antes

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

### Requirement: Convidar Empresas
O sistema SHALL permitir acessar a lista de convidados através de uma ação principal no cabeçalho fixo (sticky) da tela de detalhes. O formulário para selecionar uma ou mais Empresas ativas do Comprador e convidá-las para a Cotação (`POST /api/cotacoes/{id}/participantes` com `empresaIds`) SHALL ser exibido em um modal sobreposto, garantindo que o Comprador não perca o contexto da lista de itens, independentemente de quão longa ela seja. O sistema SHALL listar os participantes com seu status de convite (a partir de `GET /api/cotacoes/{id}/participantes`), reenviar o convite de um participante (`POST /api/participantes/{participanteId}/reenviar-convite`) e compartilhar o link mágico do participante.

O compartilhamento do link mágico SHALL oferecer três formas, com o link e uma mensagem amigável já montados pelo front:

- **WhatsApp**: SHALL abrir `https://wa.me/` numa nova aba com o parâmetro `text` contendo uma mensagem no formato `Olá {representanteNome}, aqui está o link da cotação {titulo} da {empresaNome}. O prazo é até {prazo}. Acesse: {linkMagico}`, com todo o texto URL-encodado. Quando o telefone do representante estiver disponível na resposta da API, a URL SHALL ser `https://wa.me/{telefone-somente-digitos}?text=...`; quando não estiver, SHALL ser `https://wa.me/?text=...` (o Comprador escolhe o contato). Se o `prazo` for nulo, a frase do prazo SHALL ser omitida.
- **E-mail**: SHALL abrir um link `mailto:` com `subject` (ex.: `Cotação {titulo}`) e `body` iguais à mensagem do WhatsApp, ambos URL-encodados. Quando o e-mail do representante estiver disponível na resposta da API, ele SHALL ser o destinatário (`mailto:{email}?subject=...&body=...`); quando não estiver, SHALL abrir sem destinatário.
- **Copiar link**: SHALL escrever `linkMagico` na área de transferência e dar retorno visual temporário ("Copiado!").

Ações de compartilhamento SHALL estar disponíveis para qualquer participante já listado, independentemente do estado da Cotação (diferente de "Convidar", que só vale em `RASCUNHO`).

Para um participante já convidado, todas as ações da linha (as três de compartilhamento acima, Reenviar convite, e — quando aplicável — Finalizar/Reabrir resposta, ver requirement "Correção de lance e reabertura de resposta pelo admin") SHALL ficar agrupadas num único menu overflow ("⋯", componente `MenuAcoes` já usado em outras telas do produto), não como ícones ou botões soltos na linha. "Convidar" SHALL continuar como botão visível de primeiro nível, já que só existe para uma empresa ainda não convidada (linha sem badge de status nem outras ações concorrendo por espaço).

A coluna de nome da empresa e do representante SHALL ter largura mínima garantida na linha, de modo a não ser a primeira a ceder espaço quando outros elementos (badge de status, menu de ações) estão presentes na mesma linha — nomes de tamanho comum NÃO SHALL truncar para um único caractere.

O status de convite (`conviteStatus`) SHALL ser exibido, **enquanto o participante ainda está em `CONVIDADO`**, distinguindo três casos: `ENVIADO` (rótulo neutro/positivo), `FALHOU` (rótulo com destaque visual de erro, indicando que o sistema tentou enviar e não conseguiu — nunca o mesmo rótulo usado para "ainda não enviado"), e qualquer outro valor SHALL cair no rótulo neutro atual de "Não enviado". A partir do momento em que o `participanteStatus` deixa de ser `CONVIDADO` (`VISUALIZOU` ou `RESPONDIDO`), o badge de status de convite NÃO SHALL ser exibido — o participante comprovadamente teve acesso à cotação por algum caminho, então o estado de entrega do e-mail automático deixa de ser informação relevante ali.

#### Scenario: Convite de empresas via modal
- **WHEN** o Comprador aciona o botão de "Representantes" no cabeçalho fixo
- **THEN** um modal é aberto exibindo a lista de empresas disponíveis para convite, permitindo a seleção múltipla e envio

#### Scenario: Cabeçalho sempre visível
- **WHEN** o Comprador rola a lista contendo 200 itens
- **THEN** o cabeçalho com o título da cotação, status, e botões principais de ação (incluindo o acesso aos Representantes) permanece visível no topo da tela

#### Scenario: Reenviar convite
- **WHEN** o Comprador abre o menu "⋯" de um participante e aciona "Reenviar convite"
- **THEN** o sistema chama a API de reenvio e reflete o novo status/instante do convite

#### Scenario: Erro de convite é exibido
- **WHEN** a API rejeita o convite (ex.: Empresa sem representante, cotação fora de `RASCUNHO`)
- **THEN** a mensagem `ProblemDetail` do backend é exibida no modal, sem alterar a lista

#### Scenario: Lista de participantes sobrevive a um recarregamento
- **WHEN** o Comprador recarrega a tela de detalhe de uma Cotação que já tem participantes
- **THEN** a lista de participantes e seus status de convite são carregados de `GET /api/cotacoes/{id}/participantes`

#### Scenario: Enviar link por WhatsApp com mensagem pronta
- **WHEN** o Comprador abre o menu "⋯" de um participante e aciona "Enviar por WhatsApp"
- **THEN** abre-se uma nova aba em `https://wa.me/...?text=...` com a mensagem contendo o nome do representante, o título da cotação, a empresa, o prazo (quando houver) e o link mágico, todo o texto URL-encodado; o número do representante é usado no caminho quando a API o fornece

#### Scenario: Enviar link por e-mail com mensagem pronta
- **WHEN** o Comprador aciona "Enviar por e-mail" num participante
- **THEN** abre-se um rascunho `mailto:` com assunto e corpo pré-preenchidos com a mesma mensagem; o e-mail do representante é usado como destinatário quando a API o fornece, senão o rascunho abre sem destinatário

#### Scenario: Copiar link continua disponível como ação secundária
- **WHEN** o Comprador abre o menu "⋯" de um participante e aciona "Copiar link"
- **THEN** o `linkMagico` é escrito na área de transferência e o item mostra retorno visual temporário de confirmação

#### Scenario: Falha real de envio é distinguida de "ainda não enviado"

- **WHEN** o `conviteStatus` de um participante é `FALHOU` (o sistema tentou enviar o e-mail e não conseguiu) e o participante ainda está `CONVIDADO`
- **THEN** o participante exibe um rótulo com destaque visual de erro, diferente do rótulo neutro usado quando o convite simplesmente ainda não foi enviado

#### Scenario: Falha de envio some depois que o participante engaja

- **WHEN** um participante com `conviteStatus: FALHOU` passa a `VISUALIZOU` ou `RESPONDIDO`
- **THEN** o badge de "Falha no envio" deixa de aparecer para esse participante, mesmo que `conviteStatus` continue `FALHOU` — só o badge de status de resposta (`Visualizou`/`Respondido`) é exibido

#### Scenario: Ações de um participante ficam agrupadas num único menu

- **WHEN** o Comprador vê a linha de um participante já convidado (independentemente do `participanteStatus`)
- **THEN** as ações implementadas e aplicáveis àquela linha (Enviar por WhatsApp, Copiar link, Reenviar convite, e Finalizar/Reabrir resposta quando aplicável) ficam dentro do menu "⋯", sem ícones ou botões de ação soltos na linha

#### Scenario: Nome não trunca para um único caractere

- **WHEN** a linha de um participante exibe simultaneamente um badge de status de resposta e o menu "⋯" de ações
- **THEN** o nome da empresa e o nome do representante continuam legíveis (não truncam para um único caractere) para nomes de tamanho comum

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação antes de `encerrar`, `cancelar` e `apurar`, nomeando a consequência de cada uma. O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida. Quando existirem participantes em status `VISUALIZOU` (engajaram mas não finalizaram a resposta), o diálogo de confirmação de `apurar` SHALL listar seus nomes como aviso informativo, sem bloquear a confirmação. "Cancelar" SHALL ser exibido como um botão visível (não dentro de um menu overflow), com estilo visual de alerta (ex.: contorno/texto na cor de destrutivo, sem ser um botão preenchido do mesmo peso das transições primárias) e separado espacialmente dos botões de transição primária (Abrir/Encerrar/Reabrir/Apurar) na fileira de ações, para reduzir o risco de clique acidental mesmo estando visível. "Cancelar" SHALL só ser exibido quando `status` é `RASCUNHO` ou `ABERTA` — a única combinação que o backend (`Cotacao.cancelar()`) de fato aceita; em qualquer outro status (`ENCERRADA`, `PEDIDOS_GERADOS`, `CANCELADA`) o botão NÃO SHALL ser exibido.

#### Scenario: Abrir a Cotação
- **WHEN** o Comprador informa um `prazo` e confirma "Abrir"
- **THEN** o sistema chama `POST /{id}/abrir` e a tela passa a refletir o status `ABERTA` e o prazo

#### Scenario: Apurar pede confirmação explícita
- **WHEN** o Comprador aciona "Apurar"
- **THEN** um diálogo descreve a consequência (a apuração não pode ser desfeita; itens sem lance ficam sem vencedor) e só após a confirmação a API é chamada

#### Scenario: Cancelar pede confirmação explícita
- **WHEN** o Comprador aciona "Cancelar"
- **THEN** um diálogo nomeia a consequência antes de a API ser chamada

#### Scenario: Transição inválida mostra o erro do backend
- **WHEN** a API rejeita uma transição (ex.: apurar uma cotação ainda `ABERTA` com pendências que o backend não permite)
- **THEN** a mensagem `ProblemDetail` é exibida e o status na tela não muda

#### Scenario: Apurar avisa sobre participantes não finalizados
- **WHEN** o Comprador aciona "Apurar" e há um ou mais participantes em `VISUALIZOU`
- **THEN** o diálogo de confirmação lista os nomes desses participantes como aviso, além da descrição padrão da consequência

#### Scenario: Cancelar fica no menu overflow, não em botão visível

- **WHEN** o Comprador abre o detalhe de uma Cotação `RASCUNHO` ou `ABERTA` (status onde "Cancelar" é aplicável)
- **THEN** "Cancelar" aparece como botão visível de estilo de alerta, separado espacialmente do grupo de botões de transição primária — não dentro de um menu overflow

#### Scenario: Encerrar pede confirmação explícita

- **WHEN** o Comprador aciona "Encerrar" numa Cotação `ABERTA`
- **THEN** um diálogo descreve a consequência (a Cotação para de aceitar novas respostas dos representantes; pode ser reaberta depois) e só após a confirmação a API é chamada

#### Scenario: Cancelar não aparece em ENCERRADA

- **WHEN** o Comprador abre o detalhe de uma Cotação `ENCERRADA`
- **THEN** o botão "Cancelar" não é exibido — o backend só aceita cancelar a partir de `RASCUNHO` ou `ABERTA`

#### Scenario: Cancelar não aparece em PEDIDOS_GERADOS ou CANCELADA

- **WHEN** o Comprador abre o detalhe de uma Cotação `PEDIDOS_GERADOS` ou já `CANCELADA`
- **THEN** o botão "Cancelar" não é exibido

### Requirement: Cabeçalho fixo da tela de detalhe sem elevação de cartão

O cabeçalho sticky da tela de detalhe da Cotação (título, status, prazo e botões de ação) SHALL usar uma borda inferior sutil para se separar visualmente do conteúdo rolável, mas NÃO SHALL usar sombra de elevação — o cabeçalho não deve parecer um cartão/caixa flutuante sobreposto à página.

#### Scenario: Cabeçalho sem sombra elevada

- **WHEN** o Comprador visualiza a tela de detalhe de uma Cotação, com ou sem rolagem da lista de itens
- **THEN** o cabeçalho fixo é separado do conteúdo por uma borda inferior, sem sombra projetada

### Requirement: Correção de lance e reabertura de resposta pelo admin

O sistema SHALL permitir ao Comprador corrigir diretamente o lance de um participante para um item (`PUT /api/participantes/{participanteId}/lances/{itemId}`), reabrir a resposta de um participante `RESPONDIDO` (`POST /api/participantes/{participanteId}/reabrir`) e finalizar em nome de um participante `VISUALIZOU` (`POST /api/participantes/{participanteId}/finalizar`), a partir da tela de detalhe da Cotação. A grade de respostas é lida de `GET /api/cotacoes/{id}/ao-vivo` sem polling (o polling é Fase 2). O modal de participantes (`RepresentantesModal`, acionado pelo botão "Representantes") SHALL, quando a Cotação está `ABERTA` ou `ENCERRADA`, mostrar em cada linha também o status da resposta (`Convidado`/`Visualizou`/`Respondido`) e, dentro do menu "⋯" daquela linha, o item de finalizar/reabrir aplicável, junto das demais ações do participante (ver requirement "Convidar Empresas"). Quando a Cotação não está `ABERTA` nem `ENCERRADA` (ex.: `PEDIDOS_GERADOS`, `CANCELADA`), o menu "⋯" NÃO SHALL oferecer "Finalizar" nem "Reabrir resposta", mesmo que o participante esteja em `VISUALIZOU`/`RESPONDIDO` — essas ações não têm efeito útil fora desse intervalo.

#### Scenario: Admin corrige um lance

- **WHEN** o Comprador edita o preço (ou marca não cotado) de um lance de um participante e confirma
- **THEN** o sistema chama a API de correção e a grade de respostas reflete o novo valor

#### Scenario: Admin reabre a resposta de um participante

- **WHEN** o Comprador abre o menu "⋯" de um participante `RESPONDIDO` e aciona "Reabrir resposta"
- **THEN** o sistema chama a API e o participante volta a aparecer como editável pelo representante

#### Scenario: Admin finaliza a resposta de um participante que não finalizou

- **WHEN** o Comprador abre o menu "⋯" de um participante `VISUALIZOU` e aciona "Finalizar"
- **THEN** o sistema chama `POST /api/participantes/{participanteId}/finalizar` e a linha desse participante passa a mostrar `Respondido`

#### Scenario: Modal "Representantes" reflete o status de resposta de cada um

- **WHEN** o Comprador abre o modal "Representantes" de uma Cotação `ABERTA` ou `ENCERRADA` com participantes em status de resposta diferentes
- **THEN** cada participante aparece com seu status de resposta atual (badge) e, dentro do seu menu "⋯", só o item de ação aplicável àquele status (`Finalizar` para `Visualizou`, `Reabrir resposta` para `Respondido`, nenhum dos dois para `Convidado`), junto das demais ações do participante

#### Scenario: Ações de finalizar/reabrir somem fora de ABERTA/ENCERRADA

- **WHEN** o Comprador abre o modal "Representantes" de uma Cotação em `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** nenhum menu "⋯" oferece os itens "Finalizar" ou "Reabrir resposta", independentemente do status de resposta de cada participante

### Requirement: Resultado da apuração e pedidos
O sistema SHALL exibir o resultado de uma Cotação apurada (`GET /api/cotacoes/{id}/resultado`): vencedor por item identificado pelo **nome da Empresa** (não do representante), preço da embalagem e preço unitário derivado que já vêm prontos da API. SHALL listar os pedidos gerados (`GET /api/cotacoes/{id}/pedidos`), permitir enviar um pedido (`POST /api/pedidos/{id}/enviar`), baixar o resultado em XLSX (`GET /api/cotacoes/{id}/resultado.xlsx`) e baixar o PDF de um pedido (`GET /api/pedidos/{id}.pdf`). Quando a API indicar que um item foi `decididoPorDesempate`, a tela SHALL exibir um indicador visual junto ao preço desse item, sem recalcular ou inferir o empate.

A lista de pedidos e o vencedor por item SHALL ser apresentados numa única lista de pedidos (não duas tabelas separadas). Cada linha de pedido (Empresa, status, total, ações) SHALL ter um controle de expandir/recolher; ao expandir, os itens vencidos daquele pedido (produto, preço da embalagem, preço unitário — com o indicador de empate quando aplicável — e subtotal) SHALL aparecer inline, abaixo da linha do pedido, sem navegar para outra tela. Itens sem vencedor (sem lance algum, portanto sem pedido associado) SHALL continuar sendo listados à parte, abaixo da lista de pedidos.

A tela SHALL oferecer um campo de **margem de lucro (%)** global, acima da lista de pedidos. Quando preenchido, cada item exibido nas linhas expandidas SHALL mostrar, além do preço de custo já existente, um **preço de venda sugerido** (`preço de custo × (1 + margem / 100)`), calculado inteiramente no front a partir do preço de custo já apurado pela API — sem alterar, recalcular ou substituir o preço de custo, o vencedor ou qualquer outro dado da apuração. Cada item SHALL permitir sobrescrever a margem global com uma margem própria; um item com margem própria SHALL manter seu valor mesmo que a margem global mude depois. A margem (global e por item) SHALL ser efêmera — mantida só no estado da tela, sem ser persistida no backend, sem ser enviada em nenhuma chamada de API, e sem aparecer no XLSX/PDF exportados (que continuam vindo prontos do backend). A interface SHALL deixar claro que o preço de venda é uma sugestão/prévia, não o preço de custo real do pedido.

#### Scenario: Ver resultado com vencedores por empresa
- **WHEN** o Comprador abre o resultado de uma Cotação `PEDIDOS_GERADOS`
- **THEN** cada item mostra o nome da Empresa vencedora e os preços já calculados pelo backend, sem o front recalcular nada

#### Scenario: Enviar um pedido
- **WHEN** o Comprador aciona "Enviar" num pedido da lista
- **THEN** o sistema chama `POST /api/pedidos/{id}/enviar` e o status do pedido na tela é atualizado

#### Scenario: Baixar exportações
- **WHEN** o Comprador aciona "Baixar XLSX" no resultado ou "Baixar PDF" num pedido
- **THEN** o arquivo binário retornado pela API é entregue ao navegador para download

#### Scenario: Item decidido por empate mostra indicador
- **WHEN** um item do resultado vem da API com `decididoPorDesempate: true`
- **THEN** o preço desse item exibe um indicador visual (badge) com um texto explicando que o preço empatou com outro concorrente e foi decidido por critério de desempate

#### Scenario: Item sem empate não mostra indicador
- **WHEN** um item do resultado vem com `decididoPorDesempate: false` (ou o campo ausente)
- **THEN** nenhum indicador de empate é exibido para esse item

#### Scenario: Expandir um pedido mostra seus itens vencidos

- **WHEN** o Comprador aciona o controle de expandir na linha de um pedido
- **THEN** os itens vencidos daquele pedido aparecem inline, abaixo da linha, com produto, preço da embalagem, preço unitário (com indicador de empate quando aplicável) e subtotal — sem navegar para outra tela

#### Scenario: Recolher volta a esconder os itens

- **WHEN** o Comprador aciona o controle de recolher numa linha de pedido já expandida
- **THEN** os itens daquele pedido deixam de ser exibidos, voltando ao estado compacto

#### Scenario: Itens sem vencedor continuam visíveis fora da lista de pedidos

- **WHEN** a apuração tem um ou mais itens sem nenhum lance vencedor
- **THEN** esses itens aparecem listados abaixo da lista de pedidos, independente de qualquer pedido estar expandido ou não

#### Scenario: Margem global aplica a todos os itens

- **WHEN** o Comprador preenche o campo de margem de lucro global com "30" e expande um pedido
- **THEN** cada item daquele pedido mostra um preço de venda sugerido igual ao preço de custo do item multiplicado por 1,30

#### Scenario: Margem por item sobrescreve a global

- **WHEN** o Comprador já preencheu uma margem global e edita a margem de um item específico para um valor diferente
- **THEN** o preço de venda sugerido daquele item usa a margem própria dele, e os demais itens continuam usando a margem global

#### Scenario: Margem por item não é afetada por mudanças na margem global depois de customizada

- **WHEN** um item já tem margem própria definida e o Comprador muda o valor do campo de margem global
- **THEN** o preço de venda sugerido do item customizado não muda; só os itens que nunca tiveram margem própria acompanham a nova margem global

#### Scenario: Sem margem preenchida, nenhum preço de venda é exibido

- **WHEN** o Comprador não preenche nenhuma margem (nem global, nem de item específico)
- **THEN** a coluna de preço de venda sugerido mostra "—", sem afetar as demais colunas já existentes

#### Scenario: Margem não é persistida nem enviada ao backend

- **WHEN** o Comprador preenche uma margem, envia um pedido ou baixa o XLSX/PDF, e depois recarrega a página do Resultado
- **THEN** nenhuma chamada de API (envio de pedido, exportação) inclui a margem ou o preço de venda sugerido, e ao recarregar a página o campo de margem volta a ficar vazio

### Requirement: Grade ao vivo da Cotação
O sistema SHALL oferecer a grade de acompanhamento da Cotação **diretamente na tela de detalhe da Cotação**, substituindo as seções estáticas de Itens e Respostas. A grade: linhas = itens, colunas = Empresas convidadas, cada célula com o status do lance (`COTADO`/`NAO_COTADO`/`PENDENTE`), o preço da embalagem e o preço unitário derivado que vêm prontos de `GET /api/cotacoes/{id}/ao-vivo`; o menor preço unitário do item SHALL ser destacado. A tela SHALL mostrar a contagem de participantes `RESPONDIDO` sobre o total. O front NÃO SHALL recalcular preço, vencedor ou menor preço — tudo vem da API.

Enquanto a Cotação está `ABERTA`, a grade SHALL escutar atualizações em tempo real via **Server-Sent Events (SSE)** através de um endpoint no backend (e.g., `/api/cotacoes/{id}/ao-vivo/stream`); quando a Cotação deixa de estar `ABERTA`, a conexão SSE SHALL ser encerrada.

Cada célula SHALL permitir ao Comprador corrigir aquele lance a partir da grade (usando o `participanteId` que a célula carrega), abrindo o fluxo de correção de lance sem sair da tela.

Para suportar alto volume de dados, a grade SHALL ter seu **próprio contêiner de rolagem vertical** (altura limitada, `overflow-y` próprio — não depender do scroll da página inteira), dentro do qual o **cabeçalho fica fixo no topo** (nomes das Empresas) e a **coluna do item fica fixa à esquerda**, ambos com fundo opaco e uma hierarquia de z-index (células base abaixo, coluna do item acima, cabeçalho acima, canto de interseção no topo). A coluna "Item" SHALL usar peso de fonte reduzido (`font-normal`/`font-medium`), de modo que o foco visual recaia sobre os preços e status.

Cada célula SHALL exibir seu conteúdo numa única linha visual: uma célula `COTADO` SHALL mostrar o preço da embalagem e o preço unitário derivado juntos numa linha (ex.: "R$ 12,50 · R$ 0,50/un"), sem rótulo de texto "COTADO" nem "MENOR" — o destaque do menor preço unitário do item SHALL ser transmitido só por cor de fundo/borda, não por texto adicional. Uma célula `PENDENTE`/`NAO_COTADO` SHALL mostrar só a pílula de status, sem linha adicional de traço/preenchimento vazio.

#### Scenario: Grade renderiza o estado das células
- **WHEN** o Comprador abre o detalhe de uma Cotação `ABERTA` com itens e Empresas convidadas
- **THEN** a grade é exibida diretamente, e cada célula mostra o status do lance daquela Empresa para aquele item, o preço quando `COTADO`, e o menor preço unitário do item aparece destacado por cor; o cabeçalho mostra "respondidos / total"

#### Scenario: Polling liga em ABERTA e desliga fora
- **WHEN** a Cotação está `ABERTA`
- **THEN** a grade estabelece uma conexão SSE para receber eventos em tempo real; e quando a Cotação passa a `ENCERRADA`/`PEDIDOS_GERADOS`/`CANCELADA`, a conexão SSE é fechada

#### Scenario: Atualização reativa da grade
- **WHEN** a Cotação está `ABERTA` e o backend envia um evento de atualização via SSE (ex.: novo lance)
- **THEN** a grade atualiza imediatamente os dados exibidos sem precisar de recarregamento manual ou polling

#### Scenario: Corrigir lance pela célula
- **WHEN** o Comprador aciona uma célula da grade no detalhe
- **THEN** o fluxo de correção de lance abre para aquele `participanteId` e item, e ao confirmar a grade reflete o novo valor

#### Scenario: Cabeçalho e item permanecem visíveis ao rolar
- **WHEN** o Comprador rola verticalmente uma grade com 70+ itens (dentro do contêiner de rolagem da própria grade), ou horizontalmente com 10+ Empresas
- **THEN** o cabeçalho com os nomes das Empresas permanece visível no topo da grade e a coluna do nome do item permanece visível à esquerda, sem sobreposição com o cabeçalho fixo da página nem com o corpo da tabela

#### Scenario: Célula cotada numa linha só, sem rótulo "COTADO"/"MENOR"

- **WHEN** o Comprador vê uma célula `COTADO` na grade
- **THEN** o preço da embalagem e o preço unitário aparecem juntos numa única linha, sem os textos "COTADO" ou "MENOR" — quando é o menor preço do item, isso é indicado só por cor de fundo/borda

#### Scenario: Célula vazia numa linha só

- **WHEN** o Comprador vê uma célula `PENDENTE` ou `NAO_COTADO` na grade
- **THEN** aparece só a pílula de status, sem linha adicional de traço abaixo dela

### Requirement: Ajuste de quantidade na grade

Enquanto a Cotação está `ABERTA` ou `ENCERRADA`, a grade SHALL exibir a `quantidadeSolicitada` de cada item e permitir ao Comprador alterá-la tanto pelos botões `[-]`/`[+]` (ajuste de 1 em 1) quanto digitando o valor diretamente num campo numérico editável (confirmado ao perder o foco ou pressionar Enter), ambos chamando `PATCH /api/cotacoes/{id}/itens/{itemId}/quantidade`. Um valor digitado inválido (vazio, zero, negativo ou não numérico) NÃO SHALL disparar a chamada — o campo SHALL reverter ao último valor confirmado. Em `PEDIDOS_GERADOS` e `CANCELADA` a quantidade SHALL ficar somente leitura (não editável, nem pelos botões nem pelo campo digitável). Após salvar, a grade SHALL refletir a nova quantidade sem recarregar a página.

#### Scenario: Alterar quantidade na grade

- **WHEN** a Cotação está `ABERTA` (ou `ENCERRADA`) e o Comprador altera a quantidade de um item na grade e confirma
- **THEN** o `PATCH` é chamado e a grade passa a exibir a nova quantidade, sem recarregamento manual

#### Scenario: Quantidade somente leitura após apurar

- **WHEN** a Cotação está `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** a quantidade dos itens não é editável na grade

#### Scenario: Digitar a quantidade diretamente

- **WHEN** o Comprador clica no campo de quantidade de um item (Cotação `ABERTA` ou `ENCERRADA`), digita um novo valor inteiro válido e pressiona Enter (ou clica fora do campo)
- **THEN** o sistema chama o mesmo `PATCH` de atualização de quantidade com o valor digitado, e a grade passa a exibir o novo valor

#### Scenario: Valor inválido não é enviado

- **WHEN** o Comprador digita um valor vazio, zero, negativo ou não numérico no campo de quantidade e sai do campo
- **THEN** nenhuma chamada é feita à API e o campo volta a exibir o último valor confirmado

#### Scenario: Ajuste fino continua disponível pelos botões

- **WHEN** o Comprador clica em `[-]` ou `[+]` ao lado do campo de quantidade
- **THEN** a quantidade muda em 1 unidade e é confirmada, exatamente como antes — o campo digitável é um caminho adicional, não uma substituição

### Requirement: Referência de última compra no hover
O sistema SHALL exibir, ao passar o mouse sobre um item da grade ao vivo, um popover com a **referência de última compra** daquele produto (campos `ultimoPrecoUnitario`, `ultimaCompraEmpresa`, `ultimaCompraEm` da resposta): o preço unitário, a Empresa que venceu e a data (formatada pt-BR / America/Sao_Paulo). Quando o produto nunca foi comprado, o popover SHALL indicar "sem compra anterior". O popover PODE indicar visualmente se o menor preço atual do item está acima ou abaixo dessa referência.

#### Scenario: Item com compra anterior
- **WHEN** o Comprador passa o mouse sobre um item cujo produto já foi comprado numa cotação apurada
- **THEN** o popover mostra o preço unitário da última compra, o nome da Empresa vencedora e a data formatada em pt-BR

#### Scenario: Item sem compra anterior
- **WHEN** o Comprador passa o mouse sobre um item cujo produto nunca foi comprado
- **THEN** o popover indica "sem compra anterior", sem preço nem empresa

### Requirement: Apresentação visual refinada da grade ao vivo

A grade ao vivo SHALL apresentar os valores financeiros alinhados à direita, os estados vazios como badges e os preços cotados num formato de cartão consistente, sem alterar os dados ou regras que exibe.

#### Scenario: Colunas financeiras alinhadas à direita

- **WHEN** o Comprador abre a grade com Empresas convidadas
- **THEN** o cabeçalho de cada Empresa e os valores de preço/status nas células ficam alinhados à direita, facilitando a comparação dos centavos

#### Scenario: Estado vazio exibido como badge

- **WHEN** uma célula está `PENDENTE` ou `NAO_COTADO`
- **THEN** o rótulo aparece como uma pílula sutil (fundo claro, texto menor e mais opaco), em vez de texto solto

#### Scenario: Seletor de quantidade visualmente secundário

- **WHEN** a coluna do item exibe o seletor de quantidade `[-]`/`[+]`
- **THEN** os botões têm tamanho, borda e padding reduzidos, ficando visualmente secundários em relação ao nome do item

#### Scenario: Preço cotado padrão em formato de cartão

- **WHEN** uma célula está `COTADO` sem ser o menor preço do item
- **THEN** o preço e o preço unitário aparecem juntos numa única linha, num bloco com borda fina e fundo padrão (`rounded-md`), no mesmo formato de cartão do bloco do menor preço (que se distingue só pela cor)

### Requirement: Animação de entrada só na carga inicial

A animação de entrada escalonada das linhas da lista de Cotações SHALL ocorrer apenas na carga inicial da lista (quando os dados chegam pela primeira vez), e SHALL NOT se repetir quando o admin altera a busca por título ou o filtro de status.

#### Scenario: Ampliar a busca não faz linhas reaparecerem com delay

- **WHEN** o admin digita uma busca que esconde algumas cotações e depois apaga parte do texto, trazendo-as de volta
- **THEN** as linhas que voltam a aparecer ficam visíveis imediatamente, sem um novo delay escalonado de entrada

#### Scenario: Trocar o filtro de status não reanima a lista

- **WHEN** o admin troca o filtro de status
- **THEN** a lista atualizada aparece sem o efeito de fade-in escalonado que só deve ocorrer na carga inicial da página

### Requirement: Navegação entre as telas de Cotações via breadcrumb

O sistema SHALL exibir, na tela de detalhe da Cotação e na tela de Resultado da apuração, uma trilha de navegação (breadcrumb) numa linha própria acima do título, nunca dividindo espaço com botões de ação. A trilha SHALL refletir a hierarquia `Cotações › {título da Cotação}` (detalhe) ou `Cotações › {título da Cotação} › Resultado` (resultado); todo segmento exceto o atual SHALL ser um link navegável. O segmento "Cotações" SHALL levar à lista de Cotações (`/admin/cotacoes`), não ao Dashboard.

#### Scenario: Breadcrumb na tela de detalhe

- **WHEN** o Comprador abre o detalhe de uma Cotação
- **THEN** a trilha mostra "Cotações › {título da Cotação}", com "Cotações" navegável para a lista e o título da Cotação como segmento atual (não clicável)

#### Scenario: Breadcrumb na tela de resultado

- **WHEN** o Comprador abre o resultado de uma Cotação apurada
- **THEN** a trilha mostra "Cotações › {título da Cotação} › Resultado", com "Cotações" e o título da Cotação navegáveis (o título leva de volta ao detalhe) e "Resultado" como segmento atual

#### Scenario: Breadcrumb não compete por espaço com ações da tela

- **WHEN** a tela de resultado exibe o botão "Baixar XLSX" (ou a tela de detalhe exibe seus botões de transição de estado)
- **THEN** o breadcrumb permanece em sua própria linha, sem quebrar ou se sobrepor a esses botões em nenhuma largura de tela

#### Scenario: "Cotações" leva à lista, não ao Dashboard

- **WHEN** o Comprador clica em "Cotações" no breadcrumb, seja na tela de detalhe ou na tela de resultado
- **THEN** o sistema navega para `/admin/cotacoes` (a lista de Cotações), não para o Dashboard (`/admin`)
