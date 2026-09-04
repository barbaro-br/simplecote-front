## Context

A fileira de ações hoje é `<div className="flex flex-wrap items-center
gap-2">` com o botão de transição primária inline no início, e um
`<div className="ml-auto flex items-center gap-2">` no final contendo
Cancelar e Representantes. O `status === 'PEDIDOS_GERADOS'` usa um `<Link>`
estilizado como botão ("Ver resultado") no lugar do botão de transição.

## Decision

Tirar "Representantes" do `<div className="ml-auto ...">` e colocá-lo
**logo depois** do botão de transição primária, dentro do fluxo normal (sem
`ml-auto`), para os dois ficarem visualmente agrupados à esquerda:

```
[Abrir | Encerrar | Reabrir+Apurar | Ver resultado]  [Representantes]  .........  [Cancelar]
```

`status === 'CANCELADA'` continua sem "Representantes" (condição já
existente `status !== 'CANCELADA'` mantida). O `<div className="ml-auto
...">` passa a conter só o botão "Cancelar" (`status === 'RASCUNHO' ||
status === 'ABERTA'`).

## Alternatives Considered

- **Representantes sempre visível independente do status, inclusive
  CANCELADA**: fora de escopo — a condição atual (`status !==
  'CANCELADA'`) já é uma decisão existente do requirement, esta change só
  reposiciona, não muda quando o botão aparece.
