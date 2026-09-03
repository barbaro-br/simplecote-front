## Context

`CotacaoDetalhePage.tsx` (linha ~140-188): um único `<div className="flex flex-wrap items-center gap-2">` contém, dependendo do status, os botões de transição primária (Abrir/Encerrar/Reabrir+Apurar) e, sempre, "Duplicar" (`variant="secondary"`, linha 179) e, exceto em `PEDIDOS_GERADOS`, "Cancelar" (`variant="destructive"`, aparece em 3 branches: 144-146, 154-156, 165-167). `MenuAcoes` (`src/shared/components/ui/menu-acoes.tsx`) já existe e já suporta `items: {label, onSelect, disabled?, variant?: 'default'|'destructive'}[]` — já usado em `CotacoesPage.tsx` pro mesmo tipo de ação secundária/destrutiva por linha.

`RepresentantesModal.tsx` (linha ~258): a área "Badges e Ações Direita" de cada linha é `shrink-0 flex items-center gap-3` — nunca quebra, forçando rolagem horizontal da lista inteira quando o conteúdo (2 badges + ações) não cabe.

## Goals / Non-Goals

**Goals:**
- Separar fisicamente a ação destrutiva ("Cancelar") das ações primárias de transição, sem quebrar nenhum fluxo existente (mesmos diálogos de confirmação, mesmas mutations).
- Reusar `MenuAcoes` (já existente, já com suporte a `variant: 'destructive'`) em vez de criar um componente novo.

**Non-Goals:**
- Não muda o fluxo de confirmação de "Cancelar" (`ConfirmarDialog`, já existente) — só de onde ele é acionado.
- Não mexe no botão "Representantes" nem nos botões de transição primária (Abrir/Encerrar/Reabrir/Apurar) — esses continuam de primeiro nível, são as ações mais frequentes da tela.

## Decisions

- **Um único `MenuAcoes` pra "Duplicar" + "Cancelar"**, não dois menus separados — as duas já são as únicas ações "secundárias" da tela (nem transição de estado primária, nem "Representantes"); agrupar num só menu é mais simples e seguue o mesmo padrão já usado em `CotacoesPage.tsx`.
- **"Cancelar" mantém `variant: 'destructive'` dentro do menu** (`MenuAcoes` já suporta isso nativamente) — a separação física do menu overflow já resolve o "nunca adjacente às ações primárias"; o destaque de cor dentro do menu continua sinalizando que é uma ação irreversível.
- **`RepresentantesModal`: `flex-wrap` na linha, não redesenho da linha** — menor mudança possível que resolve o corte de texto; a lista já tem espaço vertical suficiente pra acomodar uma segunda linha por item quando necessário.

## Risks / Trade-offs

- [Risco] "Cancelar" ficar um clique a mais (abrir o menu, depois clicar) — aceitável e é exatamente o objetivo: uma ação irreversível não deveria ser tão acessível quanto uma primária.
