## MODIFIED Requirements

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
