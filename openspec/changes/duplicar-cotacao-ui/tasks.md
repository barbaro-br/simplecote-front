Todas as tarefas usam o hook `useDuplicarCotacao` de `cotacoes.api.ts` (já existe) e
os tipos `CotacaoDuplicada` / `ItemOmitido` (já existem). Nada muda em
`cotacoes.api.ts` / `cotacoes.schema.ts`. Verificação padrão: `npx tsc -b` +
`npx vitest run` + `npx oxlint` verdes; nenhum teste pré-existente regride.

## 1. Ação "Duplicar" na lista de cotações

- [x] 1.1 `src/admin/cotacoes/CotacoesPage.tsx`: adicionar uma coluna de ações (4ª `<td>`)
  com `<MenuAcoes>` (de `@/shared/components/ui/menu-acoes`) por linha, item **"Duplicar"**.
  Ajustar os `colSpan={3}` dos estados vazio/erro/skeleton para `4`. Verificar:
  `CotacoesPage.test.tsx` — a lista segue renderizando; o menu abre e tem "Duplicar".
- [x] 1.2 Ligar o item: `onSelect` chama `useDuplicarCotacao().mutate(c.id)`. Enquanto
  `isPending` para aquela linha, o item mostra "Duplicando…" e fica `disabled`. No
  sucesso, `navigate(`/admin/cotacoes/${data.cotacao.id}`, { state: { omitidos: data.omitidos } })`.
  Em erro `ApiError`, exibir a mensagem (linha de alerta acima da tabela, mesmo padrão
  de `CotacaoDetalhePage`), sem navegar; `SessaoExpiradaError` é ignorado.
  Verificar: `CotacoesPage.test.tsx` (MSW) — clicar "Duplicar" com sucesso navega para
  `/admin/cotacoes/<novo-id>`; `4xx` mostra a mensagem do backend e não navega.

## 2. Ação "Duplicar" no detalhe

- [x] 2.1 `src/admin/cotacoes/CotacaoDetalhePage.tsx`: adicionar um `Button` **"Duplicar"**
  na linha de ações (`<div className="flex flex-wrap gap-2">`), visível em qualquer
  status. Reusa `useDuplicarCotacao`; `isPending` → texto "Duplicando…" + `disabled`;
  sucesso → `navigate` com `state.omitidos` (igual 1.2); erro → usa o `erroAcao` que a
  tela já tem. Verificar: `CotacaoDetalhePage.test.tsx` — botão aparece; sucesso navega
  para o detalhe da nova; erro mostra em `role="alert"` e não navega.

## 3. Aviso de itens omitidos

- [x] 3.1 Em `CotacaoDetalhePage.tsx`, ler `useLocation().state?.omitidos` no mount. Se
  for um array não-vazio, exibir um bloco **não-bloqueante** (ex.: `role="status"`,
  tom neutro/aviso) acima das seções, listando cada `omitido` como `nome` — `motivo`.
  `omitidos` vazio/ausente → nada. O aviso some ao navegar para fora (não persiste).
  Verificar: `CotacaoDetalhePage.test.tsx` — montar com `initialEntries` carregando
  `state: { omitidos: [2 itens] }` → aparecem os 2 nomes + motivos; sem `state` → sem
  bloco.

## 4. Fechamento

- [x] 4.1 `npx tsc -b` + `npx vitest run` + `npx oxlint` com código 0; `CotacoesPage`,
  `CotacaoDetalhePage`, `PainelDashboard` e `ItensSection` sem regressão.
- [x] 4.2 `openspec validate duplicar-cotacao-ui --strict` sem erros.
