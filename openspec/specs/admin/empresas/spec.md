# admin/empresas Specification

## Purpose

Gestão de fornecedores (Empresas) pelo Comprador, mantendo dados cadastrais base para relacionamento em futuras cotações.

## Requirements

### Requirement: Listagem do Catálogo de Fornecedores

O sistema SHALL exibir uma lista de todas as empresas fornecedoras vinculadas ao Comprador, mostrando para cada uma o nome e o seu **representante** (nome e e-mail) e a Situação (Ativa/Inativa).

#### Scenario: Visualização

- **WHEN** o usuário acessa a página de Empresas
- **THEN** a lista de empresas é carregada do backend e exibida de forma tabular, com o representante de cada empresa ao lado do nome

### Requirement: Cadastro de Empresa
O sistema SHALL permitir o cadastro de um novo fornecedor exigindo apenas o Nome (Identidade Comercial), além de permitir no mesmo fluxo os dados do Representante Comercial primário (E-mail, Telefone, WhatsApp). O frontend orquestrará a criação da Empresa e em seguida a vinculação do Representante. A empresa nasce ativa por padrão. O campo de WhatsApp SHALL exibir uma máscara em tempo real (`(XX) XXXXX-XXXX` para 11 dígitos, `(XX) XXXX-XXXX` para 10) conforme o usuário digita, enviando ao backend só os dígitos. Se a Empresa for criada com sucesso mas a criação do Representante falhar, o sistema SHALL guardar o identificador da Empresa já criada e, numa nova tentativa de salvar, SHALL criar apenas o Representante para essa Empresa — NÃO SHALL criar uma segunda Empresa duplicada.

#### Scenario: Cadastro com sucesso
- **WHEN** o usuário preenche o formulário com o nome da empresa e os dados do representante
- **THEN** o sistema orquestra as requisições sequencialmente e a nova empresa passa a figurar na listagem

#### Scenario: Preenchimento inválido
- **WHEN** o usuário tenta salvar sem informar o Nome da empresa ou o Nome/Email do Representante
- **THEN** o validador bloqueia o envio e exibe mensagens de erro nos respectivos campos

#### Scenario: Máscara de WhatsApp em tempo real

- **WHEN** o usuário digita `11987654321` no campo WhatsApp
- **THEN** o campo exibe `(11) 98765-4321` conforme os dígitos são digitados, e o valor enviado ao backend continua sendo só os dígitos

#### Scenario: Falha na criação do Representante não duplica a Empresa

- **WHEN** a Empresa é criada com sucesso mas a chamada de criação do Representante falha, e o usuário aciona "Salvar" novamente sem fechar o formulário
- **THEN** o sistema chama apenas a criação do Representante para a Empresa já criada, sem criar uma segunda Empresa

### Requirement: Inativação e Reativação de Empresa
O sistema SHALL listar as Empresas do Comprador incluindo as inativas, exibindo cada linha inativa com aparência apagada (cinza), e SHALL oferecer, por linha, uma ação que **inativa** a Empresa ativa (`POST /api/empresas/{id}/inativar`) ou **reativa** a Empresa inativa (`POST /api/empresas/{id}/ativar`), conforme o estado atual. As ações SHALL ser apresentadas como ícones com dica (tooltip) no hover, e a linha inteira sob o cursor SHALL ganhar destaque visual.

#### Scenario: Inativação (soft delete)
- **WHEN** o usuário aciona "Inativar" numa Empresa ativa
- **THEN** a API é chamada, a lista recarrega e a Empresa passa a aparecer com aparência de inativa

#### Scenario: Reativação
- **WHEN** o usuário aciona "Ativar" numa Empresa que está inativa
- **THEN** a API de reativação é chamada, a lista recarrega e a Empresa volta ao estado ativo (aparência normal)

#### Scenario: Ação depende do estado da linha
- **WHEN** a lista tem Empresas ativas e inativas
- **THEN** a linha ativa oferece a ação "Inativar" e a linha inativa oferece a ação "Ativar" — nunca as duas ao mesmo tempo

#### Scenario: Feedback de hover na linha
- **WHEN** o usuário passa o mouse sobre uma linha
- **THEN** a linha recebe destaque e os ícones de ação daquela linha revelam sua dica (tooltip) ao pausar sobre eles

### Requirement: Atualização de Empresa

O sistema SHALL permitir ao Comprador atualizar o Nome de uma Empresa existente e os dados de contato do seu Representante (nome, e-mail, WhatsApp), mantendo os identificadores. Ao salvar, o front SHALL atualizar a Empresa (`PUT /api/empresas/{id}`) e fazer o upsert do representante: `PUT /api/representantes/{id}` quando a empresa já tem representante, ou `POST /api/representantes` quando ainda não tem.

#### Scenario: Atualizar com sucesso

- **WHEN** o usuário clica em "Editar" numa empresa da lista e altera seu nome no formulário
- **THEN** as alterações são salvas e a listagem atualizada reflete o novo nome

#### Scenario: Editar os dados do representante junto da empresa

- **WHEN** o usuário edita uma empresa e altera o nome/e-mail/WhatsApp do representante no mesmo formulário
- **THEN** o representante é atualizado (ou criado, se a empresa ainda não tinha) e a lista reflete os novos dados de contato

#### Scenario: Empresa sem representante ainda

- **WHEN** o usuário edita uma empresa que não tem representante cadastrado e preenche os dados de contato
- **THEN** ao salvar, um representante é criado vinculado àquela empresa
