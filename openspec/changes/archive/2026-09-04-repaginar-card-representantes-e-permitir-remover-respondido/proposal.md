## Why

Durante a operação da cotação na Grade ao Vivo, o comprador precisa remover representantes da cotação de forma simples e direta, inclusive aqueles que já finalizaram a resposta (`RESPONDIDO`), garantindo que seus lances sejam desconsiderados e os itens recalculados sem a sua participação. Além disso, o layout atual do modal de representantes apresenta um checkbox pequeno, um avatar circular com iniciais desnecessário, status aglomerados e ações de finalização pouco intuitivas, demandando uma repaginação fiel ao wireframe operacional desenhado pelo usuário.

## What Changes

- **Substituição do avatar e ampliação do checkbox de participação**: Remove o avatar circular com iniciais (`A`, `E`, `M`, etc.) e posiciona um checkbox direto, visível e acessível à esquerda de cada empresa/representante.
- **Permissão de remoção/desconvite de participante já `RESPONDIDO`**: Permite desmarcar o checkbox de qualquer participante convidado (inclusive com status `RESPONDIDO`). Ao desmarcar, abre diálogo de confirmação alertando que a empresa perderá o acesso e os preços já cotados por ela não terão validade nesta cotação. Ao confirmar, executa o desconvite (`DELETE /api/participantes/:id`).
- **Hierarquia visual de identificação**: Nome da empresa em destaque principal em caixa alta (`ATACADAO CENTRAL`) com o nome do representante logo abaixo (`FRANCISCO ALMEIDA`).
- **Linha dedicada de Status e Fechamento**:
  - Badge de status padronizado em 3 estados claros: `Pendente` (não enviado ou falha), `Enviado` (convite entregue / visualizado aguardando resposta) e `Finalizado` (resposta concluída).
  - Botão explícito com texto `[ Fechar cotação ]` (ou `[ Fechar c. ]`) posicionado ao lado do badge para que o admin possa finalizar a resposta em nome do representante quando a cotação estiver aberta.
- **Reorganização das ações rápidas à direita**: Ícones verticais ordenados conforme o wireframe: E-mail (**E** / reenviar convite), WhatsApp (**W** / abrir conversa com link) e Copiar link (**C** / copiar link mágico).

## Capabilities

### Modified Capabilities
- `admin/cotacoes`: Modifica os requisitos de exibição e interação do modal de Representantes Convidados (`RepresentantesModal`), tornando o checkbox de remoção acessível para participantes em qualquer status (incluindo `RESPONDIDO`), repaginando a estrutura dos cards (remoção de avatar, destaque do nome da empresa, linha com badge de 3 estados e botão explícito "Fechar cotação", e reordenação das ações de contato).

## Impact

- Código afetado: `src/admin/cotacoes/RepresentantesModal.tsx` e `src/admin/cotacoes/RepresentantesModal.test.tsx`.
- Contrato da API / Backend: o front passa a enviar `DELETE /api/participantes/:id` também para participantes com status `RESPONDIDO`. No repositório irmão `simplecote-back`, o serviço `ParticipanteService.desconvidar` deve ser alinhado para retirar a trava que bloqueava participantes `RESPONDIDO`, permitindo a exclusão em cascata de seus lances.
