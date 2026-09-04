## 1. Componente Combobox

- [x] 1.1 Criar `src/shared/components/ui/combobox.tsx` exportando `Combobox({ options, value, onChange, placeholder, emptyMessage })`, usando `@base-ui/react` `Popover` (mesmo padrão de `src/shared/components/ui/menu-acoes.tsx`): gatilho estilizado como um `Input`/`Button` do design system mostrando o `label` da opção selecionada (ou `placeholder`), popup com campo de busca no topo e lista de opções abaixo.
- [x] 1.2 Filtro client-side: `useState` de texto de busca, lista exibida = `options.filter(o => o.label.toLowerCase().includes(filtro.toLowerCase()))`; exibir `emptyMessage` (ou um texto padrão) quando o filtro não encontra nada.
- [x] 1.3 Seleção por clique numa opção chama `onChange(option.value)` e fecha o popup.
- [x] 1.4 Navegação por teclado: seta para baixo/cima move um índice de opção "realçada" (destaque visual); Enter seleciona a opção realçada; Escape fecha o popup sem alterar `value`.
- [x] 1.5 Acessibilidade: gatilho com `aria-haspopup="listbox"`/`aria-expanded`, lista com `role="listbox"`, cada opção com `role="option"`/`aria-selected`.

## 2. Trocar o select em Nova Cotação

- [x] 2.1 Em `NovaCotacaoPage.tsx`: substituir o `<select id="origem" value={origemId} onChange={...}>` pelo `Combobox`, mapeando `cotacoesAnteriores` (ou a fonte de dados equivalente já usada) para `{ value: c.id, label: c.titulo }`.
- [x] 2.2 Manter `origemId`, o `disabled` do botão "Duplicar" (`!origemId || duplicar.isPending`) e a chamada `duplicar.mutateAsync(origemId)` sem alteração de comportamento.

## 3. Testes

- [x] 3.1 Teste do `Combobox` isolado: renderiza as opções, filtra ao digitar, chama `onChange` com o `value` correto ao clicar numa opção, fecha ao selecionar.
- [x] 3.2 Teste do `Combobox`: navegação por teclado (seta baixo destaca a próxima opção, Enter seleciona a realçada, Escape fecha sem chamar `onChange`).
- [x] 3.3 Atualizar `NovaCotacaoPage.test.tsx` (se existir teste cobrindo o modo "Duplicar existente"): trocar a interação de `select`/`fireEvent.change` para abrir o combobox, digitar/filtrar e clicar na opção — mesma asserção final de que `origemId` reflete a cotação escolhida e "Duplicar" habilita.
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [ ] 4.1 Testar manualmente (dev, com várias cotações cadastradas): abrir "Nova Cotação" → "Duplicar existente", abrir o combobox, digitar parte de um título e confirmar que a lista filtra corretamente; selecionar e confirmar que "Duplicar" funciona como antes.
