## ADDED Requirements

### Requirement: Exportar dados da organização

A tela de Configurações SHALL oferecer, para `OWNER` e `ADMIN`, uma ação que baixa um arquivo com os dados do `Comprador` (cotações, produtos, empresas, representantes e resultados) em formato portável, chamando `GET /api/organizacao/exportacao`. A ação SHALL indicar o progresso, SHALL exibir a mensagem de erro do backend em caso de falha, e SHALL usar o mesmo mecanismo de download autenticado já usado nos relatórios.

#### Scenario: Baixar a exportação

- **WHEN** um `ADMIN` aciona "exportar dados da organização"
- **THEN** o navegador baixa o arquivo com os dados do `Comprador`, com indicação de progresso enquanto gera

#### Scenario: Falha na exportação

- **WHEN** o backend responde com erro
- **THEN** a tela mostra a mensagem do backend e nenhum arquivo é baixado

#### Scenario: OPERADOR não vê a exportação

- **WHEN** um `OPERADOR` abre a tela de Configurações
- **THEN** a ação de exportar dados da organização não é exibida

### Requirement: Encerrar a organização

A tela de Configurações SHALL oferecer, apenas para o `OWNER`, uma ação de encerrar a conta do `Comprador`. A ação SHALL exigir uma confirmação forte — digitar o nome do supermercado — e SHALL nomear a consequência (perda de acesso aos dados, purga posterior). Ao confirmar, SHALL chamar `DELETE /api/organizacao`; em sucesso, SHALL encerrar a sessão e levar a uma tela de "conta encerrada". SHALL exibir a mensagem de erro do backend em caso de recusa.

#### Scenario: Encerrar com confirmação forte

- **WHEN** o `OWNER` aciona "encerrar organização", digita o nome do supermercado corretamente e confirma
- **THEN** o front chama `DELETE /api/organizacao`, encerra a sessão e mostra a tela de "conta encerrada"

#### Scenario: Confirmação não confere

- **WHEN** o `OWNER` digita um nome que não corresponde ao do supermercado
- **THEN** o botão de encerrar permanece desabilitado e nada é enviado

#### Scenario: Ação restrita ao OWNER

- **WHEN** um `ADMIN` (não `OWNER`) abre a tela de Configurações
- **THEN** a ação de encerrar a organização não é exibida
