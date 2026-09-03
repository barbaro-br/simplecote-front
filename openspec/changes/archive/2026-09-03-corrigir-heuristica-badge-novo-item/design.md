## Context

`itemEhNovo(item, todosItens)` hoje:
```ts
if (item.statusLance !== 'PENDENTE') return false
return todosItens.some(i => i.itemCotacaoId !== item.itemCotacaoId && i.statusLance !== 'PENDENTE')
```
Isso conflata "este item ainda não foi respondido" com "este item foi
adicionado depois" — qualquer item PENDENTE vira "novo" assim que **um
irmão qualquer** deixa de ser PENDENTE, independente de quando cada item foi
criado.

## Goals / Non-Goals

**Goals:**
- O indicador "Novo" só aparece em itens genuinamente adicionados pelo
  comprador depois que o representante já estava vendo a cotação.
- Continuar sem exigir campo novo do backend (`ItemLanceResponse` não expõe
  `criadoEm` hoje — não vamos adicionar).

**Non-Goals:**
- Não persistir o "conjunto conhecido" entre sessões/recarregamentos — um
  reload de página é tratado como uma visita nova (mesmo espírito do
  Scenario "Primeiro acesso não marca nada como novo").

## Decisions

- **Conjunto de ids conhecidos capturado em `useRef`, no primeiro
  `cotacao.data` que chega**, dentro de `CotacaoPorTokenPage`. Não é
  `useState` — não precisa re-renderizar quando é preenchido, só precisa
  existir antes do próximo render usar `itemEhNovo`.
- **`itemEhNovo(item, idsConhecidos: Set<string>)`** — retorna
  `!idsConhecidos.has(item.itemCotacaoId)`. Item cujo id nunca esteve no
  conjunto inicial é novo; todo o resto (incluindo status de outros itens)
  deixa de importar.
- Um polling/refetch que traz um item cujo id não estava no conjunto inicial
  continua marcando esse item como novo pelo resto da sessão — não some
  sozinho, some só quando a página recarrega (mesmo comportamento observado
  hoje pro caso legítimo, só que agora sem falso positivo pros irmãos).

## Risks / Trade-offs

- [Risco] Se o representante mantém a aba aberta por muito tempo e o comprador
  adiciona um item, ele fica marcado "Novo" até a próxima recarga da página —
  aceitável, é o comportamento já existente para o caso verdadeiro-positivo.
