## ADDED Requirements

### Requirement: Captura do código de barras por câmera no cadastro de produto

O formulário de cadastro/edição de produto SHALL oferecer, junto ao campo de código de barras, uma ação **Bipar** que abre um leitor de câmera em tela cheia (o mesmo componente `LeitorCodigoBarras` usado no fluxo do colaborador, carregado sob demanda para não pesar o bundle principal). Ao reconhecer um código, o sistema SHALL preencher o campo de código de barras com o valor lido, fechar o leitor e disparar automaticamente a busca externa por GTIN (o mesmo efeito do botão "Buscar"). Quando a câmera estiver indisponível ou a permissão for negada, o leitor SHALL informar isso e o cadastro manual SHALL continuar possível.

#### Scenario: Bipar preenche o código e busca o nome

- **WHEN** o usuário clica em "Bipar" e a câmera reconhece um código de barras
- **THEN** o campo de código de barras é preenchido com o valor lido, o leitor fecha e a busca do nome por GTIN é acionada automaticamente

#### Scenario: Fechar o leitor sem ler

- **WHEN** o usuário abre o leitor e o fecha sem reconhecer nenhum código
- **THEN** o formulário volta ao estado anterior, sem alterar o campo de código de barras

#### Scenario: Câmera indisponível não trava o cadastro

- **WHEN** o usuário aciona "Bipar" mas a permissão de câmera é negada ou não há câmera
- **THEN** o leitor exibe um aviso orientando usar a busca por texto e o usuário ainda consegue digitar o código e salvar o produto

## MODIFIED Requirements

### Requirement: Cadastro de Novo Produto

O sistema SHALL permitir o cadastro de um novo produto solicitando nome, código de barras opcional, tipo de embalagem e quantidade por embalagem. Os erros de validação local SHALL ser exibidos em **português** para todos os campos — inclusive para quantidade por embalagem inválida (menor que 1 **ou** não inteira), nunca a mensagem padrão em inglês da biblioteca de validação.

O código de barras SHALL continuar **opcional**, mas ao tentar salvar um produto com o campo de código de barras vazio o sistema SHALL pedir uma confirmação explícita ("Salvar sem código de barras?"), nomeando a consequência (o produto ficará sem GTIN e não aparecerá em buscas por código nem na bipagem). Confirmar SHALL prosseguir com o salvamento; cancelar SHALL manter o formulário aberto, com o foco no campo de código de barras. Com o campo preenchido, o salvamento SHALL ocorrer direto, sem a confirmação.

#### Scenario: Cadastro com sucesso

- **WHEN** o usuário preenche o formulário corretamente e salva
- **THEN** o produto é criado via API, o formulário é fechado, e a listagem é atualizada

#### Scenario: Erro de validação local

- **WHEN** o usuário tenta salvar com nome vazio ou quantidade menor que 1
- **THEN** a interface exibe erros locais de validação em português abaixo dos campos sem enviar a requisição

#### Scenario: Quantidade não inteira tem mensagem em português

- **WHEN** o usuário digita uma quantidade por embalagem com casas decimais (ex.: 1.5) ou deixa o campo vazio
- **THEN** o campo exibe um erro de validação em português (ex.: "A quantidade deve ser um número inteiro" / "Informe a quantidade por embalagem"), sem mensagem em inglês

#### Scenario: Salvar sem código de barras pede confirmação

- **WHEN** o usuário preenche os demais campos, deixa o código de barras vazio e clica em salvar
- **THEN** um diálogo "Salvar sem código de barras?" aparece nomeando a consequência, e nenhuma requisição é enviada até a resposta

#### Scenario: Confirmar salva mesmo sem código de barras

- **WHEN** o diálogo de confirmação está aberto e o usuário confirma "Salvar sem código"
- **THEN** o produto é criado via API sem código de barras e o formulário é fechado

#### Scenario: Cancelar a confirmação mantém o formulário

- **WHEN** o diálogo de confirmação está aberto e o usuário cancela
- **THEN** o formulário continua aberto com os dados preenchidos e o foco vai para o campo de código de barras, sem enviar a requisição

#### Scenario: Com código de barras não pede confirmação

- **WHEN** o usuário salva um produto com o campo de código de barras preenchido
- **THEN** o produto é criado via API diretamente, sem o diálogo de confirmação
