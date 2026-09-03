## Context

`GradeAoVivoTabela.tsx`, célula `COTADO` hoje:
```tsx
<div className="flex items-center justify-end gap-1.5 mb-0.5">
  <span className="text-[11px] font-medium uppercase tracking-wider text-primary">COTADO</span>
  {ehMenor && <span className="...">MENOR</span>}
</div>
{celula.status === 'COTADO' && celula.preco != null ? (
  <div className="flex flex-col">
    <span className="tabular-nums font-semibold ...">{moeda(celula.preco)}</span>
    <span className="text-xs text-muted-foreground tabular-nums">{moeda(celula.precoUnitario)} / un</span>
  </div>
) : (
  <span className="block text-muted-foreground/50 text-sm">—</span>
)}
```
A distinção de "menor preço" já existe via cor
(`bg-success/5 border-success/20 ring-1 ring-success/20` no botão da
célula, texto do preço em `text-success`) — o badge "MENOR" é redundante
com essa cor.

## Goals / Non-Goals

**Goals:**
- Reduzir a altura de cada célula/linha da grade, condensando pra uma
  linha de conteúdo.
- Manter a mesma informação (preço, preço unitário, se é o menor, status)
  só que transmitida com menos texto.

**Non-Goals:**
- Não muda a lógica de cálculo de `ehMenor` nem nenhum dado vindo da API.
- Não muda o fluxo de correção de lance (clique na célula continua abrindo
  o mesmo diálogo).
- Não mexe na coluna "Item" à esquerda.

## Decisions

- **Uma linha para `COTADO`**: `R$ {preco} · R$ {precoUnitario}/un`, preço
  da embalagem em destaque (`font-semibold`), preço unitário em tom
  secundário (`text-muted-foreground`), ambos na mesma linha, separados por
  um `·` (meio-ponto). Remove o rótulo "COTADO" (redundante — se tem preço,
  é cotado) e o badge "MENOR" (redundante com a cor verde já aplicada).
- **Uma linha para `PENDENTE`/`NAO_COTADO`**: mantém a pílula de status
  (já é a única informação relevante quando não há preço), remove a linha
  de traço "—" abaixo dela, que não acrescentava nada.
- **Cor continua sendo o único sinal de "menor preço"**: o botão da célula
  já aplica `bg-success/5 border-success/20 ring-1 ring-success/20` quando
  `ehMenor` — isso não muda, só o texto "MENOR" some.

## Risks / Trade-offs

- [Risco] Sem o texto "MENOR", um usuário com daltonismo a cores
  verde/vermelho pode ter mais dificuldade para identificar o vencedor só
  pela cor — mitigado parcialmente por manter o preço em `text-success`
  (não só o fundo) e a borda mais forte (`ring-1`), mas é uma limitação
  real de acessibilidade que fica registrada aqui; se vier a ser um
  problema, a mitigação seria reintroduzir um indicador não-textual
  (ex.: ícone de check) em vez do texto "MENOR".
