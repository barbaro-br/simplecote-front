## ADDED Requirements

### Requirement: Recotar itens sem vencedor a partir do Resultado

Na tela de Resultado da apuração, quando há itens sem vencedor, o sistema SHALL oferecer a ação "Recotar itens sem vencedor". Ao acioná-la e confirmar, o front SHALL chamar `POST /api/cotacoes/{id}/recotar-sem-vencedor` e, no sucesso, navegar para a nova Cotação (`RASCUNHO`) retornada. Se a resposta trouxer itens omitidos (produto inativado/removido), o sistema SHALL informá-los ao usuário. Erro da API SHALL ser exibido a partir de `ApiError.message`. A ação SHALL aparecer apenas quando a lista de itens sem vencedor não está vazia.

#### Scenario: Ação disponível só com itens sem vencedor

- **WHEN** a tela de Resultado mostra uma apuração com ao menos um item sem vencedor
- **THEN** o botão "Recotar itens sem vencedor" aparece; numa apuração em que todos os itens tiveram vencedor, não aparece

#### Scenario: Recotar cria e abre a nova cotação

- **WHEN** o admin confirma a recotação
- **THEN** o front chama o endpoint e navega para a nova Cotação `RASCUNHO` criada

#### Scenario: Itens omitidos são informados

- **WHEN** a resposta traz produtos omitidos por estarem inativos
- **THEN** o front mostra um aviso listando esses produtos e o motivo, e ainda assim abre a nova cotação
