## Context

`ResultadoPage.tsx` já expande cada pedido inline (change
`unificar-cards-resultado-com-expansao-por-pedido`, arquivada), mostrando
por item: produto, preço da embalagem, preço unitário (com badge de
empate) e subtotal — todos vindos prontos de `resultado.data`. A margem
de lucro é uma conta pura de exibição por cima desses valores, sem
depender de nenhum campo novo da API.

AGENTS.md, regra 1 do domínio: "o front nunca decide regra de negócio:
valor derivado já vem pronto da API — só formata pra exibição, não
recalcula". A margem de lucro não viola isso: ela não recalcula nada da
apuração (vencedor, preço de custo, desempate) — é uma segunda conta,
claramente rotulada como sugestão, inteiramente derivada do preço de
custo que a API já mandou.

## Decision

**Estado**: `const [margemGlobal, setMargemGlobal] = useState<string>('')`
e `const [margensPorItem, setMargensPorItem] = useState<Record<string,
string>>({})` (chave = `item.id`, mesma chave já usada na `key` das
linhas expandidas). Os dois guardam string (não number) para não brigar
com o input controlado enquanto o usuário digita algo como "12," antes
de completar "12,5".

**Cálculo**: `precoDeVenda(precoCusto: number, margemStr: string):
number | null` — parseia `margemStr` (aceita vírgula ou ponto), retorna
`null` se vazio/inválido/negativo, senão `precoCusto * (1 +
parseFloat(margemStr.replace(',', '.')) / 100)`.

**Margem efetiva de um item**: `margensPorItem[item.id] ??
margemGlobal` — se o item nunca foi customizado, segue o global (e
muda junto se o global mudar); a partir do momento em que o usuário
edita o campo daquele item especificamente,
`margensPorItem[item.id]` passa a existir e "trava" aquele item no
valor customizado, independente do que acontecer com o global depois.

**UI**: campo "Margem de lucro (%)" acima da tabela de pedidos (ex.:
dentro do mesmo `Card`, acima do `<table>`, com um rótulo explicando
"aplica a todos os itens, ajustável por item" e um texto pequeno
reforçando que é só uma prévia, não afeta o pedido enviado). Na linha
expandida de cada item: uma nova coluna "Preço de venda" (unitário) com
um campo pequeno de margem % ao lado/abaixo mostrando o valor efetivo
daquele item (editável); quando não há margem (nem global nem do item),
a coluna mostra "—", sem quebrar o layout existente.

## Alternatives Considered

- **Persistir a margem (por produto ou nas configurações do
  Comprador)**: decidido explicitamente fora de escopo nesta rodada
  (confirmado com o usuário) — fica registrado em
  `docs/backlog-ux-2026-09-03.md` como evolução futura, caso o Comprador
  sinta falta de digitar a margem de novo toda cotação.
- **Enviar a margem para o backend calcular**: rejeitado — não há
  necessidade de ida-e-volta de rede para uma multiplicação simples, e
  manter isso 100% client-side reforça que é uma prévia pessoal do
  Comprador, não um dado do domínio.
- **Um só campo de margem (sem override por item)**: rejeitado — o
  pedido original já incluía a possibilidade de itens com margens
  diferentes (ex.: produtos com giro/concorrência diferentes), e o
  override por item é barato de implementar dado que a estrutura de
  estado (`Record<string, string>`) já cobre isso sem complexidade
  extra.
