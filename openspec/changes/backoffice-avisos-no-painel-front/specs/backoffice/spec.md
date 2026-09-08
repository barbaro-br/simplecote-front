## ADDED Requirements

### Requirement: Tela de gestão de avisos no backoffice

O backoffice SHALL ter uma tela `/backoffice/avisos` para o `SUPER_ADMIN` gerenciar os avisos da plataforma: uma tabela com título, nível, se está ativo, data de publicação e data de expiração; um formulário "Novo aviso" (título, corpo, nível, expiração opcional) que chama `POST /api/admin/avisos`; um controle para ativar/desativar cada aviso (`PATCH /api/admin/avisos/{id}`); e remover com confirmação inline (`DELETE /api/admin/avisos/{id}`). A navegação do backoffice SHALL ter uma entrada "Avisos".

#### Scenario: Criar um aviso

- **WHEN** o `SUPER_ADMIN` preenche o formulário e envia
- **THEN** o front chama `POST /api/admin/avisos` e o aviso aparece na tabela

#### Scenario: Ativar/desativar

- **WHEN** o `SUPER_ADMIN` alterna o estado "ativo" de um aviso
- **THEN** o front chama `PATCH /api/admin/avisos/{id}` com o novo valor
