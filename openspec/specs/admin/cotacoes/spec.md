# admin/cotacoes Specification

## Purpose

Interface administrativa do ciclo de vida da Cotação: montar, convidar, abrir, acompanhar as respostas, apurar e ver o resultado. O front exibe e dispara ações; toda regra de estado e apuração é do backend (`simplecote-back/spec.md`).

## Requirements

### Requirement: Lista de cotações por status
O sistema SHALL exibir, no painel, a lista de Cotações do Comprador (`GET /api/cotacoes`) com título, status e prazo, permitindo filtrar por status, e um atalho para criar uma nova Cotação.

#### Scenario: Painel lista as cotações
- **WHEN** o Comprador acessa o painel
- **THEN** as cotações retornadas pela API aparecem com seu status, e o usuário pode filtrar a lista por um status específico

#### Scenario: Atalho para nova cotação
- **WHEN** o Comprador aciona "Nova cotação"
- **THEN** o sistema abre o formulário de criação

### Requirement: Criar e duplicar Cotação

O sistema SHALL permitir criar uma Cotação informando o título (`POST /api/cotacoes`,
nasce em `RASCUNHO`) e SHALL permitir duplicar uma Cotação existente
(`POST /api/cotacoes/{id}/duplicar`, retorna a nova Cotação e a lista de itens
omitidos).

A ação **"Duplicar"** SHALL estar disponível a partir de **dois pontos**: a lista de
Cotações (por linha) e a tela de detalhe de uma Cotação. Ao ser acionada, o sistema
SHALL chamar `POST /api/cotacoes/{id}/duplicar` e, no sucesso, navegar para o detalhe
da Cotação recém-criada (que nasce em `RASCUNHO`).

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

#### Scenario: Duplicar a partir da lista e do detalhe
- **WHEN** o Comprador aciona "Duplicar" numa linha da lista de Cotações OU na tela de detalhe de uma Cotação
- **THEN** em ambos os casos a duplicação é disparada e, no sucesso, o sistema abre o detalhe da Cotação nova

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

### Requirement: Transições de estado com confirmação
O sistema SHALL disparar as transições de estado da Cotação — abrir com `prazo` (`POST /api/cotacoes/{id}/abrir`), encerrar, reabrir, cancelar e apurar — e SHALL exigir um diálogo de confirmação que nomeie a consequência antes de `cancelar` e `apurar` (operações irreversíveis, regra 8 do `spec.md`). O resultado de cada ação SHALL vir do backend; o front não decide se a transição é válida.

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

### Requirement: Correção de lance e reabertura de resposta pelo admin

O sistema SHALL permitir ao Comprador corrigir diretamente o lance de um participante para um item (`PUT /api/participantes/{participanteId}/lances/{itemId}`) e reabrir a resposta de um participante `RESPONDIDO` (`POST /api/participantes/{participanteId}/reabrir`), a partir da tela de detalhe da Cotação. A grade de respostas é lida de `GET /api/cotacoes/{id}/ao-vivo` sem polling (o polling é Fase 2).

#### Scenario: Admin corrige um lance

- **WHEN** o Comprador edita o preço (ou marca não cotado) de um lance de um participante e confirma
- **THEN** o sistema chama a API de correção e a grade de respostas reflete o novo valor

#### Scenario: Admin reabre a resposta de um participante

- **WHEN** o Comprador aciona "Reabrir resposta" num participante `RESPONDIDO`
- **THEN** o sistema chama a API e o participante volta a aparecer como editável pelo representante

### Requirement: Resultado da apuração e pedidos
O sistema SHALL exibir o resultado de uma Cotação apurada (`GET /api/cotacoes/{id}/resultado`): vencedor por item identificado pelo **nome da Empresa** (não do representante), preço da embalagem e preço unitário derivado que já vêm prontos da API. SHALL listar os pedidos gerados (`GET /api/cotacoes/{id}/pedidos`), permitir enviar um pedido (`POST /api/pedidos/{id}/enviar`), baixar o resultado em XLSX (`GET /api/cotacoes/{id}/resultado.xlsx`) e baixar o PDF de um pedido (`GET /api/pedidos/{id}.pdf`).

#### Scenario: Ver resultado com vencedores por empresa
- **WHEN** o Comprador abre o resultado de uma Cotação `PEDIDOS_GERADOS`
- **THEN** cada item mostra o nome da Empresa vencedora e os preços já calculados pelo backend, sem o front recalcular nada

#### Scenario: Enviar um pedido
- **WHEN** o Comprador aciona "Enviar" num pedido da lista
- **THEN** o sistema chama `POST /api/pedidos/{id}/enviar` e o status do pedido na tela é atualizado

#### Scenario: Baixar exportações
- **WHEN** o Comprador aciona "Baixar XLSX" no resultado ou "Baixar PDF" num pedido
- **THEN** o arquivo binário retornado pela API é entregue ao navegador para download

### Requirement: Grade ao vivo da Cotação
O sistema SHALL oferecer, em `/admin/cotacoes/:id/ao-vivo`, uma grade de acompanhamento da Cotação: linhas = itens, colunas = Empresas convidadas, cada célula com o status do lance (`COTADO`/`NAO_COTADO`/`PENDENTE`), o preço da embalagem e o preço unitário derivado que vêm prontos de `GET /api/cotacoes/{id}/ao-vivo`; o menor preço unitário do item SHALL ser destacado. A tela SHALL mostrar a contagem de participantes `RESPONDIDO` sobre o total. O front NÃO SHALL recalcular preço, vencedor ou menor preço — tudo vem da API.

Enquanto a Cotação está `ABERTA`, a grade SHALL atualizar sozinha por polling a cada ~5s; quando a Cotação deixa de estar `ABERTA`, o polling SHALL parar. O polling SHALL pausar quando a aba perde o foco.

Cada célula SHALL permitir ao Comprador corrigir aquele lance a partir da grade (usando o `participanteId` que a célula carrega), abrindo o fluxo de correção de lance sem sair da tela.

#### Scenario: Grade renderiza o estado das células
- **WHEN** o Comprador abre a grade ao vivo de uma Cotação `ABERTA` com itens e Empresas convidadas
- **THEN** cada célula mostra o status do lance daquela Empresa para aquele item, o preço quando `COTADO`, e o menor preço unitário do item aparece destacado; o cabeçalho mostra "respondidos / total"

#### Scenario: Polling liga em ABERTA e desliga fora
- **WHEN** a Cotação está `ABERTA`
- **THEN** a grade revalida sozinha a cada ~5s; e quando a Cotação passa a `ENCERRADA`/`PEDIDOS_GERADOS`/`CANCELADA`, a revalidação automática para

#### Scenario: Corrigir lance pela célula
- **WHEN** o Comprador aciona uma célula da grade
- **THEN** o fluxo de correção de lance abre para aquele `participanteId` e item, e ao confirmar a grade reflete o novo valor

### Requirement: Referência de última compra no hover
O sistema SHALL exibir, ao passar o mouse sobre um item da grade ao vivo, um popover com a **referência de última compra** daquele produto (campos `ultimoPrecoUnitario`, `ultimaCompraEmpresa`, `ultimaCompraEm` da resposta): o preço unitário, a Empresa que venceu e a data (formatada pt-BR / America/Sao_Paulo). Quando o produto nunca foi comprado, o popover SHALL indicar "sem compra anterior". O popover PODE indicar visualmente se o menor preço atual do item está acima ou abaixo dessa referência.

#### Scenario: Item com compra anterior
- **WHEN** o Comprador passa o mouse sobre um item cujo produto já foi comprado numa cotação apurada
- **THEN** o popover mostra o preço unitário da última compra, o nome da Empresa vencedora e a data formatada em pt-BR

#### Scenario: Item sem compra anterior
- **WHEN** o Comprador passa o mouse sobre um item cujo produto nunca foi comprado
- **THEN** o popover indica "sem compra anterior", sem preço nem empresa
