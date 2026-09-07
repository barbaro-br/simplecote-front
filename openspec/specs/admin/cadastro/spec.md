# admin/cadastro Specification

## Purpose
Fluxo público pelo qual o dono de um supermercado cria sua própria conta no SimpleCote sem intervenção do time: um formulário anônimo em `/cadastro` que provisiona um `Comprador` novo e isolado, com um slug único (o endereço `<slug>.simplecote.app` da loja), em modo de teste e com um usuário `OWNER`, seguido da verificação de e-mail.

## Requirements

### Requirement: Formulário público de cadastro

O sistema SHALL expor uma rota pública `/cadastro`, fora da área autenticada e sem o shell do painel, com um formulário pedindo **nome do supermercado**, **endereço da loja (slug)**, **e-mail** e **senha**. A senha SHALL ter no mínimo 8 caracteres, num campo protegido com controle de revelar/ocultar e um indicador ao vivo de tamanho mínimo (mesmo padrão de `admin/usuarios`). O formulário SHALL exigir nome e e-mail preenchidos, e-mail válido, a senha no tamanho mínimo e um slug válido e disponível; SHALL bloquear o envio enquanto a requisição corre; e SHALL exibir a mensagem de erro do backend (ex.: e-mail já cadastrado) junto ao formulário, sem derrubar a tela.

#### Scenario: Cadastro válido

- **WHEN** o visitante preenche nome do supermercado, um slug disponível, e-mail válido e senha com 8+ caracteres e confirma
- **THEN** o sistema chama `POST /public/cadastro` e, em sucesso, exibe uma tela de "confira seu e-mail"

#### Scenario: E-mail já cadastrado

- **WHEN** o backend rejeita o cadastro porque o e-mail já existe
- **THEN** a mensagem em pt-BR do backend aparece no formulário e nada muda de tela

#### Scenario: Senha curta demais

- **WHEN** o visitante informa uma senha com menos de 8 caracteres
- **THEN** o formulário aponta o erro e não envia a requisição

### Requirement: Escolha do endereço da loja (slug)

O formulário SHALL derivar uma sugestão de slug a partir do nome do supermercado (minúsculas, sem acento, espaços e símbolos viram hífen — "Supermercado do Zé" → `supermercado-do-ze`) e SHALL exibir a prévia do endereço `<slug>.simplecote.app`. O campo SHALL ser editável e re-normalizado à medida que o visitante digita. O sistema SHALL verificar a disponibilidade do slug com uma chamada *debounced* a `GET /public/compradores/validar-slug?slug=...`, distinguindo os estados **livre**, **em uso** e **reservado** (nomes como `app`, `www`, `api`, `admin`, `login` não são permitidos). O envio do cadastro SHALL ficar bloqueado enquanto o slug estiver vazio, com formato inválido, em uso ou reservado, ou enquanto a verificação estiver em curso.

#### Scenario: Sugestão a partir do nome

- **WHEN** o visitante digita "Supermercado do Zé" no nome
- **THEN** o campo de slug é preenchido com `supermercado-do-ze` e a prévia mostra `supermercado-do-ze.simplecote.app`

#### Scenario: Slug já em uso

- **WHEN** o visitante informa um slug que a verificação retorna como em uso
- **THEN** o formulário indica que o endereço não está disponível e não permite enviar

#### Scenario: Slug reservado

- **WHEN** o visitante tenta usar `admin` (ou outro nome reservado) como slug
- **THEN** o formulário indica que o endereço não é permitido e não permite enviar

#### Scenario: Slug livre

- **WHEN** a verificação retorna o slug como livre e os demais campos são válidos
- **THEN** o botão de enviar fica habilitado

### Requirement: Conta nova nasce isolada, com slug único e em modo de teste

Ao concluir o cadastro, o novo supermercado SHALL corresponder a um `Comprador` próprio, sem acesso a dados de nenhum outro `Comprador`, identificado por um `slug` único, com o usuário criado no papel `OWNER` e a conta em modo de teste (com prazo). O front SHALL NOT permitir escolher ou informar o `Comprador` — ele é criado pelo backend a partir dos dados do formulário; o slug é o único identificador de endereço que o visitante escolhe.

#### Scenario: Primeiro acesso após cadastro

- **WHEN** o dono do supermercado recém-cadastrado faz login pela primeira vez em `<slug>.simplecote.app`
- **THEN** ele entra no painel do seu próprio `Comprador`, vazio de dados de terceiros, como `OWNER`, com a conta marcada como em teste

#### Scenario: Slug fica reservado para a loja

- **WHEN** o cadastro conclui com o slug `supermercado-do-ze`
- **THEN** uma verificação posterior desse mesmo slug por outro visitante retorna "em uso"

### Requirement: Verificação de e-mail

O sistema SHALL expor uma rota pública `/verificar-email` acessada pelo link enviado no e-mail de cadastro (com um token). Ao abrir, o sistema SHALL confirmar o e-mail via API. Em sucesso, SHALL levar o dono ao login da própria loja — `https://<slug>.simplecote.app/login` — com uma mensagem de conta ativada. Quando o token for inválido ou expirado, SHALL exibir uma mensagem clara em pt-BR e um caminho para o login, sem expor um formulário quebrado. O reenvio do e-mail de verificação é follow-up do back (fora do escopo desta change).

#### Scenario: Token de verificação válido

- **WHEN** o dono abre o link de verificação com um token válido
- **THEN** o e-mail é confirmado e a tela leva ao login da loja (`<slug>.simplecote.app/login`) informando que a conta está ativa

#### Scenario: Token inválido ou expirado

- **WHEN** o dono abre um link de verificação inválido ou expirado
- **THEN** a tela exibe uma mensagem clara ("Este link é inválido ou expirou") e um caminho para o login, sem mostrar formulário de senha ou de login quebrado (o reenvio da verificação é follow-up do back)

### Requirement: Entrada para o cadastro a partir do login

A tela `/login` SHALL exibir um link discreto "Criar conta" que leva a `/cadastro`.

#### Scenario: Ir do login para o cadastro

- **WHEN** o visitante está em `/login` e não tem conta
- **THEN** ele encontra e aciona um link "Criar conta" que abre `/cadastro`
