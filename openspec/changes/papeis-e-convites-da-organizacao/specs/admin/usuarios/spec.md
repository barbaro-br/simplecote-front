## ADDED Requirements

### Requirement: Papel OWNER na gestão de usuários

A tela `/admin/usuarios` SHALL exibir também o usuário `OWNER` do `Comprador` na listagem, com marcação visual do papel. Esta tela SHALL NOT oferecer, para o `OWNER`, as ações de edição de papel, troca de senha por outro usuário ou inativação, e SHALL NOT permitir criar um usuário no papel `OWNER` (os papéis criáveis aqui continuam sendo `ADMIN` e `OPERADOR`). O cadastro de `ADMIN`/`OPERADOR` com senha inicial permanece inalterado.

#### Scenario: OWNER aparece protegido na listagem

- **WHEN** um `ADMIN` abre `/admin/usuarios`
- **THEN** o `OWNER` aparece na lista com o papel marcado e sem as ações de editar papel, trocar senha ou inativar

#### Scenario: OWNER não é um papel criável

- **WHEN** um `ADMIN` abre o formulário de cadastro de usuário
- **THEN** as opções de papel são `ADMIN` e `OPERADOR`, sem `OWNER`
