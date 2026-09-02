## Context

Ver `proposal.md`. `AdminLayout.tsx` hoje: `isExpanded = !colapsada || isHovered` (linha 43), `colapsada` persistido em `localStorage` (`SIDEBAR_KEY`), sem nenhuma leitura de largura de tela. `PainelDashboard.tsx` usa `grid grid-cols-1 md:grid-cols-3` (linhas 48, 92) e `md:grid-cols-2` (linha 207) — `md:` no Tailwind é `min-width: 768px` do **viewport**, não da área de conteúdo.

## Goals / Non-Goals

**Goals:**
- Eliminar o corte/sobreposição real encontrado na auditoria em 768px.
- Corrigir a causa raiz (grid decidindo colunas pela largura errada), não só empurrar o breakpoint.

**Non-Goals:**
- Não é o mesmo trabalho de `menu-configuravel-lateral-ou-inferior` (escolha manual de estilo lateral/inferior) — este change é uma correção de bug, aplica-se independentemente de qual estilo o lojista escolher depois. Ver nota de relação abaixo.
- Não trata a barra inferior nem qualquer novo componente de navegação — só torna a sidebar atual utilizável em telas estreitas.

## Decisions

- **Sidebar força colapsada abaixo de 768px, toggle manual desabilitado nessa faixa.** Alternativa considerada: manter o toggle sempre disponível, deixando o usuário expandir manualmente mesmo em tela estreita. Rejeitada — é exatamente a ação que reproduz o bug (sidebar expandida em tela estreita é a causa do corte); melhor não oferecer a opção que quebra a tela.
- **Hover-to-expand (`isHovered`) também desabilitado abaixo de 768px** — em uma janela de desktop estreitada (não só celular/tablet touch), o mouse pode passar sobre a sidebar colapsada e reexpandir via hover, reintroduzindo o mesmo corte.
- **Grids de `PainelDashboard.tsx` convertidos para container queries** (`@container` no wrapper + variantes `@md:`/`@lg:` no lugar de `md:`/`lg:`) em vez de só ajustar o breakpoint numérico. Alternativa considerada: trocar `md:grid-cols-3` por um breakpoint maior (ex. `lg:grid-cols-3`, 1024px) para compensar a sidebar. Rejeitada — é um ajuste por tentativa e erro que quebra de novo se a largura da sidebar mudar no futuro (ex. com `menu-configuravel-lateral-ou-inferior`); container queries respondem à largura real do container pai, correto em qualquer combinação de largura de sidebar e viewport.
- **Relação com `menu-configuravel-lateral-ou-inferior`**: esta change resolve o problema de fundo (painel usável em tela estreita) independentemente de o lojista escolher, depois, o estilo "Inferior". A auditoria confirmou na prática o risco já documentado no design daquela change (padrão bottom-bar é pensado pra mobile, e hoje não existe tratamento mobile nenhum) — mas as duas changes são independentes: esta aqui é correção de bug (sidebar atual), a outra é feature nova (escolha de estilo).

## Risks / Trade-offs

- [Risco] Forçar colapso abaixo de 768px muda o comportamento pra qualquer usuário que hoje use o painel numa janela de desktop nessa faixa (não só celular/tablet) — pode ser notado como mudança de comportamento → Mitigação: é estritamente melhor que o corte de texto atual; documentar no changelog/release notes se houver.
- [Risco] Container queries exigem que o elemento pai declare `container-type` — se algum ancestral entre o grid e o `<main>` não propagar a largura corretamente, o comportamento pode não ser o esperado → Mitigação: testar visualmente nas mesmas larguras que reproduziram o bug (768px) antes de considerar a change concluída.
