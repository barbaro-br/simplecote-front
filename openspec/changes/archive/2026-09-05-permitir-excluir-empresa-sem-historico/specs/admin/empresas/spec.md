## ADDED Requirements

### Requirement: Exclusão definitiva de Empresa sem histórico

O sistema SHALL permitir ao Comprador excluir definitivamente uma Empresa, desde que ela nunca tenha participado de nenhuma cotação. A exclusão é irreversível e SHALL ser sempre precedida por um diálogo de confirmação que nomeia essa consequência. A disponibilidade da ação é determinada pela flag `podeExcluir` fornecida pela API (o front não decide a regra): quando a empresa já participou de alguma cotação, `podeExcluir` é falso, o botão de excluir SHALL ficar desabilitado com uma dica (tooltip) explicando o motivo, e "Inativar" permanece o único caminho para tirar a empresa de uso.

#### Scenario: Confirmação antes da exclusão
- **WHEN** o usuário aciona "Excluir" numa empresa cuja flag `podeExcluir` é verdadeira
- **THEN** o sistema exibe um diálogo de confirmação nomeando que a exclusão é definitiva e irreversível, e só prossegue após o usuário confirmar

#### Scenario: Exclusão com sucesso
- **WHEN** o usuário confirma a exclusão de uma empresa sem histórico de participação
- **THEN** o sistema chama `DELETE /api/empresas/{id}` e a empresa deixa de figurar na listagem após o recarregamento

#### Scenario: Empresa com histórico tem exclusão bloqueada
- **WHEN** a listagem contém uma empresa que já participou de alguma cotação (flag `podeExcluir` falsa)
- **THEN** o botão "Excluir" dessa linha aparece desabilitado com uma dica informando que a empresa já participou de cotação e que a inativação é o caminho apropriado

#### Scenario: Bloqueio de última instância pelo back
- **WHEN** uma exclusão é tentada para uma empresa que já possui participação e o back retorna erro de negócio com mensagem em pt-BR
- **THEN** o sistema exibe a mensagem vinda da API e mantém a empresa na listagem, sem excluí-la
