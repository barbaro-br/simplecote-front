## Context

Ver `proposal.md`. `BottomNavBar.tsx` hoje (`ITENS_FIXOS`, linha 15: 3 itens; `ITENS_MAIS`, linha 21: os outros 4) sempre renderiza 3 + "Mais", fixo, sem checar largura de tela. `AdminLayout.tsx` já tem o padrão de detecção de largura via `window.matchMedia('(max-width: 767px)')` (função `lerTelaEstreita`, com listener de `change`) usado pra decidir o comportamento da sidebar — mesmo breakpoint (768px) já em uso no projeto (`corrigir-responsividade-painel-admin`, `admin/layout` spec).

## Goals / Non-Goals

**Goals:**
- Em telas largas (≥768px), mostrar os 7 itens direto, sem "Mais".
- Reaproveitar o mesmo breakpoint e padrão de detecção já usados no projeto (consistência, não reinventar).

**Non-Goals:**
- Não muda o comportamento em telas estreitas (continua 3 + "Mais", já funciona bem ali).
- Não introduz um terceiro breakpoint intermediário (ex. tablet com 5-6 itens) — é tudo-ou-nada no mesmo corte de 768px já usado pelo resto do shell.

## Decisions

- **Reusa o breakpoint de 768px já estabelecido**, não inventa um novo. Alternativa considerada: um breakpoint próprio calculado pela largura real necessária pros 7 itens (ex. `min-width` medido). Rejeitada — adiciona complexidade (medir largura de conteúdo dinamicamente) para um ganho marginal; 768px já é o corte usado pelo resto do admin, e visualmente 7 itens cabem bem confortavelmente a partir daí.
- **Acima do breakpoint, o botão "Mais" desaparece completamente** (não fica vazio/desabilitado) — evita um elemento de UI sem função.

## Risks / Trade-offs

- [Risco] Duplicar a lógica de detecção de largura (já existe em `AdminLayout.tsx`, seria replicada em `BottomNavBar.tsx`) → Mitigação: aceito por ora, é pouca coisa (uma função + um `useEffect`); extrair para um hook compartilhado fica para se um terceiro lugar precisar do mesmo padrão.
