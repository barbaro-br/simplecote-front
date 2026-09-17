## REMOVED Requirements

### Requirement: Listagem de usuários
**Reason**: A tela `/admin/usuarios` deixa de existir; `/admin/membros` já lista os mesmos usuários (ativos e inativos) somados aos convites pendentes.
**Migration**: Usar `/admin/membros` (Requirement "Listagem de membros" em `admin/organizacao`, sem alteração — já cobre este caso).

### Requirement: Cadastro de usuário
**Reason**: A criação com senha inicial passa a viver em `/admin/membros`, como alternativa ao convite por e-mail.
**Migration**: Usar `/admin/membros` → "criar com senha" (Requirement "Criação direta com senha inicial" em `admin/organizacao`).

### Requirement: Edição de nome, e-mail e papel
**Reason**: A ação passa a viver em `/admin/membros`, aplicável tanto a quem foi convidado quanto a quem foi criado diretamente.
**Migration**: Usar `/admin/membros` (Requirement "Edição de nome, e-mail e papel de um membro" em `admin/organizacao`).

### Requirement: Troca de senha de um usuário
**Reason**: A ação passa a viver em `/admin/membros`.
**Migration**: Usar `/admin/membros` (Requirement "Troca de senha de um membro" em `admin/organizacao`).

### Requirement: Inativação de usuário
**Reason**: Já totalmente coberta por `admin/organizacao` (Requirement "Reenviar, revogar e inativar"), que reusa a mesma rota de backend. Não há comportamento a migrar.
**Migration**: Usar `/admin/membros` (Requirement "Reenviar, revogar e inativar" em `admin/organizacao`, sem alteração).

### Requirement: Papel OWNER na gestão de usuários
**Reason**: A proteção do `OWNER` (sem edição de papel, troca de senha ou inativação; não criável pela UI) já é garantida por `admin/organizacao` (Requirement "Papel OWNER da conta"), agora estendida às novas ações de edição e troca de senha adicionadas ali.
**Migration**: Ver `admin/organizacao` (Requirement "Papel OWNER da conta").
