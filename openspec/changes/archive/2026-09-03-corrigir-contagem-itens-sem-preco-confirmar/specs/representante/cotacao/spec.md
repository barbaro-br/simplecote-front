## MODIFIED Requirements

### Requirement: Confirmação antes de enviar a resposta
Ao acionar "Finalizar", o sistema SHALL abrir um modal "Enviar cotação?" antes de chamar a API. Quando houver itens sem preço, o modal SHALL exibir um aviso destacado com a contagem de itens que serão **enviados sem preço / em branco** (com concordância singular/plural). Quando todos os itens tiverem preço, o modal SHALL informar que todos os itens estão preenchidos. O modal SHALL ter ações "Cancelar" (fecha sem enviar) e "Confirmar" (dispara o `POST /public/cotacoes/:token/finalizar`). O modal SHALL usar o componente de diálogo compartilhado do projeto. A contagem de itens sem preço SHALL refletir as edições que o representante já fez nesta visita mesmo que uma atualização de dados em segundo plano (ex.: refoco da aba) chegue enquanto uma edição ainda está sendo salva — uma resposta da API SHALL só preencher a contagem local para itens que o representante ainda não tocou, nunca sobrescrever o estado de um item já editado nesta visita.

#### Scenario: Aviso de itens em branco
- **WHEN** o representante aciona "Finalizar" com 3 itens sem preço
- **THEN** o modal aparece com o aviso "3 itens sem preço serão enviados em branco" e o `POST` ainda não foi chamado

#### Scenario: Confirmar envia
- **WHEN** o representante toca em "Confirmar" no modal
- **THEN** o sistema chama `POST /public/cotacoes/:token/finalizar`

#### Scenario: Cancelar não envia
- **WHEN** o representante toca em "Cancelar" ou fecha o modal
- **THEN** nenhuma chamada de finalização é feita e a tela volta ao estado anterior

#### Scenario: Todos os itens preenchidos
- **WHEN** o representante aciona "Finalizar" com todos os itens com preço
- **THEN** o modal informa que todos os itens estão preenchidos, sem aviso de itens em branco

#### Scenario: Contagem não retrocede após atualização em segundo plano

- **WHEN** o representante preenche o preço de um item e, antes ou depois do autosave desse item completar, uma atualização de dados em segundo plano traz um snapshot da API (ex.: a aba reganha foco e o React Query refaz o fetch)
- **THEN** esse item continua contando como "com preço" na tela e no modal de confirmação — a atualização em segundo plano não reverte a contagem local para um item que o representante já editou
