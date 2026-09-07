## Purpose

Cobre a assinatura e a cobrança de cada `Comprador` no painel: onde o dono vê o plano atual, o uso contra os limites e o estado da assinatura; como ele assina e gerencia o pagamento por um gateway externo; e como o sistema avisa sobre o fim do teste e restringe o uso quando o pagamento não está em dia.

## ADDED Requirements

### Requirement: Painel de plano e uso

O painel SHALL exibir, para o `Comprador` da sessão, o plano atual, o estado da assinatura (`TESTE`, `ATIVA`, `INADIMPLENTE`, `CANCELADA`), a data de fim do teste quando aplicável, e o uso atual contra o limite de cada quota do plano (ex.: cotações no mês, usuários, representantes). Os valores SHALL vir da API (`GET /api/assinatura`), com estados de carregamento e erro que não derrubam a tela.

#### Scenario: Ver plano e uso

- **WHEN** o dono abre a aba de plano e cobrança
- **THEN** vê o plano, o estado da assinatura e, para cada quota, quanto já usou e qual o limite

#### Scenario: Uso perto do limite é destacado

- **WHEN** o uso de uma quota está igual ou acima do limite do plano
- **THEN** a tela destaca essa quota e indica que é preciso mudar de plano para criar mais

### Requirement: Assinar e gerenciar cobrança pelo gateway

O painel SHALL oferecer as ações "Assinar" (quando não há assinatura ativa) e "Gerenciar cobrança" (quando há), cada uma obtendo da API uma URL de destino (sessão de checkout ou portal do cliente do gateway) e redirecionando o navegador para ela. O front SHALL NOT coletar dados de cartão nem integrar SDK de pagamento; toda captura de pagamento acontece no gateway.

#### Scenario: Iniciar assinatura

- **WHEN** o dono de um `Comprador` em `TESTE` aciona "Assinar"
- **THEN** o front chama a API, recebe a URL de checkout e leva o navegador até ela

#### Scenario: Gerenciar cobrança existente

- **WHEN** o dono de um `Comprador` com assinatura `ATIVA` aciona "Gerenciar cobrança"
- **THEN** o front leva o navegador ao portal do cliente do gateway (trocar cartão, ver faturas, cancelar)

#### Scenario: Estado reflete o retorno do gateway

- **WHEN** o dono volta do checkout após pagar e o webhook do gateway já atualizou o `status_assinatura` no backend
- **THEN** ao recarregar a aba de cobrança, o estado aparece como `ATIVA` — a fonte da verdade é o backend, não o parâmetro de retorno da URL

### Requirement: Aviso de teste no painel

Enquanto a assinatura do `Comprador` está em `TESTE`, o painel SHALL exibir um aviso persistente com os dias restantes do teste e um atalho para "Assinar". O aviso SHALL desaparecer quando a assinatura passa a `ATIVA`.

#### Scenario: Contagem regressiva do teste

- **WHEN** o dono usa o painel com a conta em `TESTE`
- **THEN** um aviso mostra quantos dias faltam para o fim do teste e leva para a assinatura

#### Scenario: Aviso some após assinar

- **WHEN** a assinatura passa a `ATIVA`
- **THEN** o aviso de teste não é mais exibido

### Requirement: Bloqueio suave por inadimplência

Quando a assinatura do `Comprador` está `INADIMPLENTE` ou `CANCELADA`, as chamadas a `/api/**` respondem `402`. O front SHALL interceptar esse `402` e apresentar uma tela de "pagamento pendente" com a ação de regularizar (levando ao portal/checkout), SHALL NOT limpar a sessão nem redirecionar para `/login`, e SHALL manter acessíveis o logout e a própria aba de cobrança.

#### Scenario: Chamada bloqueada por inadimplência

- **WHEN** um `Comprador` inadimplente tenta usar uma tela do painel e a API responde `402`
- **THEN** o front mostra a tela de "pagamento pendente" com a opção de regularizar, sem ir para `/login` e sem tela de erro genérica

#### Scenario: Regularizar a partir do bloqueio

- **WHEN** o dono aciona "regularizar" na tela de pagamento pendente
- **THEN** o front obtém a URL do portal/checkout e leva o navegador até ela

#### Scenario: Sair continua possível durante o bloqueio

- **WHEN** o `Comprador` está bloqueado por `402`
- **THEN** o dono ainda consegue acionar "sair" e voltar para `/login`

### Requirement: Gating de features por plano

Recursos que o plano atual não inclui SHALL aparecer desabilitados com uma indicação clara de que dependem de um plano superior (com atalho para a aba de cobrança), em vez de sumirem sem explicação. Se o backend recusar uma ação por limite de plano (`ProblemDetail`), a mensagem em pt-BR do backend SHALL ser exibida.

#### Scenario: Feature fora do plano

- **WHEN** o dono abre uma tela cujo recurso não está no plano atual
- **THEN** o recurso aparece desabilitado com uma chamada para fazer upgrade, e não como se estivesse quebrado

#### Scenario: Backend recusa por limite de plano

- **WHEN** o dono tenta criar um recurso acima da quota e o backend responde com `ProblemDetail` de limite excedido
- **THEN** a tela exibe a mensagem do backend e não adiciona o recurso

### Requirement: Dados de faturamento para a nota fiscal

Antes de concluir a primeira assinatura, o front SHALL coletar os dados do tomador para a NFS-e: **CNPJ**, razão social, e-mail de faturamento e endereço completo (CEP, logradouro, número, complemento, bairro, município e UF). O CNPJ SHALL oferecer preenchimento automático dos demais campos por um lookup (mesmo padrão do cadastro de `empresas`), com todos os campos editáveis. O front SHALL bloquear a conclusão da assinatura quando o CNPJ estiver com situação cadastral diferente de "ativa" ou quando faltar campo obrigatório, exibindo a mensagem correspondente. Esses dados SHALL ser persistidos via API (`PUT /api/assinatura/dados-faturamento`) e SHALL poder ser revisados/editados depois na aba de cobrança.

#### Scenario: Preencher pelo CNPJ

- **WHEN** o dono informa o CNPJ no formulário de dados de faturamento
- **THEN** razão social e endereço são preenchidos pelo lookup, e o dono pode corrigir qualquer campo antes de salvar

#### Scenario: CNPJ inativo bloqueia a assinatura

- **WHEN** o lookup retorna o CNPJ com situação cadastral diferente de "ativa"
- **THEN** o front não deixa concluir a assinatura e explica o motivo

#### Scenario: Editar os dados depois

- **WHEN** o dono abre a aba de cobrança de um `Comprador` já assinante e altera o e-mail de faturamento
- **THEN** a alteração é persistida via `PUT /api/assinatura/dados-faturamento`

### Requirement: Lista de notas fiscais emitidas

A aba de cobrança SHALL exibir as NFS-e emitidas para o `Comprador` (competência, valor, status e link para o PDF), obtidas de `GET /api/assinatura/notas`, com estados de carregamento, vazio e erro. O front SHALL NOT emitir nem cancelar notas — isso é responsabilidade do backend.

#### Scenario: Ver as notas emitidas

- **WHEN** o dono abre a aba de cobrança de um `Comprador` com notas já emitidas
- **THEN** vê a lista com competência, valor, status e um link para baixar o PDF de cada nota

#### Scenario: Ainda sem notas

- **WHEN** o `Comprador` assinou mas nenhuma nota foi emitida ainda
- **THEN** a lista mostra um estado vazio claro, sem erro
