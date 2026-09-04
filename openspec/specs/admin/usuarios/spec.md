# admin/usuarios Specification

## Purpose

Tela do painel do admin para gerir os usuários que acessam o próprio painel — os papéis ADMIN e OPERADOR: listar, criar com uma senha inicial, corrigir nome/e-mail/papel, trocar a senha de alguém e inativar. É a única forma pela UI de administrar quem entra no sistema.

## Requirements

### Requirement: Listagem de usuários

A rota `/admin/usuarios` (dentro do painel autenticado) SHALL exibir a lista de todos os usuários do comprador, **incluindo os inativos**, cada um com nome, e-mail, papel (ADMIN ou OPERADOR, com marcação visual) e uma marcação quando estiver inativo. A tela SHALL ter os estados de carregamento, vazio e erro, sem que a falha derrube o layout do painel.

#### Scenario: Lista com papéis e status

- **WHEN** o admin abre `/admin/usuarios` e existem usuários ADMIN e OPERADOR, alguns inativos
- **THEN** todos aparecem com nome, e-mail, o papel identificado, e os inativos marcados como tal

#### Scenario: Falha ao carregar

- **WHEN** a busca da lista falha
- **THEN** a tela mostra a mensagem de erro e o painel continua navegável

### Requirement: Cadastro de usuário

A tela SHALL permitir criar um usuário com nome, e-mail, papel (ADMIN ou OPERADOR) e uma **senha inicial de pelo menos 8 caracteres**, digitada num campo protegido com um controle de revelar/ocultar (alternando entre texto mascarado e visível). Enquanto o admin digita a senha, a tela SHALL indicar ao vivo se o critério de tamanho mínimo já foi atingido, sem esperar o submit. O formulário SHALL exigir nome e e-mail preenchidos, e-mail válido, um papel escolhido e a senha com o tamanho mínimo; SHALL bloquear o envio enquanto a requisição corre; e SHALL exibir a mensagem de erro do backend junto ao formulário quando a criação for rejeitada. Após o cadastro, a lista SHALL incluir o novo usuário.

#### Scenario: Cadastro válido

- **WHEN** o admin preenche nome, e-mail válido, escolhe um papel e informa uma senha com 8+ caracteres, e confirma
- **THEN** o usuário é criado e passa a aparecer na lista

#### Scenario: Senha curta demais

- **WHEN** o admin informa uma senha com menos de 8 caracteres
- **THEN** o formulário aponta o erro e não envia a requisição

#### Scenario: Backend rejeita

- **WHEN** o backend responde com erro (por exemplo e-mail já cadastrado)
- **THEN** a mensagem do backend aparece no formulário e nada é adicionado à lista

#### Scenario: Revelar a senha digitada

- **WHEN** o admin aciona o controle de revelar no campo de senha
- **THEN** o campo passa a exibir a senha em texto plano, e acionar de novo volta a mascará-la

#### Scenario: Indicador de tamanho mínimo ao vivo

- **WHEN** o admin digita no campo de senha
- **THEN** um indicador abaixo do campo reflete, a cada tecla, se os 8 caracteres mínimos já foram atingidos, antes de qualquer tentativa de submit

### Requirement: Edição de nome, e-mail e papel

A tela SHALL permitir editar **nome, e-mail e papel** de um usuário existente, sem campo de senha nesse formulário. As validações de nome e e-mail SHALL valer como no cadastro, e o erro do backend SHALL aparecer no formulário. Após salvar, a lista SHALL refletir a mudança.

#### Scenario: Edição salva

- **WHEN** o admin edita um usuário, muda o papel de OPERADOR para ADMIN e confirma
- **THEN** o usuário aparece na lista com o papel ADMIN

#### Scenario: Edição sem senha

- **WHEN** o admin abre a edição de um usuário
- **THEN** o formulário não tem campo de senha

### Requirement: Troca de senha de um usuário

A tela SHALL oferecer uma ação separada para trocar a senha de um usuário, através de um formulário com o campo de nova senha e um campo de confirmação, ambos protegidos e cada um com seu próprio controle de revelar/ocultar. A confirmação SHALL ser feita no cliente — os dois campos precisam ser iguais — e a nova senha SHALL ter pelo menos 8 caracteres antes de a requisição ser enviada. Enquanto o admin digita, a tela SHALL indicar ao vivo (a) se a nova senha já atingiu o tamanho mínimo e (b) se a confirmação já coincide com a nova senha, sem esperar o submit. Um erro do backend SHALL aparecer no formulário.

#### Scenario: Troca de senha válida

- **WHEN** o admin abre "trocar senha" de um usuário, digita a mesma senha (8+ caracteres) nos dois campos e confirma
- **THEN** a requisição de troca de senha é enviada e a ação se conclui com sucesso

#### Scenario: Confirmação não bate

- **WHEN** o admin digita senhas diferentes nos dois campos
- **THEN** o formulário aponta a divergência e não envia a requisição

#### Scenario: Revelar a nova senha e a confirmação independentemente

- **WHEN** o admin aciona o controle de revelar em "Nova senha" ou em "Confirmar senha"
- **THEN** só o campo acionado alterna para texto visível, o outro continua mascarado até ser acionado também

#### Scenario: Indicadores ao vivo de tamanho e coincidência

- **WHEN** o admin digita a nova senha e depois a confirmação
- **THEN** um indicador reflete o tamanho mínimo da nova senha, e outro reflete se a confirmação já coincide com ela, ambos atualizados a cada tecla, antes de qualquer tentativa de submit

### Requirement: Inativação de usuário

A tela SHALL permitir inativar um usuário, com confirmação antes de efetivar; a lista passa a mostrá-lo como inativo. A tela SHALL **não** oferecer reativação (o backend não expõe essa operação).

#### Scenario: Inativar com confirmação

- **WHEN** o admin aciona "inativar" num usuário e confirma
- **THEN** o usuário passa a constar como inativo na lista

#### Scenario: Sem opção de reativar

- **WHEN** o admin olha um usuário já inativo
- **THEN** não há ação de reativar disponível na tela
