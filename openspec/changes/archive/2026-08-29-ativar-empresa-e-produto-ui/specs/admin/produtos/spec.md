## MODIFIED Requirements

### Requirement: Inativação de Produto
O sistema SHALL listar os produtos do Comprador incluindo os inativos, exibindo cada linha inativa com aparência apagada (cinza), e SHALL oferecer, por linha, uma ação que **inativa** o produto ativo (`POST /api/produtos/{id}/inativar`) ou **reativa** o produto inativo (`POST /api/produtos/{id}/ativar`), conforme o estado atual. As ações SHALL ser apresentadas como ícones com dica (tooltip) no hover, e a linha inteira sob o cursor SHALL ganhar destaque visual.

#### Scenario: Inativar produto
- **WHEN** o usuário aciona "Inativar" na linha de um produto ativo
- **THEN** a inativação é solicitada à API e a lista recarrega, com o produto passando a aparecer como inativo

#### Scenario: Reativar produto
- **WHEN** o usuário aciona "Ativar" na linha de um produto inativo
- **THEN** a reativação é solicitada à API e a lista recarrega, com o produto de volta ao estado ativo

#### Scenario: Ação depende do estado da linha
- **WHEN** a lista tem produtos ativos e inativos
- **THEN** a linha ativa oferece "Inativar" e a linha inativa oferece "Ativar", nunca as duas
