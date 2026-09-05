## REMOVED Requirements

### Requirement: Tela pública de adição de itens pelo colaborador

**Reason**: a tela passa a mirar a Cotação `ABERTA` (não mais `RASCUNHO`) e a suportar múltiplas cotações abertas simultâneas com um cabeçalho de escolha — acompanha a mudança já feita no `simplecote-back`.
**Migration**: mesma rota `/colaborador/:token`; ver requirement "Tela pública de adição de itens pelo colaborador na cotação aberta" para o comportamento atual.

## ADDED Requirements

### Requirement: Tela pública de adição de itens pelo colaborador na cotação aberta

O sistema SHALL oferecer `/colaborador/:token` como rota pública (sem login), com tema claro forçado e layout mobile-first, permitindo a um funcionário do Comprador buscar um produto do catálogo ou bipar um código de barras e adicioná-lo (com quantidade) a uma das Cotações `ABERTA` da loja. Quando houver mais de uma Cotação `ABERTA` simultaneamente, a tela SHALL exibir um cabeçalho permitindo escolher em qual delas o próximo item entra, com a mais recente selecionada por padrão. Quando não houver nenhuma Cotação `ABERTA` no momento, a tela SHALL exibir uma mensagem clara nesse sentido, sem oferecer os formulários de busca/bipagem.

#### Scenario: Sem cotação aberta

- **WHEN** o colaborador abre `/colaborador/:token` e o Comprador não tem nenhuma Cotação `ABERTA`
- **THEN** a tela exibe uma mensagem clara de que não há cotação aberta no momento, sem formulário de adicionar item

#### Scenario: Uma única cotação aberta

- **WHEN** o colaborador abre `/colaborador/:token` e o Comprador tem exatamente uma Cotação `ABERTA`
- **THEN** a tela mostra o título dessa cotação, sem exibir um seletor (nada para escolher)

#### Scenario: Múltiplas cotações abertas

- **WHEN** o colaborador abre `/colaborador/:token` e o Comprador tem mais de uma Cotação `ABERTA`
- **THEN** a tela exibe um cabeçalho com todas elas para escolha, a mais recente pré-selecionada, e os itens adicionados a partir daí vão para a cotação selecionada

#### Scenario: Buscar e adicionar um produto do catálogo

- **WHEN** o colaborador digita parte do nome (ou código de barras) de um produto do catálogo, seleciona um resultado, informa a quantidade e confirma
- **THEN** o sistema chama a API de adicionar item para a cotação selecionada no cabeçalho, mostra uma confirmação temporária e limpa a seleção, pronta para o colaborador adicionar o próximo item sem sair da tela

#### Scenario: Token inválido

- **WHEN** o colaborador abre `/colaborador/:token` com um token que não corresponde a nenhum Comprador
- **THEN** a tela exibe um estado de "link inválido", sem vazar dados

#### Scenario: Erro ao adicionar item é exibido

- **WHEN** a API rejeita a adição do item (ex.: a cotação selecionada deixou de estar `ABERTA` entre a escolha e o envio)
- **THEN** a mensagem de erro é exibida na tela, sem perder a seleção do produto e da quantidade já informados

### Requirement: Adicionar item pela câmera (bipagem de código de barras)

A tela SHALL oferecer um botão para abrir a câmera do dispositivo e ler continuamente códigos de barras (GTIN), como alternativa à busca por texto. Ao ler um código, o sistema SHALL consultar o lookup de produto pelo GTIN escopado ao token. Quando o lookup encontrar o produto (200), a tela SHALL pré-preencher nome (e marca, se houver) e pedir apenas a quantidade. Quando o lookup não encontrar (404), a tela SHALL exibir um formulário para o colaborador digitar nome, unidade, quantidade por embalagem e quantidade. Em ambos os casos, a confirmação SHALL cadastrar o produto (ou reaproveitar se o GTIN já existir no catálogo) e adicioná-lo como item da cotação selecionada no cabeçalho, numa única ação do colaborador.

#### Scenario: GTIN encontrado no lookup

- **WHEN** o colaborador bipa um código de barras e o lookup encontra o produto
- **THEN** a tela pré-preenche nome e marca, pede a quantidade, e ao confirmar adiciona o item à cotação selecionada

#### Scenario: GTIN não encontrado no lookup

- **WHEN** o colaborador bipa um código de barras e o lookup não encontra o produto
- **THEN** a tela exibe um formulário para digitar nome, unidade, quantidade por embalagem e quantidade, e ao confirmar cadastra o produto e o adiciona à cotação selecionada

#### Scenario: Permissão de câmera negada ou indisponível

- **WHEN** o colaborador tenta abrir a câmera e o navegador nega a permissão, ou o dispositivo não tem câmera
- **THEN** a tela exibe um aviso e mantém disponível o fluxo de busca por texto, sem travar
