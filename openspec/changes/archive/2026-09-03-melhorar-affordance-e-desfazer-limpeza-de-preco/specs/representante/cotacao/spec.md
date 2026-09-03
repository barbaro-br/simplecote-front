## MODIFIED Requirements

### Requirement: Gesto de deslizar para limpar o preço
Em telas de toque, o sistema SHALL permitir arrastar um card de item para a esquerda; ao passar de um limiar (~70px), ao soltar o card o sistema SHALL apagar o preço daquele item. Durante o arrasto, um fundo de "limpar" (com ícone) SHALL aparecer atrás do card. O gesto SHALL ficar disponível apenas quando `podeEditar` é verdadeiro. Apagar o preço por esse gesto tem o mesmo efeito de apagá-lo pelo teclado: o indicador volta para a marca (✗) vermelha e o item é sincronizado como não cotado. Em qualquer um dos dois casos (deslizar ou apagar pelo teclado), quando o campo tinha um preço antes de ser esvaziado, o sistema SHALL exibir um toast "Preço removido" com ação "Desfazer" por alguns segundos; acionar "Desfazer" SHALL restaurar o preço anterior no campo.

#### Scenario: Deslizar além do limiar limpa o preço
- **WHEN** o representante arrasta um card com preço para a esquerda além do limiar e solta
- **THEN** o preço é apagado, o indicador do card volta para a marca vermelha, o item é sincronizado como não cotado, e um toast "Preço removido" com "Desfazer" aparece

#### Scenario: Deslizar de leve não limpa
- **WHEN** o representante arrasta o card para a esquerda mas solta antes do limiar
- **THEN** o card volta à posição original e o preço é mantido

#### Scenario: Sem gesto em modo somente leitura
- **WHEN** `podeEditar` é falso
- **THEN** arrastar o card não altera o preço

#### Scenario: Desfazer restaura o preço apagado
- **WHEN** o representante aciona "Desfazer" no toast exibido logo após limpar um preço (por deslizar ou pelo teclado)
- **THEN** o campo volta a mostrar o preço anterior e o item volta a ser sincronizado com esse preço

### Requirement: Tutorial de primeira visita
Na primeira vez que o dispositivo abre `/cotacao/:token`, o sistema SHALL exibir um tutorial de onboarding em 3 passos: (1) anatomia do card de produto, (2) os estados do indicador (visto verde com preço / X vermelho sem preço) e que ele é automático, (3) tela final "pronto para começar", com uma **demonstração visual animada** do gesto de deslizar (o mini-card de exemplo desliza para a esquerda e revela o ícone de limpar), não só uma descrição em texto. O tutorial SHALL ter indicador de progresso (pontos), botão "Próximo" / "Entendi, vamos lá!" no último passo, e "Pular tutorial" nos passos anteriores ao último. Depois de concluído ou pulado, o sistema SHALL registrar isso em `localStorage` e não exibir o tutorial de novo naquele dispositivo. O tutorial NÃO SHALL bloquear o carregamento dos dados por trás dele.

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
