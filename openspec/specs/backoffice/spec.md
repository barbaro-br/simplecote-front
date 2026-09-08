# backoffice Specification

## Purpose
Área interna do dono do SimpleCote, acessível apenas ao papel `SUPER_ADMIN`, para administrar os `Comprador` do SaaS: listar contas, ver o estado da assinatura e do uso, suspender ou reativar, resetar a senha de um admin travado e entrar no painel de um cliente em modo suporte (impersonação auditada).

## Requirements

### Requirement: Acesso restrito ao papel SUPER_ADMIN

O sistema SHALL expor uma árvore de rotas `/backoffice/**` separada do painel do cliente (`/admin/**`) e da área pública. O acesso SHALL exigir sessão autenticada **e** papel `SUPER_ADMIN`. Uma sessão sem esse papel (ou sem sessão) SHALL receber uma resposta de "não encontrado", sem revelar que a área existe e sem redirecionar para uma tela de login específica do backoffice.

#### Scenario: Usuário comum tenta acessar o backoffice

- **WHEN** um usuário `OWNER`/`ADMIN` de um `Comprador` navega para `/backoffice`
- **THEN** vê uma tela de "não encontrado", sem qualquer indício de uma área administrativa

#### Scenario: SUPER_ADMIN acessa o backoffice

- **WHEN** um usuário com papel `SUPER_ADMIN` navega para `/backoffice`
- **THEN** vê a lista de compradores

### Requirement: Lista de compradores

O backoffice SHALL listar todos os `Comprador`, cada um com nome, plano, estado da assinatura (`TESTE`/`ATIVA`/`INADIMPLENTE`/`CANCELADA`), data de criação, último acesso e contadores de uso. A lista SHALL permitir filtrar por estado da assinatura — com os inadimplentes destacados — e buscar por nome ou e-mail. SHALL ter estados de carregamento, vazio e erro que não derrubam a tela.

#### Scenario: Filtrar por inadimplentes

- **WHEN** o `SUPER_ADMIN` filtra a lista por assinatura `INADIMPLENTE`
- **THEN** vê apenas os compradores nesse estado, destacados

#### Scenario: Buscar por e-mail

- **WHEN** o `SUPER_ADMIN` busca pelo e-mail de um dono
- **THEN** a lista mostra o `Comprador` correspondente

### Requirement: Administrar um comprador

A tela de detalhe de um `Comprador` SHALL mostrar seus dados e uso e oferecer as ações **suspender**, **reativar** e **resetar a senha de um admin** daquele `Comprador`. Cada ação SHALL passar por um diálogo de confirmação que nomeia a consequência, SHALL exibir a mensagem de erro do backend quando recusada, e a tela SHALL refletir o novo estado ao concluir.

#### Scenario: Suspender uma conta

- **WHEN** o `SUPER_ADMIN` aciona "suspender" e confirma no diálogo
- **THEN** a conta passa a suspensa, e o detalhe reflete o novo estado

#### Scenario: Resetar a senha de um admin

- **WHEN** o `SUPER_ADMIN` aciona "resetar senha" para um admin do `Comprador` e confirma
- **THEN** o backend gera a redefinição (senha temporária ou e-mail de redefinição) e a tela confirma a ação

#### Scenario: Ação recusada pelo backend

- **WHEN** o backend recusa uma ação administrativa
- **THEN** a mensagem em pt-BR do backend aparece na tela e o estado não muda

### Requirement: Entrar como suporte (impersonação)

O backoffice SHALL permitir "entrar como suporte" no painel de um `Comprador`. A ação SHALL exigir um motivo, SHALL trocar a sessão por um token de suporte com escopo daquele `Comprador` (emitido pelo backend, marcado como impersonação e com expiração curta), e SHALL abrir o `/admin` daquele cliente. Durante o modo suporte, o painel SHALL exibir uma tarja permanente identificando o `Comprador` impersonado e um botão "sair do modo suporte" que restaura a sessão de `SUPER_ADMIN`.

#### Scenario: Iniciar o modo suporte

- **WHEN** o `SUPER_ADMIN` aciona "entrar como suporte", informa o motivo e confirma
- **THEN** o painel do `Comprador` abre com a tarja "Modo suporte — <nome do comprador>" visível

#### Scenario: Sair do modo suporte

- **WHEN** o usuário em modo suporte aciona "sair do modo suporte"
- **THEN** a sessão volta a ser a de `SUPER_ADMIN` e o backoffice reaparece

#### Scenario: Motivo é obrigatório

- **WHEN** o `SUPER_ADMIN` tenta iniciar o modo suporte sem informar um motivo
- **THEN** a ação não é enviada e o campo de motivo é apontado como obrigatório

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
