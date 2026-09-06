## ADDED Requirements

### Requirement: Prévia do resultado no diálogo de Apurar

Ao abrir o diálogo de "Apurar" de uma Cotação `ENCERRADA`, o sistema SHALL carregar e exibir uma prévia do resultado a partir de `GET /api/cotacoes/{id}/apuracao/previa`: para cada Empresa que venceria, os itens ganhos e o total; e a lista dos itens que ficariam sem vencedor. A prévia SHALL ser carregada só quando o diálogo está aberto. Enquanto carrega, o sistema SHALL mostrar um estado de carregamento; em erro, SHALL exibir `ApiError.message`. O botão "Apurar" SHALL continuar disponível independentemente da prévia (ela é informativa, não bloqueia).

#### Scenario: Prévia aparece ao abrir o diálogo

- **WHEN** o admin aciona "Apurar" numa Cotação `ENCERRADA`
- **THEN** o diálogo carrega a prévia e mostra as Empresas vencedoras com seus itens/totais e os itens sem vencedor

#### Scenario: Erro na prévia não trava o diálogo

- **WHEN** a chamada da prévia falha
- **THEN** o diálogo mostra a mensagem de erro e o botão "Apurar" continua clicável

#### Scenario: Prévia só carrega com o diálogo aberto

- **WHEN** a tela de detalhe da Cotação está aberta mas o diálogo de "Apurar" não
- **THEN** nenhuma chamada à prévia é feita
