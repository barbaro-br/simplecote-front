## MODIFIED Requirements

### Requirement: Grade ao vivo da Cotação
O sistema SHALL oferecer a grade de acompanhamento da Cotação **diretamente na tela de detalhe da Cotação**, substituindo as seções estáticas de Itens e Respostas. A grade: linhas = itens, colunas = Empresas convidadas, cada célula com o status do lance (`COTADO`/`NAO_COTADO`/`PENDENTE`), o preço da embalagem e o preço unitário derivado que vêm prontos de `GET /api/cotacoes/{id}/ao-vivo`; o menor preço unitário do item SHALL ser destacado. A tela SHALL mostrar a contagem de participantes `RESPONDIDO` sobre o total. O front NÃO SHALL recalcular preço, vencedor ou menor preço — tudo vem da API.

Enquanto a Cotação está `ABERTA`, a grade SHALL escutar atualizações em tempo real via **Server-Sent Events (SSE)** através de um endpoint no backend (e.g., `/api/cotacoes/{id}/ao-vivo/stream`); quando a Cotação deixa de estar `ABERTA`, a conexão SSE SHALL ser encerrada.

Cada célula SHALL permitir ao Comprador corrigir aquele lance a partir da grade (usando o `participanteId` que a célula carrega), abrindo o fluxo de correção de lance sem sair da tela.

Para suportar alto volume de dados, a grade SHALL manter o **cabeçalho fixo no topo** (nomes das Empresas) e a **coluna do item fixa à esquerda**, ambos com fundo opaco e uma hierarquia de z-index (células base abaixo, coluna do item acima, cabeçalho acima, canto de interseção no topo). A coluna "Item" SHALL usar peso de fonte reduzido (`font-normal`/`font-medium`), de modo que o foco visual recaia sobre os preços e status.

#### Scenario: Grade renderiza o estado das células
- **WHEN** o Comprador abre o detalhe de uma Cotação `ABERTA` com itens e Empresas convidadas
- **THEN** a grade é exibida diretamente, e cada célula mostra o status do lance daquela Empresa para aquele item, o preço quando `COTADO`, e o menor preço unitário do item aparece destacado; o cabeçalho mostra "respondidos / total"

#### Scenario: Polling liga em ABERTA e desliga fora
- **WHEN** a Cotação está `ABERTA`
- **THEN** a grade estabelece uma conexão SSE para receber eventos em tempo real; e quando a Cotação passa a `ENCERRADA`/`PEDIDOS_GERADOS`/`CANCELADA`, a conexão SSE é fechada

#### Scenario: Atualização reativa da grade
- **WHEN** a Cotação está `ABERTA` e o backend envia um evento de atualização via SSE (ex.: novo lance)
- **THEN** a grade atualiza imediatamente os dados exibidos sem precisar de recarregamento manual ou polling

#### Scenario: Corrigir lance pela célula
- **WHEN** o Comprador aciona uma célula da grade no detalhe
- **THEN** o fluxo de correção de lance abre para aquele `participanteId` e item, e ao confirmar a grade reflete o novo valor

#### Scenario: Cabeçalho e item permanecem visíveis ao rolar
- **WHEN** o Comprador rola verticalmente uma grade com 200+ itens, ou horizontalmente com 10+ Empresas
- **THEN** o cabeçalho com os nomes das Empresas permanece visível no topo e a coluna do nome do item permanece visível à esquerda, sem sobreposição

## ADDED Requirements

### Requirement: Ajuste de quantidade na grade

Enquanto a Cotação está `ABERTA` ou `ENCERRADA`, a grade SHALL exibir a `quantidadeSolicitada` de cada item e permitir ao Comprador alterá-la inline, chamando `PATCH /api/cotacoes/{id}/itens/{itemId}/quantidade`. Em `PEDIDOS_GERADOS` e `CANCELADA` a quantidade SHALL ficar somente leitura (não editável). Após salvar, a grade SHALL refletir a nova quantidade sem recarregar a página.

#### Scenario: Alterar quantidade na grade

- **WHEN** a Cotação está `ABERTA` (ou `ENCERRADA`) e o Comprador altera a quantidade de um item na grade e confirma
- **THEN** o `PATCH` é chamado e a grade passa a exibir a nova quantidade, sem recarregamento manual

#### Scenario: Quantidade somente leitura após apurar

- **WHEN** a Cotação está `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** a quantidade dos itens não é editável na grade
