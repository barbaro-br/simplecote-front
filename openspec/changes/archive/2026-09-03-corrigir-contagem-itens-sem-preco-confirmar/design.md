## Context

```ts
const [temPrecoLocal, setTemPrecoLocal] = useState<Record<string, boolean> | null>(null)
const [fonteSemeada, setFonteSemeada] = useState<CotacaoPorToken | null>(null)
if (cotacao.data && cotacao.data !== fonteSemeada) {
  setFonteSemeada(cotacao.data)
  setTemPrecoLocal(
    Object.fromEntries(cotacao.data.itens.map((i) => [i.itemCotacaoId, i.preco != null])),
  )
}
```
Esse padrão ("semeia do zero toda vez que a query muda") assume implicitamente
que qualquer nova resposta da API é sempre mais recente que o estado local —
o que não é garantido quando o React Query refaz o fetch em segundo plano
(foco de janela, reconexão, `usePullToRefresh`) enquanto um autosave próprio
ainda está em voo.

## Goals / Non-Goals

**Goals:**
- A contagem "N de T com preço" e o aviso de "itens sem preço" no modal de
  confirmação nunca retrocedem por causa de uma resposta desatualizada do
  servidor.
- Itens genuinamente novos (adicionados pelo comprador, trazidos por um
  refetch) continuam entrando no controle local corretamente.

**Non-Goals:**
- Não é escopo deste change configurar `staleTime`/`refetchOnWindowFocus`
  globalmente no React Query do projeto — o fix é local ao componente, na
  forma como ele consome os dados.
- Não muda os valores de preço exibidos (`d.itens`), que continuam vindo
  direto da query — só a contabilização local de "tem preço ou não".

## Decisions

- **Mesclar, não substituir**: ao receber uma nova `cotacao.data`, só
  adicionar ao `temPrecoLocal` as entradas cujo `itemCotacaoId` ainda não
  existe no mapa local. Uma entrada já existente (seja porque o
  representante editou, seja porque já foi semeada antes) nunca é
  sobrescrita por uma resposta de fetch subsequente.
- Isso é seguro porque toda edição do próprio representante já atualiza
  `temPrecoLocal` via `onPrecoChange` (chamado a cada keystroke em
  `ItemLanceCard`) — a fonte da verdade otimista já é local depois do
  primeiro toque no item; a semente do servidor só precisa cobrir os itens
  que o representante **ainda não tocou**.

## Risks / Trade-offs

- [Risco] Se um item for corrigido diretamente pelo admin (`corrigirLance`,
  fora do fluxo do representante) enquanto o representante está com a tela
  aberta e já tinha tocado naquele item antes, o `temPrecoLocal` local não
  vai refletir a correção do admin até a próxima recarga da página —
  aceitável: é uma situação rara (edição simultânea do mesmo item por dois
  atores) e o valor exibido do preço em si (`d.itens`) já reflete a
  correção; só a contagem "sem preço" ficaria potencialmente desatualizada
  nesse cenário raro, o que é uma troca aceitável frente ao bug atual (que
  acontece em qualquer edição normal).
