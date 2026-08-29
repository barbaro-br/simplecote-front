## MODIFIED Requirements

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
