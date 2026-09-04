## Why

Na Grade de Respostas (Ao Vivo), o menor preço unitário de um item já é destacado em verde quando há 2 ou mais representantes com lance para aquele item — mas quando só 1 representante cotou aquele item, o preço aparece sem nenhum destaque, com fundo neutro, o que visualmente pode passar a impressão de "sem preço nenhum" à primeira vista. Além disso, o Comprador quer poder ligar/desligar esse destaque conforme a preferência da loja.

## What Changes

- Garantir que o destaque do menor preço unitário se aplique também quando um item tem apenas 1 lance `COTADO` (o único preço é, por definição, o menor) — hoje isso já deveria acontecer pela lógica existente, mas a experiência observada em uso não mostrou o destaque de forma confiável nesse caso; este change formaliza o comportorio esperado com um cenário de spec dedicado e corrige a implementação onde necessário.
- Adicionar uma nova opção em Configurações: "Destacar menor preço na grade ao vivo" (ligado/desligado), com "ligado" como padrão. Quando desligado, nenhuma célula da grade ao vivo recebe destaque de menor preço, independente de quantos representantes cotaram o item.

## Capabilities

### Modified Capabilities
- `admin/cotacoes`: a Grade ao vivo passa a respeitar a preferência de destaque de menor preço vinda da configuração da loja, e o destaque passa a se aplicar mesmo quando há apenas um lance `COTADO` para o item.
- `admin/configuracoes`: adiciona um novo requisito — a opção "Destacar menor preço na grade ao vivo" (ligado/desligado, padrão ligado).

## Impact

- `src/admin/cotacoes/GradeAoVivoTabela.tsx` (ou componente equivalente): lógica de destaque da célula deixa de depender implicitamente de "mais de um candidato" e passa a checar explicitamente a preferência de configuração.
- Tela e schema/mock de Configurações: novo campo `destacarMenorPrecoNaGrade` (boolean).
- Nenhuma mudança de API/backend — a preferência segue o mesmo padrão front-only já usado por `tema`/`estiloNavegacao` no mock de configurações.
