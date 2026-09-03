## MODIFIED Requirements

### Requirement: Gesto de deslizar para limpar o preço
Em telas de toque, o sistema SHALL permitir arrastar um card de item para a esquerda; ao passar de um limiar (~70px), ao soltar o card o sistema SHALL apagar o preço daquele item. Durante o arrasto, um fundo de "limpar" (com ícone) SHALL aparecer atrás do card. O gesto SHALL ficar disponível apenas quando `podeEditar` é verdadeiro. Apagar o preço por esse gesto tem o mesmo efeito de apagá-lo pelo teclado: o indicador volta para a marca (✗) vermelha e o item é sincronizado como não cotado. Em qualquer um dos dois casos (deslizar ou apagar pelo teclado), quando o campo tinha um preço antes de ser esvaziado, o sistema SHALL exibir um toast "Preço removido" com ação "Desfazer" por alguns segundos (duração fixa, não indefinida); acionar "Desfazer" SHALL restaurar o preço anterior no campo. O toast SHALL usar um identificador único por item, de modo que limpar o preço do mesmo item mais de uma vez em sequência substitua o toast anterior em vez de empilhar vários.

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

#### Scenario: Toast de "Preço removido" some sozinho num tempo curto

- **WHEN** o representante limpa o preço de um item e não interage com o toast
- **THEN** o toast desaparece sozinho após uma duração curta e fixa (poucos segundos), sem persistir indefinidamente nem sobreviver a uma navegação de tela

#### Scenario: Limpar o mesmo item duas vezes não empilha toasts

- **WHEN** o representante limpa o preço de um item, digita um novo preço, e limpa de novo antes do primeiro toast sumir
- **THEN** apenas um toast "Preço removido" fica visível para aquele item, não dois sobrepostos
