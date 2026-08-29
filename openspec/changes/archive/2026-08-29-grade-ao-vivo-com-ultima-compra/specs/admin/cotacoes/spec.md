## ADDED Requirements

### Requirement: Grade ao vivo da Cotação
O sistema SHALL oferecer, em `/admin/cotacoes/:id/ao-vivo`, uma grade de acompanhamento da Cotação: linhas = itens, colunas = Empresas convidadas, cada célula com o status do lance (`COTADO`/`NAO_COTADO`/`PENDENTE`), o preço da embalagem e o preço unitário derivado que vêm prontos de `GET /api/cotacoes/{id}/ao-vivo`; o menor preço unitário do item SHALL ser destacado. A tela SHALL mostrar a contagem de participantes `RESPONDIDO` sobre o total. O front NÃO SHALL recalcular preço, vencedor ou menor preço — tudo vem da API.

Enquanto a Cotação está `ABERTA`, a grade SHALL atualizar sozinha por polling a cada ~5s; quando a Cotação deixa de estar `ABERTA`, o polling SHALL parar. O polling SHALL pausar quando a aba perde o foco.

Cada célula SHALL permitir ao Comprador corrigir aquele lance a partir da grade (usando o `participanteId` que a célula carrega), abrindo o fluxo de correção de lance sem sair da tela.

#### Scenario: Grade renderiza o estado das células
- **WHEN** o Comprador abre a grade ao vivo de uma Cotação `ABERTA` com itens e Empresas convidadas
- **THEN** cada célula mostra o status do lance daquela Empresa para aquele item, o preço quando `COTADO`, e o menor preço unitário do item aparece destacado; o cabeçalho mostra "respondidos / total"

#### Scenario: Polling liga em ABERTA e desliga fora
- **WHEN** a Cotação está `ABERTA`
- **THEN** a grade revalida sozinha a cada ~5s; e quando a Cotação passa a `ENCERRADA`/`PEDIDOS_GERADOS`/`CANCELADA`, a revalidação automática para

#### Scenario: Corrigir lance pela célula
- **WHEN** o Comprador aciona uma célula da grade
- **THEN** o fluxo de correção de lance abre para aquele `participanteId` e item, e ao confirmar a grade reflete o novo valor

### Requirement: Referência de última compra no hover
O sistema SHALL exibir, ao passar o mouse sobre um item da grade ao vivo, um popover com a **referência de última compra** daquele produto (campos `ultimoPrecoUnitario`, `ultimaCompraEmpresa`, `ultimaCompraEm` da resposta): o preço unitário, a Empresa que venceu e a data (formatada pt-BR / America/Sao_Paulo). Quando o produto nunca foi comprado, o popover SHALL indicar "sem compra anterior". O popover PODE indicar visualmente se o menor preço atual do item está acima ou abaixo dessa referência.

#### Scenario: Item com compra anterior
- **WHEN** o Comprador passa o mouse sobre um item cujo produto já foi comprado numa cotação apurada
- **THEN** o popover mostra o preço unitário da última compra, o nome da Empresa vencedora e a data formatada em pt-BR

#### Scenario: Item sem compra anterior
- **WHEN** o Comprador passa o mouse sobre um item cujo produto nunca foi comprado
- **THEN** o popover indica "sem compra anterior", sem preço nem empresa
