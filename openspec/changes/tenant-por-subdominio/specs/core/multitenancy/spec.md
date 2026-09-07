## Purpose

Resolução do `Comprador` da sessão pelo subdomínio `<slug>.simplecote.app`: como o front descobre o slug pelo hostname, como um subdomínio inexistente é tratado, e como o JWT permanece a única autoridade sobre qual inquilino a sessão realmente acessa. A identidade visual antes do login é sempre SimpleCote (ver `identidade-simplecote-e-da-loja`); a da loja só aparece depois de autenticar.

## ADDED Requirements

### Requirement: Slug da loja resolvido pelo hostname

O front SHALL extrair o slug da loja do `hostname` (`<slug>.simplecote.app`) e expô-lo à aplicação por um contexto de tenant. Hosts sem slug de loja — `app.simplecote.app`, o apex `simplecote.app`, `www`, e `localhost` — SHALL ser tratados como "sem loja no endereço", sem erro. O slug do hostname SHALL servir apenas para exibição e roteamento; ele SHALL NOT ser usado como fonte de identidade do inquilino nas chamadas à API (que continuam levando só o JWT).

#### Scenario: Endereço de uma loja

- **WHEN** a aplicação carrega em `supermercado-do-ze.simplecote.app`
- **THEN** o contexto de tenant expõe o slug `supermercado-do-ze`

#### Scenario: Host neutro

- **WHEN** a aplicação carrega em `app.simplecote.app` ou em `localhost`
- **THEN** o contexto de tenant indica "sem loja no endereço", sem erro

### Requirement: Login com identidade SimpleCote, subdomínio inexistente tratado

Em `<slug>.simplecote.app/login`, a tela de login SHALL exibir a identidade SimpleCote (nome "SimpleCote" e mote "Cotações simplificadas"), **sem** branding da loja e **sem** chamar `GET /api/configuracoes` — igual a `app.simplecote.app/login` (ver `identidade-simplecote-e-da-loja`). O front MAY validar o slug do hostname contra o backend para detectar um subdomínio digitado errado; quando o slug não corresponder a nenhuma loja, SHALL exibir uma mensagem clara "esse endereço de loja não existe" com identidade SimpleCote e um link para o site principal, em vez de um formulário de login que só vai falhar.

#### Scenario: Login em um subdomínio de loja

- **WHEN** um visitante abre `supermercado-do-ze.simplecote.app/login` e o slug existe
- **THEN** a tela de login mostra a identidade SimpleCote, sem nome, logo ou cor da loja, e sem chamada a `GET /api/configuracoes`

#### Scenario: Subdomínio inexistente

- **WHEN** um visitante abre `loja-que-nao-existe.simplecote.app`
- **THEN** o front mostra "esse endereço de loja não existe" (com identidade SimpleCote) e um link para o site principal, sem um formulário de login que só falharia

### Requirement: JWT é a autoridade sobre o inquilino

O acesso ao painel autenticado SHALL exigir que o slug do hostname corresponda ao `Comprador` do JWT da sessão. Quando divergirem, o front SHALL NOT renderizar o painel: SHALL redirecionar para o subdomínio correto do `Comprador` do JWT quando esse slug for conhecido, ou encerrar a sessão com um aviso claro quando não for. Trocar o slug na barra de endereço SHALL NOT, em hipótese alguma, dar acesso aos dados de outra loja.

#### Scenario: Slug da URL diverge do JWT

- **WHEN** um usuário autenticado no `Comprador` "loja-a" navega para `loja-b.simplecote.app/admin`
- **THEN** o painel não é exibido; o front leva o usuário de volta para `loja-a.simplecote.app` (ou encerra a sessão com aviso)

#### Scenario: Slug e JWT coincidem

- **WHEN** um usuário autenticado no `Comprador` "loja-a" está em `loja-a.simplecote.app/admin`
- **THEN** o painel é exibido normalmente

### Requirement: Redirecionamentos de entrada preservam a loja

Com sessão ativa em um host neutro (`app.simplecote.app` ou o apex), o front SHALL redirecionar para `<slug>.simplecote.app` do `Comprador` do JWT. Sem sessão em `<slug>.simplecote.app`, o front SHALL exibir a tela de login daquela loja. O logout SHALL manter o usuário no subdomínio da mesma loja (tela de login da loja), não em um host neutro.

#### Scenario: Sessão ativa em host neutro

- **WHEN** um usuário autenticado abre `app.simplecote.app`
- **THEN** é redirecionado para `<slug>.simplecote.app` correspondente ao seu `Comprador`

#### Scenario: Logout permanece na loja

- **WHEN** um usuário em `supermercado-do-ze.simplecote.app/admin` aciona "sair"
- **THEN** vai para `supermercado-do-ze.simplecote.app/login`, não para um host neutro

### Requirement: Rotas públicas por token não dependem do subdomínio

As rotas públicas por token (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`) SHALL funcionar em um host neutro (`app.simplecote.app`), sem exigir o subdomínio da loja — o token já identifica o `Comprador` no backend.

#### Scenario: Link do representante em host neutro

- **WHEN** um representante abre `app.simplecote.app/cotacao/<token>`
- **THEN** a tela da cotação carrega normalmente, com o inquilino resolvido pelo token
