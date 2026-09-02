## Purpose

Permite que um usuário ADMIN/OPERADOR redefina a própria senha sem depender de outro admin, via link enviado por e-mail — necessário para produção, quando o dono da loja for o único usuário e não houver mais um admin "por trás" para resetar manualmente.

## ADDED Requirements

### Requirement: Solicitar redefinição de senha

A tela de login SHALL oferecer um link "Esqueci minha senha" levando a um formulário onde o usuário informa o e-mail. Ao enviar, o sistema SHALL sempre exibir uma confirmação genérica de que, se o e-mail existir na base, um link de redefinição foi enviado — SHALL NOT revelar se o e-mail existe ou não.

#### Scenario: Solicitação com e-mail existente

- **WHEN** o usuário informa um e-mail cadastrado e confirma
- **THEN** o sistema exibe a mensagem genérica de confirmação, e um e-mail com link de redefinição é enviado

#### Scenario: Solicitação com e-mail não cadastrado

- **WHEN** o usuário informa um e-mail não cadastrado e confirma
- **THEN** o sistema exibe a mesma mensagem genérica de confirmação, sem indicar que o e-mail não existe

### Requirement: Redefinir senha via link

O sistema SHALL oferecer uma tela, acessada pelo link recebido por e-mail (com um token), onde o usuário define uma nova senha (mínimo 8 caracteres) com campo de confirmação — mesma validação já usada na troca de senha admin-assistida (`admin/usuarios`). Ao efetivar com sucesso, o sistema SHALL permitir login imediato com a nova senha. Quando o token for inválido ou expirado, a tela SHALL exibir uma mensagem clara em vez de expor um formulário quebrado.

#### Scenario: Redefinição com token válido

- **WHEN** o usuário abre o link recebido, informa a mesma nova senha (8+ caracteres) nos dois campos e confirma
- **THEN** a senha é redefinida e o usuário consegue logar com ela

#### Scenario: Token inválido ou expirado

- **WHEN** o usuário abre um link de redefinição inválido ou expirado
- **THEN** a tela exibe uma mensagem clara explicando que o link não é mais válido, sem expor o formulário de nova senha

#### Scenario: Confirmação de senha não bate

- **WHEN** o usuário digita senhas diferentes nos dois campos
- **THEN** o formulário aponta a divergência e não envia a requisição
