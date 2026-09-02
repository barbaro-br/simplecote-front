## Context

Ver `proposal.md`. Valores atuais em `GradeAoVivoTabela.tsx`: cabeçalho e primeira coluna usam `px-4 py-3`; cada célula de preço é um `<button>` com `min-h-[3rem]` (48px) + `px-3 py-2` internos, e dentro dele um bloco de rótulo de status (`mb-1`) seguido do preço.

## Goals / Non-Goals

**Goals:**
- Mais itens visíveis por scroll, sem rolar tanto quanto hoje.
- Preservar legibilidade dos valores (moeda, unidade) e do rótulo de status.

**Non-Goals:**
- Não torna a densidade configurável pelo usuário — é um ajuste fixo de padrão visual, diferente do "estilo de menu" (que é uma preferência, tratada em `menu-configuravel-lateral-ou-inferior`).
- Não muda a estrutura de colunas/dados exibidos, só o espaçamento.

## Decisions

- **Piso de `min-h-[2.5rem]` (40px) para a célula de preço, não menos.** Alternativa considerada: `2rem` (32px). Rejeitada — abaixo de ~40px o alvo de toque fica abaixo do recomendável (WCAG 2.5.8 pede ao menos 24px, mas essa tela é usada durante lances ao vivo sob pressão de tempo, então uma margem maior que o mínimo absoluto vale a pena) e o botão carrega duas linhas de texto (rótulo + preço) que ficariam espremidas demais abaixo disso.
- **Reduzir `py-3` → `py-2` no cabeçalho/primeira coluna, mas não abaixo disso** — mantém a leitura do nome do item e da empresa confortável; a maior parte do ganho de densidade vem da célula de preço (que se repete N vezes por linha), não do cabeçalho (que aparece uma vez).
- **Ajuste fino é visual, não só numérico** — os valores exatos de padding acima são um ponto de partida; a task de verificação final pede uma conferência visual (dev server) comparando antes/depois com uma cotação de muitos itens, não só a aplicação mecânica dos números.

## Risks / Trade-offs

- [Risco] Compactar demais pode prejudicar quem usa a tela num tablet/touch durante a cotação ao vivo → Mitigação: piso de `2.5rem` definido acima, e teste manual de clique/toque como parte da verificação final.
- [Risco] Este change deve ser aplicado depois de `fixar-sidebar-e-scroll-admin` para evitar conflito de edição no mesmo arquivo → Mitigação: ordem de execução já documentada no proposal; não aplicar fora de ordem.
