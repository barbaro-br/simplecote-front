## ADDED Requirements

### Requirement: Status de verificação e reenvio no detalhe da loja

Na seção de administradores do detalhe de uma loja, o backoffice SHALL mostrar, para cada admin, se o e-mail está verificado. Para um admin não verificado, SHALL exibir um botão "Reenviar verificação" que chama `POST /api/admin/compradores/{id}/reenviar-verificacao` e, em sucesso, mostra uma confirmação. Quando todos os admins estão verificados, nenhum botão de reenvio SHALL aparecer.

#### Scenario: Reenviar para um OWNER não verificado

- **WHEN** o detalhe mostra um admin com e-mail não verificado e o operador clica em "Reenviar verificação"
- **THEN** o front chama `POST /api/admin/compradores/{id}/reenviar-verificacao` e exibe "E-mail de verificação reenviado"

#### Scenario: Sem botão quando tudo verificado

- **WHEN** todos os admins da loja estão com o e-mail verificado
- **THEN** o detalhe não mostra nenhum botão de reenvio
