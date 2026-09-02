## REMOVED Requirements

### Requirement: Listagem de representantes

**Reason**: O representante passa a ser gerido dentro da aba de Empresas (relação 1:1 do domínio), tornando a tela dedicada redundante.

**Migration**: O nome/e-mail do representante agora aparece na própria listagem de Empresas.

### Requirement: Cadastro de representante

**Reason**: O cadastro do representante acontece no formulário de Empresa (criação e edição).

**Migration**: Use o formulário de Empresa para cadastrar o representante vinculado.

### Requirement: Edição de dados de contato do representante

**Reason**: A edição dos dados de contato passou para o formulário de Empresa.

**Migration**: Edite a Empresa e altere nome/e-mail/WhatsApp do representante no mesmo formulário.

### Requirement: Inativação de representante

**Reason**: A ação dedicada de inativar representante sai da UI; a desativação do fornecedor segue pela inativação da Empresa.

**Migration**: Inative a Empresa para retirar o fornecedor de novas cotações.
