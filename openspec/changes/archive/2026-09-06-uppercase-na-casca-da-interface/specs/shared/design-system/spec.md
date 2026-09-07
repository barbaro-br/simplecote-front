## ADDED Requirements

### Requirement: Caixa alta na casca e nos nomes de catálogo

A interface SHALL exibir em caixa alta, via `text-transform` (sem alterar o texto no DOM), os elementos de **casca** — rótulos de campo, botões, títulos de página e de seção, cabeçalhos de coluna de tabela, badges/chips de estado, itens de navegação, breadcrumbs, títulos de diálogo e rótulos de abas — e os **nomes de catálogo** exibidos pelo sistema (nome de Produto e de Empresa em listagens, seleção, grade ao vivo e resultado).

A interface SHALL NÃO aplicar caixa alta em: e-mail, WhatsApp, tokens e links mágicos; mensagens digitadas por representantes; observação de pedido; o crédito do desenvolvedor; o título da cotação digitado pelo admin (o valor); e o conteúdo de campos de entrada enquanto o usuário digita. A transformação SHALL ser locale-aware para pt-BR (acentos maiúsculos corretos).

#### Scenario: Casca em caixa alta

- **WHEN** a tela exibe botões, rótulos, cabeçalhos de tabela ou a navegação
- **THEN** esses textos aparecem em caixa alta, mas o texto no DOM permanece como escrito (buscas por texto continuam funcionando)

#### Scenario: Nome de produto em caixa alta na listagem

- **WHEN** uma tabela ou lista exibe o nome de um Produto ou de uma Empresa cadastrado como "Arroz 5kg"
- **THEN** ele aparece como "ARROZ 5KG" na tela, sem alterar o dado salvo

#### Scenario: Dado pessoal e texto livre preservam a caixa

- **WHEN** a tela exibe o e-mail de um representante, uma mensagem que ele digitou, a observação de um pedido ou o título de cotação digitado pelo admin
- **THEN** esses textos aparecem exatamente como foram informados, sem caixa alta forçada

#### Scenario: Entrada em edição não é transformada

- **WHEN** o usuário está digitando num campo de texto
- **THEN** o que ele digita não é exibido forçado em caixa alta
