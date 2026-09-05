## MODIFIED Requirements

### Requirement: Convidar Empresas
O sistema SHALL permitir acessar a lista de convidados através de uma ação principal no cabeçalho fixo (sticky) da tela de detalhes. O formulário para selecionar uma ou mais Empresas ativas do Comprador e convidá-las para a Cotação (`POST /api/cotacoes/{id}/participantes` com `empresaIds`) SHALL ser exibido em um modal sobreposto, garantindo que o Comprador não perca o contexto da lista de itens, independentemente de quão longa ela seja. O sistema SHALL listar os participantes com seu status de convite e resposta (a partir de `GET /api/cotacoes/{id}/participantes`), permitir convidar novas empresas ou desconvidar participantes existentes (`DELETE /api/participantes/{participanteId}`), reenviar o convite de um participante (`POST /api/participantes/{participanteId}/reenviar-convite`) e compartilhar o link mágico do participante.

O card de cada empresa no modal SHALL seguir a hierarquia visual desenhada:
1. **Controle de Participação (Esquerda)**: Um checkbox acessível de 20px (`size-5`) e sem avatar circular com inicial ao lado.
   - Em cotação aberta (`ABERTA`), o checkbox marcado indica que a empresa participa da cotação. Ao clicar no checkbox marcado de qualquer participante — inclusive aquele já com status `RESPONDIDO` —, o sistema SHALL abrir um diálogo de confirmação informando expressamente que o representante perderá o acesso e os preços já informados não terão validade nesta cotação. Ao confirmar, o sistema SHALL invocar a exclusão do participante via `DELETE /api/participantes/{participanteId}`.
   - Quando desmarcado, clicar no checkbox convida a empresa imediatamente para a cotação aberta (`POST /api/cotacoes/{id}/participantes`).
   - Em rascunho (`RASCUNHO`), o checkbox seleciona/desmarca as empresas a serem convidadas na abertura.
2. **Identificação da Empresa**: Nome da empresa em destaque principal em caixa alta (uppercase/bold) e nome do representante logo abaixo.
3. **Linha de Status e Fechamento**: Posicionada abaixo dos nomes:
   - **Badge de Status**: SHALL refletir três estados de forma clara:
     - `Pendente`: convite ainda não enviado ou com falha de envio.
     - `Enviado`: convite enviado por e-mail ou acessado pelo representante, aguardando conclusão.
     - `Finalizado`: cotação finalizada pelo representante ou pelo admin.
   - **Botão Fechar Cotação**: SHALL ser exibido ao lado do badge de status quando a cotação estiver `ABERTA` e o participante ainda não estiver `Finalizado`. Ao ser acionado, chama `POST /api/participantes/{participanteId}/finalizar`, mudando o status imediatamente para `Finalizado`.
4. **Ações Rápidas (Direita)**: Ícones de ação direta na ordem:
   - **E-mail (E)**: Reenviar convite por e-mail ou abrir mailto.
   - **WhatsApp (W)**: Abrir conversa com mensagem pronta e link mágico (quando telefone disponível).
   - **Copiar Link (C)**: Copiar o link mágico para a área de transferência com toast de retorno.

#### Scenario: Convite de empresas via modal
- **WHEN** o Comprador aciona o botão de "Representantes" no cabeçalho fixo
- **THEN** um modal é aberto exibindo a lista de empresas disponíveis para convite, permitindo a seleção múltipla e envio através de checkboxes diretos

#### Scenario: Cabeçalho sempre visível
- **WHEN** o Comprador rola a lista contendo 200 itens
- **THEN** o cabeçalho com o título da cotação, status, e botões principais de ação (incluindo o acesso aos Representantes) permanece visível no topo da tela

#### Scenario: Reenviar convite
- **WHEN** o Comprador aciona o ícone de e-mail na coluna da direita de um participante
- **THEN** o sistema chama a API de reenvio (`POST /api/participantes/{participanteId}/reenviar-convite`) e reflete o novo status/instante do convite

#### Scenario: Erro de convite é exibido
- **WHEN** a API rejeita o convite (ex.: Empresa sem representante, cotação fora de `RASCUNHO`)
- **THEN** a mensagem `ProblemDetail` do backend é exibida no modal, sem alterar a lista

#### Scenario: Lista de participantes sobrevive a um recarregamento
- **WHEN** o Comprador recarrega a tela de detalhe de uma Cotação que já tem participantes
- **THEN** a lista de participantes e seus status de convite são carregados de `GET /api/cotacoes/{id}/participantes`

#### Scenario: Enviar link por WhatsApp com mensagem pronta
- **WHEN** o Comprador clica no ícone de WhatsApp na coluna da direita de um participante
- **THEN** abre-se uma nova aba em `https://wa.me/` com a mensagem pronta contendo link mágico e dados da cotação

#### Scenario: Enviar link por e-mail com mensagem pronta
- **WHEN** o Comprador aciona "Enviar por e-mail" num participante em rascunho
- **THEN** abre-se um rascunho `mailto:` com assunto e corpo pré-preenchidos com a mesma mensagem

#### Scenario: Copiar link continua disponível como ação secundária
- **WHEN** o Comprador clica no ícone de copiar link na coluna da direita de um participante
- **THEN** o `linkMagico` é escrito na área de transferência e o item mostra retorno visual temporário de confirmação

#### Scenario: Falha real de envio é distinguida de "ainda não enviado"
- **WHEN** o `conviteStatus` de um participante é `FALHOU` e o participante ainda está `CONVIDADO`
- **THEN** o badge exibe o estado `Pendente` com indicação de falha no envio

#### Scenario: Falha de envio some depois que o participante engaja
- **WHEN** um participante com `conviteStatus: FALHOU` passa a `VISUALIZOU` ou `RESPONDIDO`
- **THEN** o badge reflete o novo estado (`Enviado` ou `Finalizado`), sem persistir a mensagem de falha de envio

#### Scenario: Ações de um participante ficam agrupadas num único menu
- **WHEN** o Comprador visualiza a linha de um participante já convidado
- **THEN** as ações rápidas de contato (E-mail, WhatsApp, Copiar link) aparecem alinhadas diretamente na coluna direita do card

#### Scenario: Nome não trunca para um único caractere
- **WHEN** a linha de um participante exibe o badge de status e o botão de fechar cotação
- **THEN** o nome da empresa e o nome do representante continuam legíveis e destacados, sem truncamento indevido

#### Scenario: Indicador de e-mail abre o cliente de e-mail
- **WHEN** o representante de uma Empresa tem e-mail cadastrado em rascunho e o Comprador clica no indicador
- **THEN** abre-se um rascunho `mailto:` endereçado a esse e-mail com a mensagem de convite

#### Scenario: Indicador de telefone copia o número
- **WHEN** o representante de uma Empresa tem WhatsApp/telefone cadastrado em rascunho e o Comprador clica no indicador
- **THEN** o número formatado é copiado para a área de transferência com confirmação temporária

#### Scenario: Hover revela o valor real
- **WHEN** o Comprador passa o mouse sobre o indicador de e-mail ou de telefone de uma linha
- **THEN** a dica exibida mostra o e-mail ou o telefone formatado real daquele representante

#### Scenario: Desconvidar participante em qualquer status (inclusive Respondido)
- **WHEN** o Comprador clica no checkbox marcado de um participante com status `RESPONDIDO` (ou `CONVIDADO`/`VISUALIZOU`) em cotação aberta
- **THEN** o sistema exibe um diálogo de confirmação alertando que o representante perderá o acesso e os preços informados não terão validade; após a confirmação do Comprador, o participante é desconvidado via `DELETE /api/participantes/{participanteId}` e a linha volta a exibir o checkbox desmarcado

#### Scenario: Fechar cotação para o representante através de botão dedicado
- **WHEN** o Comprador clica no botão "Fechar cotação" ao lado do status do participante
- **THEN** o sistema finaliza a resposta do participante via `POST /api/participantes/{participanteId}/finalizar` e o badge passa a exibir "Finalizado"
