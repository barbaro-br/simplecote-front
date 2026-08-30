## Context

Ver `proposal.md — Why`. Estado que define a abordagem:

- **Fundação já feita (PR #5, em `main`):** `Button` ganhou variante `secondary` +
  `gap` de ícone; novos `Card`/`CardHeader`/`CardTitle` e `Skeleton` em
  `src/shared/components/ui/`. `CotacoesPage` já foi re-estilizada (pills, busca,
  skeleton, Card, estados de vazio/erro).
- **Tokens:** `src/index.css` — `@theme inline` + `:root` (claro) + `.dark` +
  `.tema-claro` (subárvore do representante). oklch. `--primary` verde
  `oklch(0.42 0.09 155)`. `--radius: 0.625rem`. Fonte Geist via `@fontsource-variable/geist`.
- **Primitivos:** `src/shared/components/ui/` é hand-rolled no estilo shadcn
  (`button`, `input`, `card`, `skeleton`, `dialog`, `icon-button`, `menu-acoes`,
  `toggle-duplo`). Existe `components.json`, mas os componentes são customizados;
  **não** rodar `shadcn add` (puxa deps Radix). Primitivas de acessibilidade =
  `@base-ui/react` (`^1.7.0`).
- **Telas que existem e são só re-estilizadas** (com testes): `AdminLayout`,
  `LoginPage`, `CotacaoDetalhePage`+`ItensSection`+`ParticipantesSection`+`RespostasSection`,
  `GradeAoVivoPage`+`GradeAoVivoTabela`, `UltimaCompraPopover`, `ResultadoPage`,
  `NovaCotacaoPage`, `ProdutosPage`+`ProdutoForm`, `EmpresasPage`+`EmpresaForm`,
  `CotacaoPorTokenPage`+`ItemLanceCard`, `PedidoPorTokenPage`.
- Comportamento é do spec: `openspec/specs/admin/cotacoes/spec.md` e
  `openspec/specs/representante/cotacao/spec.md`. Esta change não os altera.

## Goals / Non-Goals

**Goals:**
- Todas as telas no mesmo sistema visual da fundação: uso de cor por token, escala
  de espaçamento, `Card` em blocos, `Skeleton` no carregando, badge pill de status,
  hierarquia de botão, estados de vazio/erro consistentes.
- Zero mudança de comportamento; testes verdes em cada tela.

**Non-Goals:**
- Criar componente novo de tela (`MobileLayout`, `QuoteItemCard` etc.) — os padrões
  já estão nos arquivos; extrair um componente compartilhado só se ≥2 telas usarem
  o mesmo, decidido na implementação.
- Dependência nova (nada de `@radix-ui/*`).
- Redesenho do dark mode do admin; features de Fase 3; walkthrough.

## Decisions

### D1. Re-estilizar in place — editar os arquivos que existem, não recriar

Cada tela = edição de markup/classes Tailwind no arquivo atual, preservando props,
handlers, `data-*`/roles que os testes usam. Onde um teste depende de um seletor de
layout que muda (ex.: `<select>` → pills), ajusta-se a asserção — como no PR #5.

Alternativa descartada: reescrever telas do zero com mock data e depois religar API.
É o que o rascunho do Antigravity propunha; joga fora código testado.

### D2. Popover da "última compra" fica sem dep nova

`UltimaCompraPopover.tsx` já existe (hover popover). Mantém-se o hand-rolled, ou
migra-se para `@base-ui/react` (tem `Popover`) se precisar de posicionamento/a11y
melhor. **Não** entra `@radix-ui/react-popover` — conflita com a escolha
`@base-ui/react` já feita no repo.

### D3. Estender a fundação, não forkar

Se uma tela pede um estilo de botão/card/badge que a fundação não tem, adiciona-se a
variante em `src/shared/components/ui/*` (como o `secondary` do PR #5). Não se cria
um `Button2` local.

### D4. Um PR por tela (ou grupo pequeno), verde a cada

Ordem sugerida, do mais visível ao menos: `AdminLayout` → `LoginPage` →
`CotacaoDetalhePage` (+3 sections) → `GradeAoVivoTabela` + `UltimaCompraPopover` →
`CotacaoPorTokenPage` + `ItemLanceCard` → `PedidoPorTokenPage` →
`Resultado`/`NovaCotacao` → `Produtos`/`Empresas` (+ forms). Cada PR:
`tsc -b` + `npx vitest run` + `npx oxlint` verdes.

### D5. Restrições por superfície (do spec, não relaxar)

- **Representante:** mobile-first (~`max-w-md`), **tema claro forçado** (`.tema-claro`),
  sem nav, header sticky + barra de ação sticky, alvos de toque ≥ 48px, estados de
  sync por campo.
- **Admin:** desktop, sidebar recolhível, claro + escuro.
- pt-BR; `R$` pt-BR; datas America/Sao_Paulo. Front não recalcula (preço unitário,
  vencedor, menor preço vêm da API).

## Risks / Trade-offs

- **Regressão numa tela densa** (`GradeAoVivoTabela`, `CotacaoDetalhePage`) →
  PR isolado + testes; a lógica não é tocada, só classes/markup.
- **Ajuste de token no `index.css` afeta telas já feitas** (`CotacoesPage`) →
  mudança de token entra em PR próprio, com olhada rápida nas telas prontas.
- **Escopo grande (12+ arquivos)** → a change é a lista; cada tela fecha sozinha,
  dá pra parar a qualquer PR sem deixar nada quebrado (só inconsistência visual
  temporária, que já é o estado atual).

## Migration Plan

Incremental por PR (D4). Sem migração de dado, sem flag. Rollback = reverter o PR
da tela.
