## MODIFIED Requirements

### Requirement: Cadastro de Novo Produto

O sistema SHALL permitir o cadastro de um novo produto solicitando nome, código de barras opcional, tipo de embalagem e quantidade por embalagem. Os erros de validação local SHALL ser exibidos em **português** para todos os campos — inclusive para quantidade por embalagem inválida (menor que 1 **ou** não inteira), nunca a mensagem padrão em inglês da biblioteca de validação.

#### Scenario: Cadastro com sucesso

- **WHEN** o usuário preenche o formulário corretamente e salva
- **THEN** o produto é criado via API, o formulário é fechado, e a listagem é atualizada

#### Scenario: Erro de validação local

- **WHEN** o usuário tenta salvar com nome vazio ou quantidade menor que 1
- **THEN** a interface exibe erros locais de validação em português abaixo dos campos sem enviar a requisição

#### Scenario: Quantidade não inteira tem mensagem em português

- **WHEN** o usuário digita uma quantidade por embalagem com casas decimais (ex.: 1.5) ou deixa o campo vazio
- **THEN** o campo exibe um erro de validação em português (ex.: "A quantidade deve ser um número inteiro" / "Informe a quantidade por embalagem"), sem mensagem em inglês
