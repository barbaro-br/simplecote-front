## MODIFIED Requirements

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
