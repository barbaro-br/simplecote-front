## Context

`AdicionarItemModal.tsx` (usado hoje por `ItensSection.tsx`) já é um componente autocontido — produto, quantidade, submit — sem nenhuma checagem de status de Cotação embutida; ele só chama a API de adicionar item. `ItensSection` só é renderizada quando `status === 'RASCUNHO'` (em `ABERTA`/`ENCERRADA`, `GradeAoVivoContainer`/`GradeAoVivoTabela` ocupam esse espaço). No representante, `ItemLance.statusLance` (`cotacao-token.schema.ts`) já distingue `PENDENTE`/`COTADO`/`NAO_COTADO` por item; `cotacao-token.derivados.ts` já concentra funções puras derivadas desses dados (ex. `contarComPreco`).

## Goals / Non-Goals

**Goals:**
- Reusar `AdicionarItemModal` sem modificá-lo — só abrir mais um ponto de entrada pra ele.
- Dar ao representante um sinal de "isso é novo" sem exigir nenhum campo novo do backend nem rastrear "última visita".

**Non-Goals:**
- Não muda a grade ao vivo em si (`GradeAoVivoTabela`) — o botão de adicionar item fica ao redor dela, não dentro.
- Não usa `ItemGrid.criadoEm` (que a change do back também expõe) pro badge do representante — ver Decisions.

## Decisions

- **O indicador "Novo" é inferido por heurística de status, não por timestamp.** Alternativa considerada: usar `criadoEm` do item e comparar com algum marco de "última visita" do participante. Rejeitada por exigir rastrear e persistir "quando o representante viu a cotação pela última vez" — infraestrutura nova só pra isso. A heurística usada (`statusLance === 'PENDENTE'` enquanto pelo menos um outro item da mesma cotação já tem `COTADO`/`NAO_COTADO`) já responde exatamente "isso apareceu depois que eu comecei a responder": no primeiro acesso do representante nada está respondido ainda, então nada é destacado como "novo" (correto — nesse momento não existe distinção a fazer); depois que ele já respondeu alguns itens, qualquer item ainda `PENDENTE` se destaca.
- **`ItemGrid.criadoEm` (lado admin) continua sendo exposto pelo back mesmo sem uso imediato no front** — é um dado de auditoria/ordenação razoável de se ter, e não custa nada a mais manter no contrato da API.

## Risks / Trade-offs

- [Risco] A heurística do badge "Novo" pode "acender" num caso legítimo diferente: um representante que deixou um item pra trás de propósito (não é o cenário mais comum, mas existe) veria ele marcado como "novo" mesmo não sendo. Aceitável — o pior caso é um badge levemente impreciso, não um bug funcional; se isso incomodar na prática, a alternativa com timestamp fica disponível como evolução futura.
