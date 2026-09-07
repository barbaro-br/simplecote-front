# admin/representantes Specification

## Purpose

Tela do painel do admin para gerir os representantes (as pessoas de contato das Empresas fornecedoras): listar todos, criar um vinculado a uma Empresa, corrigir os dados de contato e inativar. Complementa — não substitui — a criação do representante principal que já acontece junto do cadastro de Empresa.

## Requirements

### Requirement: Listagem de representantes

A rota `/admin/representantes` (dentro do painel autenticado) SHALL exibir a lista de todos os representantes do comprador, **incluindo os inativos**, cada um com nome, e-mail, whatsapp (quando houver), o **nome da Empresa** a que pertence (não o identificador) e uma marcação visual quando estiver inativo. A tela SHALL mostrar um estado de carregamento enquanto os dados não chegam, um estado vazio quando não há nenhum representante, e um estado de erro que informa a falha sem quebrar o restante do layout do painel.

#### Scenario: Lista com representantes ativos e inativos

- **WHEN** o admin abre `/admin/representantes` e existem representantes, alguns inativos
- **THEN** todos aparecem na lista com nome, e-mail, whatsapp e o nome da Empresa; os inativos aparecem com marcação de inativo

#### Scenario: Nenhum representante

- **WHEN** o admin abre a tela e não há representante cadastrado
- **THEN** a tela mostra um estado vazio ("nenhum representante ainda"), sem erro

#### Scenario: Falha ao carregar

- **WHEN** a busca da lista falha
- **THEN** a tela mostra uma mensagem de erro e o menu/layout do painel continua utilizável

### Requirement: Cadastro de representante

A tela SHALL permitir criar um representante através de um formulário com nome, e-mail, whatsapp (opcional) e a **escolha de uma Empresa** entre as Empresas ativas do comprador. O formulário SHALL exigir nome e e-mail preenchidos, e-mail em formato válido e uma Empresa selecionada; SHALL bloquear o envio enquanto a requisição está em andamento; e SHALL exibir, junto ao formulário, a mensagem de erro devolvida pelo backend quando a criação for rejeitada. Após um cadastro bem-sucedido, a lista SHALL refletir o novo representante sem recarregar a página.

#### Scenario: Cadastro válido

- **WHEN** o admin preenche nome, e-mail válido e escolhe uma Empresa, e confirma
- **THEN** o representante é criado e passa a aparecer na lista

#### Scenario: Formulário incompleto ou inválido

- **WHEN** o admin tenta enviar sem nome, sem Empresa, ou com e-mail em formato inválido
- **THEN** o formulário aponta o campo problemático e não envia a requisição

#### Scenario: Backend rejeita o cadastro

- **WHEN** o backend responde com erro de negócio (por exemplo e-mail já usado)
- **THEN** a mensagem do backend aparece no formulário e o representante não é adicionado à lista

### Requirement: Edição de dados de contato do representante

A tela SHALL permitir editar o **nome, e-mail e whatsapp** de um representante existente. O formulário de edição SHALL **não** oferecer troca de Empresa — a Empresa atual SHALL aparecer apenas como informação, com um aviso curto de que a mudança de Empresa não é feita por essa tela. As mesmas validações e o mesmo tratamento de erro do cadastro SHALL valer. Após salvar, a lista SHALL refletir os novos dados.

#### Scenario: Edição salva

- **WHEN** o admin abre a edição de um representante, altera o e-mail para um válido e confirma
- **THEN** o representante é atualizado e a lista mostra o novo e-mail

#### Scenario: Edição não permite trocar de Empresa

- **WHEN** o admin abre a edição de um representante
- **THEN** não há campo para selecionar Empresa; a Empresa atual é mostrada como texto, com o aviso de que a troca não é feita ali

### Requirement: Inativação de representante

A tela SHALL permitir inativar um representante, com uma confirmação antes de efetivar. Após a inativação, a lista SHALL mostrar o representante como inativo. A tela SHALL **não** oferecer reativação (o backend não expõe essa operação).

#### Scenario: Inativar com confirmação

- **WHEN** o admin aciona "inativar" num representante e confirma
- **THEN** o representante passa a constar como inativo na lista

#### Scenario: Sem opção de reativar

- **WHEN** o admin olha um representante já inativo
- **THEN** não há ação de reativar disponível na tela
