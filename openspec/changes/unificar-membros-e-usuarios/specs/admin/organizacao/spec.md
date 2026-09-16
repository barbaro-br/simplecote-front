## ADDED Requirements

### Requirement: Criação direta com senha inicial
A tela `/admin/membros` SHALL oferecer, como alternativa ao convite por e-mail, criar um membro diretamente com nome, e-mail, papel (`ADMIN` ou `OPERADOR`, nunca `OWNER`) e uma **senha inicial de pelo menos 8 caracteres**, digitada num campo protegido com um controle de revelar/ocultar. Enquanto o admin digita a senha, a tela SHALL indicar ao vivo se o critério de tamanho mínimo já foi atingido, sem esperar o submit. O formulário SHALL exigir nome e e-mail preenchidos, e-mail válido, um papel escolhido e a senha com o tamanho mínimo; SHALL bloquear o envio enquanto a requisição corre; e SHALL exibir a mensagem de erro do backend junto ao formulário quando a criação for rejeitada (ex.: e-mail já cadastrado). Após o cadastro, a lista SHALL incluir o novo membro como ativo.

#### Scenario: Criação direta válida
- **WHEN** o admin escolhe "criar com senha", preenche nome, e-mail válido, um papel e uma senha com 8+ caracteres, e confirma
- **THEN** o membro é criado como ativo e passa a aparecer na lista

#### Scenario: Senha curta demais
- **WHEN** o admin informa uma senha com menos de 8 caracteres
- **THEN** o formulário aponta o erro e não envia a requisição

#### Scenario: Backend rejeita a criação direta
- **WHEN** o backend responde com erro (por exemplo e-mail já cadastrado)
- **THEN** a mensagem do backend aparece no formulário e nada é adicionado à lista

#### Scenario: Revelar a senha digitada
- **WHEN** o admin aciona o controle de revelar no campo de senha
- **THEN** o campo passa a exibir a senha em texto plano, e acionar de novo volta a mascará-la

#### Scenario: Indicador de tamanho mínimo ao vivo
- **WHEN** o admin digita no campo de senha
- **THEN** um indicador abaixo do campo reflete, a cada tecla, se os 8 caracteres mínimos já foram atingidos, antes de qualquer tentativa de submit

### Requirement: Edição de nome, e-mail e papel de um membro
A tela `/admin/membros` SHALL permitir editar **nome, e-mail e papel** de um membro com status `ATIVO` ou `INATIVO` (conta de `Usuario` já existente, criada por convite aceito ou diretamente), sem campo de senha nesse formulário. As validações de nome e e-mail SHALL valer como na criação, e o erro do backend SHALL aparecer no formulário. Após salvar, a lista SHALL refletir a mudança. O `OWNER` SHALL NOT ter essa ação disponível (ver Requirement "Papel OWNER da conta"). Um convite com status `CONVITE_PENDENTE` (ainda sem conta de `Usuario`) SHALL NOT ter ação de editar.

#### Scenario: Edição salva
- **WHEN** o admin edita um membro `ATIVO`, muda o papel de `OPERADOR` para `ADMIN` e confirma
- **THEN** o membro aparece na lista com o papel `ADMIN`

#### Scenario: Edição sem senha
- **WHEN** o admin abre a edição de um membro
- **THEN** o formulário não tem campo de senha

#### Scenario: Convite pendente não tem ação de editar
- **WHEN** o admin olha a linha de um convite com status `CONVITE_PENDENTE`
- **THEN** não há ação de editar disponível para essa linha

### Requirement: Troca de senha de um membro
A tela `/admin/membros` SHALL oferecer uma ação separada para trocar a senha de um membro com status `ATIVO` ou `INATIVO`, através de um formulário com o campo de nova senha e um campo de confirmação, ambos protegidos e cada um com seu próprio controle de revelar/ocultar. A confirmação SHALL ser feita no cliente — os dois campos precisam ser iguais — e a nova senha SHALL ter pelo menos 8 caracteres antes de a requisição ser enviada. Enquanto o admin digita, a tela SHALL indicar ao vivo (a) se a nova senha já atingiu o tamanho mínimo e (b) se a confirmação já coincide com a nova senha, sem esperar o submit. Um erro do backend SHALL aparecer no formulário. O `OWNER` SHALL NOT ter essa ação disponível para outra pessoa trocar sua senha. Um convite com status `CONVITE_PENDENTE` SHALL NOT ter ação de trocar senha (a pessoa ainda vai definir a própria senha ao aceitar).

#### Scenario: Troca de senha válida
- **WHEN** o admin abre "trocar senha" de um membro, digita a mesma senha (8+ caracteres) nos dois campos e confirma
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

### Requirement: Redirecionamento da rota legada /admin/usuarios
Acessos a `/admin/usuarios` (link salvo, favorito ou navegação direta) SHALL redirecionar para `/admin/membros`, preservando a sessão autenticada. Nenhum conteúdo próprio SHALL ser servido na rota antiga.

#### Scenario: Acesso a rota antiga redireciona
- **WHEN** um usuário autenticado acessa `/admin/usuarios` diretamente (ex.: favorito salvo)
- **THEN** é redirecionado para `/admin/membros` e vê a tela unificada normalmente
