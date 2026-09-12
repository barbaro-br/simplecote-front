## Purpose

Aba agregada onde o Comprador vê todos os seus Pedidos — de qualquer Cotação apurada e os avulsos — num lugar só, sem precisar entrar Cotação por Cotação. Complementa (não substitui) a visão de pedidos de dentro de uma Cotação específica (`admin/cotacoes` - "Resultado da apuração e pedidos").

## ADDED Requirements

### Requirement: Listagem de Pedidos agrupada por Cotação

O sistema SHALL, em `/admin/pedidos`, carregar `GET /api/pedidos` e exibir os Pedidos agrupados: um grupo por Cotação (com o título dela) contendo os Pedidos `APURADO` daquela Cotação, e um grupo separado "Avulsos" com os Pedidos `AVULSO`. Cada Pedido, antes de ser aberto, SHALL mostrar: valor total, quantidade de itens, condição de pagamento e prazo de entrega (um traço "—" quando não preenchidos), e status.

#### Scenario: Pedidos agrupados por Cotação

- **WHEN** o Comprador abre a aba "Pedidos" e tem duas Cotações apuradas (uma com 2 pedidos, outra com 1) e nenhum avulso
- **THEN** a tela mostra dois grupos, cada um com o título da Cotação e os pedidos dela

#### Scenario: Avulsos numa seção própria

- **WHEN** o Comprador tem 1 Cotação apurada com 1 pedido e 2 pedidos avulsos
- **THEN** a tela mostra o grupo da Cotação e, separadamente, uma seção "Avulsos" com os 2 pedidos

#### Scenario: Resumo do pedido antes de abrir

- **WHEN** a listagem carrega
- **THEN** cada pedido mostra valor total, quantidade de itens, condição de pagamento e prazo de entrega sem precisar abrir o pedido

#### Scenario: Campos não preenchidos mostram traço

- **WHEN** um pedido não tem condição de pagamento nem prazo de entrega preenchidos
- **THEN** a linha mostra "—" nesses dois campos, sem erro nem espaço em branco confuso

#### Scenario: Lista vazia

- **WHEN** o Comprador ainda não tem nenhum Pedido (nem apurado nem avulso)
- **THEN** a tela mostra um estado vazio convidando a criar um pedido avulso ou apurar uma Cotação

### Requirement: Criar novo pedido avulso a partir da aba Pedidos

O sistema SHALL oferecer, na aba "Pedidos", um botão "Novo pedido" que leva à tela de montagem de Pedido avulso já existente (`admin/pedidos-avulsos`).

#### Scenario: Botão leva à tela de pedido avulso

- **WHEN** o Comprador aciona "Novo pedido" na aba Pedidos
- **THEN** o sistema navega para `/admin/pedidos-avulsos/novo`

### Requirement: Aba Pedidos não substitui a visão de dentro da Cotação

A aba "Pedidos" NÃO SHALL substituir a tela de Resultado de uma Cotação específica (`admin/cotacoes` - "Resultado da apuração e pedidos") — as ações de enviar pedido, baixar XLSX/PDF e ver itens vencidos continuam existindo lá, sem serem duplicadas nesta aba nova.

#### Scenario: Resultado da Cotação continua acessível como antes

- **WHEN** o Comprador entra numa Cotação `PEDIDOS_GERADOS` e vai até o Resultado dela
- **THEN** a tela de Resultado continua funcionando exatamente como antes desta change, com todas as ações (enviar, XLSX, PDF, expandir itens)
