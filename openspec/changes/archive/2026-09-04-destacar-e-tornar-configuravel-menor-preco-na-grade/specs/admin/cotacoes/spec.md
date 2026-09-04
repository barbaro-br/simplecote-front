## ADDED Requirements

### Requirement: Destaque do menor preço respeita a configuração da loja e cobre o caso de um único lance
O destaque visual do menor preço unitário na Grade de Respostas (Ao Vivo) SHALL se aplicar à célula `COTADO` cujo `precoUnitario` for igual ao `menorPrecoUnitario` do item retornado pela API, **mesmo quando esse item tiver apenas um único lance `COTADO`** (nesse caso, o único preço é, por definição, o menor). O destaque SHALL ser exibido somente quando a preferência da loja "Destacar menor preço na grade ao vivo" (configurada em Configurações) estiver ligada; quando estiver desligada, nenhuma célula da grade SHALL exibir o destaque de menor preço, independentemente de quantos lances `COTADO` existirem para o item — as células continuam mostrando preço e status normalmente, só sem a cor/borda de destaque.

#### Scenario: Único lance do item recebe o destaque de menor preço
- **WHEN** um item da Cotação tem exatamente um representante com lance `COTADO` e a preferência de destaque está ligada
- **THEN** a célula desse único lance exibe o destaque visual de menor preço, da mesma forma que exibiria se fosse o menor entre vários lances

#### Scenario: Preferência desligada remove todo destaque de menor preço
- **WHEN** a preferência "Destacar menor preço na grade ao vivo" está desligada
- **THEN** nenhuma célula da grade (com um ou com vários lances `COTADO` por item) exibe o destaque visual de menor preço, mesmo que a API continue informando `menorPrecoUnitario`

#### Scenario: Preferência ligada mantém o comportamento existente com múltiplos lances
- **WHEN** a preferência está ligada e um item tem dois ou mais lances `COTADO` com preços diferentes
- **THEN** apenas a célula com o menor preço unitário exibe o destaque, como já acontecia antes
