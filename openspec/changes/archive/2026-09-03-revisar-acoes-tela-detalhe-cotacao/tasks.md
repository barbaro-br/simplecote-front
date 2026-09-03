## 1. Menu overflow em CotacaoDetalhePage

- [x] 1.1 Importar `MenuAcoes` (`@/shared/components/ui/menu-acoes`) em `CotacaoDetalhePage.tsx`.
- [x] 1.2 Remover os botões "Duplicar" (linha ~179-181) e "Cancelar" (linhas ~144-146, 154-156, 165-167) como botões de primeiro nível.
- [x] 1.3 Adicionar um `<MenuAcoes items={...} />` no lugar, montando a lista dinamicamente: sempre `{ label: 'Duplicar', onSelect: aoDuplicar, disabled: acaoPendente }`; e, quando `status !== 'CANCELADA' && status !== 'PEDIDOS_GERADOS'` (mesma condição que hoje decide se "Cancelar" aparece), também `{ label: 'Cancelar', onSelect: () => setDialog('cancelar'), variant: 'destructive' }`.
- [x] 1.4 Confirmar que o fluxo de "Cancelar" continua abrindo o mesmo `ConfirmarDialog` já existente (`dialog === 'cancelar'`), sem nenhuma mudança na lógica de confirmação em si.

## 2. Quebra de linha no modal Representantes

- [x] 2.1 Em `RepresentantesModal.tsx`, na `<li>` de cada participante (linha ~198-207) e/ou no container "Badges e Ações Direita" (linha ~258, hoje `shrink-0 flex items-center gap-3`): permitir quebra (`flex-wrap`) quando o conteúdo não couber numa linha só, em vez de depender só da rolagem horizontal já existente na lista.

## 3. Testes

- [x] 3.1 Teste: "Duplicar" e "Cancelar" não aparecem mais como botões visíveis de primeiro nível; aparecem dentro do menu "⋯" ao abri-lo.
- [x] 3.2 Teste: acionar "Cancelar" pelo menu ainda abre o diálogo de confirmação existente.
- [x] 3.3 Teste: acionar "Duplicar" pelo menu ainda dispara a mesma mutation de duplicar.
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões (ajustar os testes existentes de `CotacaoDetalhePage.test.tsx` que hoje procuram os botões antigos).

## 4. Verificação visual

- [ ] 4.1 Conferir que o menu "⋯" abre/fecha corretamente e não corta na borda da tela em viewport estreito.
- [ ] 4.2 No modal Representantes, conferir numa cotação com participante `RESPONDIDO`/`VISUALIZOU` que a linha quebra corretamente em vez de cortar texto, em larguras estreitas e médias.
