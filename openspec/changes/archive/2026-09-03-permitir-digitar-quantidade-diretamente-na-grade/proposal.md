## Why

Achado verificado por leitura de código: na grade ao vivo (tela de
detalhe da Cotação), a quantidade solicitada de cada item só pode ser
alterada clicando `[-]`/`[+]` um a um (`aoAtualizarQuantidade(itemId,
quantidadeSolicitada ± 1)`). Para ajustes grandes (ex.: de 5 para 50),
isso significa dezenas de cliques — sobrecarga desnecessária quando o
Comprador sabe exatamente o número que quer.

## What Changes

- Trocar o `<span>` que hoje só exibe `item.quantidadeSolicitada` por um
  campo numérico editável (clique para focar, digita o valor, `Enter`
  ou perder o foco confirma) que chama `aoAtualizarQuantidade` com o
  valor digitado — mesma função e mesmo `PATCH` já usados pelos botões
  `[-]`/`[+]`, sem endpoint novo.
- Os botões `[-]`/`[+]` continuam existindo lado a lado, para o ajuste
  fino de 1 em 1 — o campo digitável é um caminho adicional, não uma
  substituição.
- Validação local: valor digitado deve ser um inteiro `>= 1` (mesma
  regra hoje aplicada pelo `disabled` do botão `[-]` quando
  `quantidadeSolicitada <= 1`); um valor inválido (vazio, zero, negativo,
  não numérico) não dispara `aoAtualizarQuantidade` e o campo volta a
  mostrar o último valor confirmado ao perder o foco.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Ajuste de quantidade na grade" —
  adiciona a edição direta por digitação, mantendo os botões `[-]`/`[+]`
  e a mesma regra de habilitação (`ABERTA`/`ENCERRADA` editável,
  `PEDIDOS_GERADOS`/`CANCELADA` somente leitura).

## Impact

- `src/admin/cotacoes/GradeAoVivoTabela.tsx`
