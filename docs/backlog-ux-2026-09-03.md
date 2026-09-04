# Backlog de UX — baixa prioridade / em aberto

> Itens levantados na auditoria do Gemini (`ux-audit.md`) e em conversa, verificados
> mas conscientemente **não** formalizados como OpenSpec change ainda. Revisar quando
> o backlog de prioridade alta estiver zerado.

## Rejeitado — não fazer

- **Atalhos de teclado (Escape fecha modal, Enter confirma)** — pedido explícito do
  usuário para não fazer.
- **Cálculo otimista de P.UN no front (representante)** — contraria o princípio do
  projeto de que o front nunca recalcula preço; o backend é a fonte da verdade.

## Baixa prioridade — polimento genérico

- Zebra striping em tabelas densas (`GradeAoVivoTabela`, `ItensSection`).
- Toast universal de sucesso/falha em toda ação de CRUD do admin.
- `AnalisesPage`: acessibilidade de gráficos (tabela `sr-only` com os mesmos dados),
  empty states com CTA em vez de "Nada por aqui" genérico, seletor de período
  customizável (hoje só presets fixos: 7/30/90 dias, Este mês).

## Em aberto — precisa de decisão de escopo antes de formalizar

- **Catálogo de Produtos — clique no produto para ver "últimas compras"**: um
  painel/modal com o histórico de cotações em que aquele produto apareceu, preço e
  fornecedor vencedor. Faz sentido como valor, mas é feature nova (consulta de
  backend + UI nova), não polimento — tratar como change própria.
- **Resultado da apuração — mostrar quantidade na linha expandida do pedido**: fácil,
  o backend já manda `quantidade` por item (usado no XLSX). Baixo risco, pendente só
  de ser incluído numa próxima leva.
- **Resultado da apuração — editar quantidade depois de apurado**: dúvida do usuário
  sobre se faz sentido no fluxo. Recomendação: não editar um pedido já gerado (preço
  e quantidade ficam travados do resultado, mudar depois sem reconfirmação do
  fornecedor é arriscado); se a necessidade for real, o lugar certo é permitir o
  ajuste **antes** de gerar o pedido, ainda dentro da apuração. Não formalizado —
  aguardando decisão.
- **Margem de lucro no Resultado**: campo de margem % para prever o preço de venda
  do comprador (global e/ou por item) na tela de apuração/resultado, só para
  visualização (nunca enviado ao fornecedor, nunca persistido na v1). Ver discussão
  completa na sessão de 2026-09-03 — v1 (global, efêmero) recomendado como primeiro
  passo.
