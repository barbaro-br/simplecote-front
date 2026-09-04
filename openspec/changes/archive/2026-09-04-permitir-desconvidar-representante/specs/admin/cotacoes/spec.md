## ADDED Requirements

### Requirement: Desconvidar um representante

O modal "Representantes" SHALL reaproveitar, também quando a Cotação está `ABERTA`, o círculo de marcação já usado à esquerda do avatar no modo `RASCUNHO` (menor nesse contexto que no modo `RASCUNHO`) — marcado quando o participante já existe (foi convidado), desmarcado quando ainda não. Clicar num círculo desmarcado SHALL convidar a empresa (mesmo efeito do botão "Convidar" que este requirement substitui). Clicar num círculo marcado de um participante que NÃO está `Respondido` SHALL remover o participante da Cotação (`DELETE /api/participantes/{id}`), após confirmação explícita — mesmo padrão do diálogo "Excluir Cotação" já usado em `CotacoesPage`, nomeando a consequência: o representante e qualquer preço que ele tenha preenchido serão removidos, sem volta. Quando o participante está `Respondido`, o círculo SHALL aparecer marcado mas NÃO SHALL ser clicável.

#### Scenario: Marcar um círculo desmarcado convida a empresa

- **WHEN** o Comprador clica no círculo desmarcado de uma empresa ainda não convidada, numa Cotação `ABERTA`
- **THEN** o sistema chama a API de convidar e o círculo passa a aparecer marcado

#### Scenario: Desmarcar o círculo de um participante Convidado pede confirmação e desconvida

- **WHEN** o Comprador clica no círculo marcado de um participante `Convidado`, confirma no diálogo
- **THEN** o sistema chama `DELETE /api/participantes/{id}` e o participante deixa de aparecer na lista de convidados

#### Scenario: Desmarcar o círculo de um participante Visualizou pede confirmação e desconvida

- **WHEN** o Comprador clica no círculo marcado de um participante `Visualizou` (com ou sem preços já preenchidos), confirma no diálogo
- **THEN** o sistema chama a API e o participante deixa de aparecer na lista de convidados

#### Scenario: Círculo de um participante Respondido não é clicável

- **WHEN** o Comprador visualiza o card de um participante `Respondido`
- **THEN** o círculo aparece marcado, mas clicar nele não dispara nenhuma ação

#### Scenario: Desconvidar exige confirmação explícita

- **WHEN** o Comprador clica no círculo marcado de um participante que não é `Respondido`
- **THEN** um diálogo nomeia a consequência (remoção definitiva do representante e de qualquer preço preenchido) antes de a API ser chamada

#### Scenario: Erro do backend é exibido sem remover a linha

- **WHEN** a API rejeita a remoção (ex.: o participante já finalizou a resposta entre o card carregar e o Comprador confirmar)
- **THEN** a mensagem de erro é exibida e o participante continua na lista, com o círculo ainda marcado
