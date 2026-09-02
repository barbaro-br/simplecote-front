# admin/analises Specification

## Purpose

Aba de análise de compras do painel do admin (`/admin/analises`): uma superfície de exploração — diferente do monitor da tela inicial — onde o Comprador escolhe um período e enxerga o gasto por Empresa, o item mais e o menos comprado, e os últimos preços unitários por produto, lendo `GET /api/analises/compras`.

## Requirements

### Requirement: Análise de compras por período

A aba `/admin/analises` SHALL oferecer um seletor de período (presets de 7, 30 e 90 dias e "este mês", além de intervalo customizado) e SHALL carregar `GET /api/analises/compras?de=&ate=` com o intervalo escolhido, restrito ao Comprador autenticado. A aba SHALL ser somente leitura e não SHALL derrubar a navegação quando a chamada falhar.

A aba SHALL apresentar:
- o **total gasto no período** (soma dos `totais`) em destaque;
- o **gasto por Empresa** (`totais`, cada entrada com `empresa` e `total`), em barras proporcionais ordenadas do maior para o menor;
- o **item mais comprado** e o **item menos comprado** (`itemMaisComprado`/`itemMenosComprado`, cada um com `nome` e `quantidade`);
- a tabela de **últimos preços por produto** (`ultimosPrecos`, cada linha com `produto`, `precoUnitario`, `empresa` e `data`), com valores monetários em pt-BR e datas em `America/Sao_Paulo`.

Um período sem compras SHALL exibir um estado vazio claro, sem valores inventados.

#### Scenario: Período com compras

- **WHEN** o admin abre `/admin/analises` e escolhe um período em que houve cotações apuradas
- **THEN** a aba mostra o total gasto, o ranking de gasto por Empresa, o item mais e o menos comprado, e a tabela de últimos preços por produto

#### Scenario: Período sem compras

- **WHEN** o admin escolhe um período sem nenhuma compra apurada
- **THEN** a aba mostra um estado vazio claro, com total zerado e listas vazias

#### Scenario: Falha não derruba a aba

- **WHEN** `GET /api/analises/compras` responde com erro ou a rede está indisponível
- **THEN** a aba mostra uma mensagem de erro discreta e permanece navegável (a sidebar e as demais telas continuam funcionando)

#### Scenario: Trocar de período recarrega

- **WHEN** o admin muda o período selecionado
- **THEN** a aba refaz a chamada com o novo intervalo (`de`/`ate`) e atualiza os números
