## MODIFIED Requirements

### Requirement: Ajuste de quantidade na grade

Enquanto a Cotação está `ABERTA` ou `ENCERRADA`, a grade SHALL exibir a `quantidadeSolicitada` de cada item e permitir ao Comprador alterá-la tanto pelos botões `[-]`/`[+]` (ajuste de 1 em 1) quanto digitando o valor diretamente num campo numérico editável (confirmado ao perder o foco ou pressionar Enter), ambos chamando `PATCH /api/cotacoes/{id}/itens/{itemId}/quantidade`. Um valor digitado inválido (vazio, zero, negativo ou não numérico) NÃO SHALL disparar a chamada — o campo SHALL reverter ao último valor confirmado. Em `PEDIDOS_GERADOS` e `CANCELADA` a quantidade SHALL ficar somente leitura (não editável, nem pelos botões nem pelo campo digitável). Após salvar, a grade SHALL refletir a nova quantidade sem recarregar a página.

#### Scenario: Alterar quantidade na grade

- **WHEN** a Cotação está `ABERTA` (ou `ENCERRADA`) e o Comprador altera a quantidade de um item na grade e confirma
- **THEN** o `PATCH` é chamado e a grade passa a exibir a nova quantidade, sem recarregamento manual

#### Scenario: Quantidade somente leitura após apurar

- **WHEN** a Cotação está `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** a quantidade dos itens não é editável na grade

#### Scenario: Digitar a quantidade diretamente

- **WHEN** o Comprador clica no campo de quantidade de um item (Cotação `ABERTA` ou `ENCERRADA`), digita um novo valor inteiro válido e pressiona Enter (ou clica fora do campo)
- **THEN** o sistema chama o mesmo `PATCH` de atualização de quantidade com o valor digitado, e a grade passa a exibir o novo valor

#### Scenario: Valor inválido não é enviado

- **WHEN** o Comprador digita um valor vazio, zero, negativo ou não numérico no campo de quantidade e sai do campo
- **THEN** nenhuma chamada é feita à API e o campo volta a exibir o último valor confirmado

#### Scenario: Ajuste fino continua disponível pelos botões

- **WHEN** o Comprador clica em `[-]` ou `[+]` ao lado do campo de quantidade
- **THEN** a quantidade muda em 1 unidade e é confirmada, exatamente como antes — o campo digitável é um caminho adicional, não uma substituição
