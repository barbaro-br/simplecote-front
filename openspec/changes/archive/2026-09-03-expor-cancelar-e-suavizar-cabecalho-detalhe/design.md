## Context

```tsx
const acoesMenu = []
if (status !== 'CANCELADA' && status !== 'PEDIDOS_GERADOS') {
  acoesMenu.push({ label: 'Cancelar', onSelect: () => setDialog('cancelar'), variant: 'destructive' })
}
// ...
{acoesMenu.length > 0 && <MenuAcoes items={acoesMenu} />}
```
Backend (`Cotacao.cancelar()`): `if (status != RASCUNHO && status != ABERTA) throw ...` — só
`RASCUNHO`/`ABERTA` são realmente aceitos; a condição do front (`!== CANCELADA
&& !== PEDIDOS_GERADOS`) deixa passar `ENCERRADA` incorretamente.

Header atual: `sticky top-0 bg-background z-10 pb-4 pt-4 border-b border-border shadow-sm mb-6`.

## Goals / Non-Goals

**Goals:**
- "Cancelar" fica visível, mas mantém alguma proteção contra clique
  acidental via distinção visual e separação espacial (a pesquisa não é
  descartada, só ponderada contra a preferência explícita do usuário).
- "Cancelar" só aparece quando a ação é de fato aceita pelo backend.
- Cabeçalho sticky sem efeito de cartão elevado sobre a página.

**Non-Goals:**
- Não implementa notificação aos representantes no cancelamento (achado à
  parte, backend, fora de escopo).
- Não muda a cor de fundo global (`--background`/`--card`) — fica para uma
  change de design de tema separada.
- Não muda o texto/comportamento do diálogo de confirmação de cancelar
  (`ConfirmarDialog` com `dialog === 'cancelar'`) — continua igual.

## Decisions

- **Condição de exibição**: `status === 'RASCUNHO' || status === 'ABERTA'`
  (substitui a condição antiga baseada em exclusão), alinhada com
  `Cotacao.cancelar()`.
- **Estilo do botão**: `variant="outline"` com texto/borda na cor
  `destructive` (mesmo padrão visual já usado em botões de risco no app,
  ex.: `ConfirmarDialog`), não `variant="destructive"` sólido — visível mas
  sem o mesmo peso do preenchido, que ficaria mais chamativo que os botões
  de transição primária ao lado.
- **Posição**: fica separado do grupo de transição primária (Abrir/
  Encerrar/Reabrir/Apurar) por um espaçador (`ml-auto` ou equivalente),
  ficando ao lado de "Representantes" no fim da fileira — não colado ao
  botão de transição mais recente, reduzindo a chance de clique
  encadeado/acidental.
- **Header**: remover `shadow-sm`, manter `border-b border-border` — a
  borda já basta para separar visualmente o cabeçalho fixo do conteúdo ao
  rolar (mesmo objetivo do requirement "Cabeçalho sempre visível"), sem o
  efeito de elevação que lembra um card/chatbox flutuante.

## Risks / Trade-offs

- [Risco] Expor "Cancelar" reduz a proteção contra clique acidental que o
  menu overflow oferecia — mitigado por manter distinção visual (outline
  destructive, não preenchido) e separação espacial dos botões de
  transição, mais o diálogo de confirmação existente (friction step) que
  não muda.
