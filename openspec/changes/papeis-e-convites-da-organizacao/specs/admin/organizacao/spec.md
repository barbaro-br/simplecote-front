## Purpose

Gestão dos membros que acessam o painel de um `Comprador`: o papel `OWNER` de quem criou a conta, o convite de novas pessoas por e-mail com aceite e definição de senha, o reenvio e a revogação de convites, e a restrição das áreas sensíveis (cobrança, gestão de membros) por papel.

## ADDED Requirements

### Requirement: Papel OWNER da conta

Cada `Comprador` SHALL ter exatamente um usuário no papel `OWNER` — o criado no cadastro público. Na gestão de membros, o `OWNER` SHALL ser identificável e SHALL NOT ter ações de rebaixamento de papel ou de inativação disponíveis para outros usuários. Nenhuma tela SHALL oferecer a criação de um segundo `OWNER`.

#### Scenario: OWNER sem ações destrutivas

- **WHEN** um `ADMIN` abre a gestão de membros e olha a linha do `OWNER`
- **THEN** não há opção de mudar o papel do `OWNER` nem de inativá-lo

#### Scenario: Não há como criar outro OWNER

- **WHEN** um usuário convida um novo membro ou cria um usuário
- **THEN** os papéis oferecidos são `ADMIN` e `OPERADOR`, nunca `OWNER`

### Requirement: Listagem de membros

A rota `/admin/membros` SHALL listar os membros do `Comprador` com nome, e-mail, papel (`OWNER`/`ADMIN`/`OPERADOR`) e status (ativo, inativo ou convite pendente). SHALL ter estados de carregamento, vazio e erro que não derrubam o painel.

#### Scenario: Lista com papéis e status

- **WHEN** o `OWNER` ou um `ADMIN` abre `/admin/membros` com membros ativos, inativos e convites pendentes
- **THEN** todos aparecem com nome, e-mail, papel identificado e o status correspondente

### Requirement: Convidar membro por e-mail

A tela SHALL permitir convidar uma pessoa informando e-mail e papel (`ADMIN` ou `OPERADOR`). Ao enviar, SHALL chamar `POST /api/organizacao/convites`; em sucesso, o convite aparece na lista como pendente. SHALL exibir a mensagem de erro do backend (ex.: e-mail já é membro) junto ao formulário.

#### Scenario: Convite enviado

- **WHEN** um `ADMIN` informa um e-mail válido, escolhe o papel `OPERADOR` e confirma
- **THEN** o convite é criado, a pessoa recebe o e-mail e a lista mostra o convite como pendente

#### Scenario: E-mail já é membro

- **WHEN** o e-mail convidado já pertence a um membro do `Comprador`
- **THEN** a mensagem do backend aparece no formulário e nenhum convite é criado

### Requirement: Aceitar convite definindo a senha

O sistema SHALL expor uma rota pública `/convite/:token` onde a pessoa convidada vê o `Comprador` e o papel do convite e define a própria senha (mínimo 8 caracteres, com revelar/ocultar e indicador ao vivo). Ao concluir, SHALL ficar vinculada ao `Comprador` no papel do convite e SHALL poder entrar no painel. Token inválido ou expirado SHALL mostrar uma mensagem clara, sem formulário quebrado.

#### Scenario: Aceite com token válido

- **WHEN** a pessoa abre o link do convite, define uma senha de 8+ caracteres e confirma
- **THEN** a conta dela é criada no papel do convite e ela consegue logar no painel daquele `Comprador`

#### Scenario: Token de convite inválido ou expirado

- **WHEN** a pessoa abre um link de convite inválido ou expirado
- **THEN** a tela exibe uma mensagem clara, sem expor o formulário de senha

### Requirement: Reenviar, revogar e remover

A tela SHALL permitir reenviar e revogar um convite pendente, e inativar/remover um membro que não seja o `OWNER`. Cada ação destrutiva (revogar, remover) SHALL passar por confirmação que nomeia a consequência, e SHALL refletir o novo estado na lista ao concluir.

#### Scenario: Revogar um convite pendente

- **WHEN** um `ADMIN` revoga um convite pendente e confirma
- **THEN** o convite some da lista e o link enviado deixa de funcionar

#### Scenario: Reenviar um convite

- **WHEN** um `ADMIN` aciona "reenviar" num convite pendente
- **THEN** o backend dispara o e-mail de novo e a tela confirma

### Requirement: Áreas sensíveis restritas por papel

As áreas "Membros" (`/admin/membros`) e "Plano & cobrança" SHALL ser visíveis e acessíveis apenas para `OWNER` e `ADMIN`. Para `OPERADOR`, os itens correspondentes SHALL NOT aparecer na navegação, e o acesso direto às rotas SHALL ser barrado.

#### Scenario: OPERADOR não vê áreas sensíveis

- **WHEN** um usuário `OPERADOR` usa o painel
- **THEN** não há item "Membros" nem "Plano & cobrança" na navegação

#### Scenario: OPERADOR tenta acesso direto

- **WHEN** um `OPERADOR` navega diretamente para `/admin/membros`
- **THEN** o acesso é barrado, sem expor o conteúdo da tela
