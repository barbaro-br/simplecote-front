## MODIFIED Requirements

### Requirement: Convidar Empresas e Gerenciar Links
O sistema SHALL permitir acessar a lista de representantes/empresas através de uma ação principal no cabeçalho fixo (sticky) da tela de detalhes. O comportamento deste modal SHALL mudar de acordo com o status da Cotação:
- Quando em `RASCUNHO`: O modal SHALL exibir apenas a lista de empresas ativas com checkboxes para seleção e um botão de "Abrir Cotação" ou salvar, ocultando abas de status de envio.
- Quando `ABERTA`: O modal SHALL focar no compartilhamento de links mágicos. Ele lista as empresas convidadas, sem checkboxes ou barra de busca (simplificação visual). Para cada participante, SHALL disponibilizar botões puramente iconográficos para as ações de compartilhamento. O modal SHALL também exibir uma ação global para "Disparar Todos por E-mail".
O sistema SHALL listar os participantes com seu status de convite (a partir de `GET /api/cotacoes/{id}/participantes`), reenviar o convite de um participante (`POST /api/participantes/{participanteId}/reenviar-convite`) e compartilhar o link mágico do participante.

O compartilhamento do link mágico SHALL oferecer três formas, com o link e uma mensagem amigável já montados pelo front:
- **WhatsApp**: Um botão iconográfico que SHALL abrir `https://wa.me/` numa nova aba com o parâmetro `text` contendo a mensagem (ver regras de template e telefone).
- **Copiar Link**: Um botão iconográfico. Ao clicar, o sistema SHALL copiar o link para a área de transferência do usuário e SHALL emitir um feedback visual não-bloqueante (Toast) informando o sucesso da ação.
- **E-mail (Lote)**: Uma ação global que, futuramente, disparará os convites via provedor externo. Atualmente SHALL exibir um Toast de "Simulação de disparo via e-mail".

#### Scenario: Abrir Modal de Representantes no Rascunho
- **WHEN** a Cotação está em `RASCUNHO` e o Comprador clica em "Representantes"
- **THEN** o modal abre exibindo uma lista simples de empresas com checkboxes para seleção de convidados, sem exibir abas de "Enviado/Não Enviado".

#### Scenario: Copiar Link de um Representante Convidado
- **WHEN** a Cotação está `ABERTA` e o usuário clica no ícone de "Copiar Link" para um representante
- **THEN** o sistema copia o link e exibe um Toast confirmando a cópia ("Link copiado para a área de transferência"), sem texto desnecessário no botão.

#### Scenario: Disparar e-mail em lote
- **WHEN** a Cotação está `ABERTA` e o usuário clica em "Disparar Todos por E-mail"
- **THEN** o sistema exibe um Toast indicando que o disparo em lote foi simulado.
