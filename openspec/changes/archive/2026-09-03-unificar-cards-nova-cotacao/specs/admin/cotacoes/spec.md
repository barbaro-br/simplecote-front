## MODIFIED Requirements

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
ação acompanham o modo escolhido. Ao ser acionada, o sistema SHALL chamar
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

#### Scenario: Formulário de Nova Cotação alterna entre os dois modos num único card

- **WHEN** o Comprador abre "Nova Cotação" e alterna entre "Em branco" e "Duplicar existente"
- **THEN** o campo relevante ao modo muda (Título, ou a seleção de cotação de origem), dentro do mesmo card, sem navegar pra outra tela nem exibir os dois formulários simultaneamente

#### Scenario: Duplicar a partir da lista e do detalhe

- **WHEN** o Comprador vê uma linha da lista de Cotações, ou está na tela de detalhe de uma Cotação
- **THEN** nenhum controle de "Duplicar" é exibido em nenhum dos dois lugares — a única forma de duplicar é pelo formulário de Nova Cotação (isso substitui o comportamento anterior, em que "Duplicar" também estava disponível nesses dois pontos)
