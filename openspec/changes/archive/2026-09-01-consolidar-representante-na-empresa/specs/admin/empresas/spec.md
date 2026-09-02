## MODIFIED Requirements

### Requirement: Listagem do Catálogo de Fornecedores

O sistema SHALL exibir uma lista de todas as empresas fornecedoras vinculadas ao Comprador, mostrando para cada uma o nome e o seu **representante** (nome e e-mail) e a Situação (Ativa/Inativa).

#### Scenario: Visualização

- **WHEN** o usuário acessa a página de Empresas
- **THEN** a lista de empresas é carregada do backend e exibida de forma tabular, com o representante de cada empresa ao lado do nome

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
