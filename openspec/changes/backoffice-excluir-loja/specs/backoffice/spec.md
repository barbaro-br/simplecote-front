## ADDED Requirements

### Requirement: Excluir uma loja pelo detalhe

O detalhe de um comprador no backoffice SHALL oferecer uma ação de exclusão permanente, separada e sinalizada como destrutiva ("zona de perigo"), que nomeia a consequência (apaga todos os dados da loja, sem carência). A ação SHALL exigir confirmação forte: o operador digita o `slug` exato da loja e o botão de excluir fica inativo enquanto o texto não corresponder. Ao confirmar, o front SHALL chamar `POST /api/admin/compradores/{id}/excluir`; em sucesso volta para a lista com um aviso e a loja não aparece mais; em erro exibe a mensagem do backend na própria tela, sem sair do detalhe.

#### Scenario: Confirmação por slug

- **WHEN** o operador abre a exclusão de uma loja e digita um texto diferente do `slug`
- **THEN** o botão de excluir permanece inativo

#### Scenario: Exclusão confirmada

- **WHEN** o operador digita o `slug` exato e confirma
- **THEN** o front chama a exclusão, navega de volta para a lista e mostra um aviso de que a loja foi excluída

#### Scenario: Erro do backend

- **WHEN** a chamada de exclusão falha
- **THEN** a mensagem de erro do backend aparece no detalhe e a loja continua na lista

### Requirement: Entrada do backoffice sem sessão vai ao login

Ao acessar o host do backoffice (`backoffice.simplecote.app`) sem sessão, o `/` SHALL levar ao `/login` (identidade SimpleCote), não à home institucional. Os hosts de marketing e de loja não mudam.

#### Scenario: Host do backoffice sem sessão

- **WHEN** um visitante sem sessão abre `backoffice.simplecote.app`
- **THEN** vê a tela de login do SimpleCote, não a home de marketing
