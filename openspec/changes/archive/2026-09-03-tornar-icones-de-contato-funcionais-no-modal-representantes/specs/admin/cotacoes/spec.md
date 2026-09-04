## MODIFIED Requirements

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

Quando a linha de um participante tem e-mail e/ou telefone do representante disponíveis, o sistema SHALL exibir indicadores de e-mail/telefone que são funcionais e mostram o valor real ao passar o mouse (não um texto genérico): o indicador de e-mail SHALL abrir um `mailto:` pré-preenchido para aquele representante; o indicador de telefone SHALL copiar o número formatado para a área de transferência com retorno visual de confirmação.

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

#### Scenario: Indicador de e-mail abre o cliente de e-mail

- **WHEN** o representante de uma Empresa tem e-mail cadastrado e o Comprador clica no indicador de e-mail da linha
- **THEN** abre-se um rascunho `mailto:` endereçado a esse e-mail, com assunto e corpo pré-preenchidos com uma mensagem de convite

#### Scenario: Indicador de telefone copia o número

- **WHEN** o representante de uma Empresa tem WhatsApp/telefone cadastrado e o Comprador clica no indicador de telefone da linha
- **THEN** o número formatado é copiado para a área de transferência e a interface mostra uma confirmação temporária

#### Scenario: Hover revela o valor real

- **WHEN** o Comprador passa o mouse sobre o indicador de e-mail ou de telefone de uma linha
- **THEN** a dica exibida mostra o e-mail ou o telefone formatado real daquele representante, não um texto genérico como "Possui E-mail"
