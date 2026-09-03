## 1. Reestruturar o bloco de preço no card

- [x] 1.1 Em `ItemLanceCard.tsx` (bloco `<div className="flex items-center gap-2">`, linha ~211-237): trocar a caixa do input de preço da embalagem por uma coluna (`flex flex-col`) com um rótulo pequeno "P.CX" (`text-[9px] uppercase text-muted-foreground font-medium`, mesmo estilo já usado no rótulo "Novo") acima da caixa do input, mantendo o input e o "R$" como estão hoje dentro da caixa.
- [x] 1.2 Trocar o `<span>` do preço unitário (`unidade. R$ {unitario}`) por uma coluna semelhante: rótulo "P.UN" acima, e só o valor (`R$ {unitario}` ou o fallback `—`/"calculando…") abaixo — remover o prefixo textual "unidade." (o rótulo "P.UN" já cumpre esse papel). Manter a mesma condição de peso visual (`text-sm font-semibold text-foreground` quando há valor, `text-[11px] text-muted-foreground` no fallback).
- [x] 1.3 Ajustar o `gap`/alinhamento do bloco pra caber as duas colunas mais o `VistoStatus` numa largura razoável, sem forçar `md:w-24` fixo que já se provou insuficiente — usar largura automática (`w-auto`/`min-w-fit`) já que o texto agora é mais curto ("R$ 0,34" em vez de "unidade. R$ 0,34").

## 2. Reforço no tutorial

- [x] 2.1 Em `TutorialOnboarding.tsx`: no primeiro passo (anatomia do card), adicionar uma linha curta explicando "P.CX = preço da caixa/embalagem, P.UN = preço por unidade (calculado automaticamente)".

## 3. Testes

- [x] 3.1 Teste: o card renderiza os rótulos "P.CX" e "P.UN" nas posições esperadas.
- [x] 3.2 Teste: o preço unitário continua sendo renderizado como texto (não input) e o valor calculado aparece corretamente.
- [x] 3.3 Ajustar testes existentes de `ItemLanceCard.test.tsx` que hoje buscam o texto antigo "unidade." (se algum existir).
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3.5 Ajuste de alinhamento (achado ao testar ao vivo)

- [x] 3.5.1 Em `ItemLanceCard.tsx`: os dois containers de coluna (`P.CX`, linha ~212, e `P.UN`, linha ~238) usam `items-end`, alinhando o rótulo à direita da coluna — mas o conteúdo do campo abaixo (a caixa do input, que tem "R$" alinhado à esquerda dentro dela) fica com largura maior que o texto do rótulo, então o rótulo não fica centralizado sobre o campo que ele descreve. Trocar `items-end` por `items-center` nos dois containers, pra o rótulo ficar centralizado horizontalmente sobre o campo/valor abaixo dele (a caixa do input no caso do P.CX, o texto do valor no caso do P.UN).
- [x] 3.5.2 Conferir que os dois rótulos ("P.CX", "P.UN") continuam na mesma altura entre si, e os dois campos (input, valor unitário) também continuam na mesma altura entre si — isso já deve ser garantido pelo `items-end` do container pai (linha 211), que não muda.

## 3.6 Caixinha no preço unitário (achado ao testar ao vivo)

- [x] 3.6.1 Em `ItemLanceCard.tsx`: o `<span>` do valor de P.UN (linha ~242-250) hoje é texto solto, sem nenhuma moldura — dando menos consistência visual com a caixa do input de P.CX ao lado. Envolver o valor numa caixinha com o mesmo formato da caixa do input (`rounded-lg border border-border px-2 py-1`), mas **sem** os estados interativos que só fazem sentido pra campo focável (`focus-within:border-muted-foreground`, já que não é um campo). Manter a distinção de hierarquia já validada: o texto dentro continua sem estilo de input (sem cursor, sem placeholder), só a moldura ao redor fica visualmente parecida com a do P.CX.
- [x] 3.6.2 Conferir que a altura da caixinha do P.UN fica igual à altura da caixa do input de P.CX, pra manter os dois blocos alinhados na mesma linha (o container pai já usa `items-end`, então as duas caixas devem ter a mesma altura pra ficar visualmente parelhas).

## 4. Verificação visual

- [x] 4.1 Testar com dados reais (dev), nome de produto longo + preço com muitas casas: confirmar que "P.CX"/"P.UN" e seus valores não transbordam nem sobrepõem o ícone de status, em viewport estreito e largo.
- [x] 4.2 Confirmar que o código de barras (quando o produto tem) continua visível e não conflita com os novos rótulos.
