## 1. Expor "Cancelar" como botão visível

- [x] 1.1 Em `CotacaoDetalhePage.tsx`: remover o array `acoesMenu` e o `<MenuAcoes items={acoesMenu} />` (deixarão de ter uso — confirmar que `MenuAcoes` não é usado em mais nenhum lugar desta tela antes de remover o import).
- [x] 1.2 Adicionar um `Button` "Cancelar" com `variant="outline"` e uma classe de cor destrutiva (ex.: `text-destructive border-destructive/40 hover:bg-destructive/10`, seguindo o mesmo tom já usado em outros pontos de risco do app), com `onClick={() => setDialog('cancelar')}`.
- [x] 1.3 Condicionar a exibição desse botão a `status === 'RASCUNHO' || status === 'ABERTA'` (substituindo a condição antiga `status !== 'CANCELADA' && status !== 'PEDIDOS_GERADOS'`, que deixava passar `ENCERRADA` incorretamente).
- [x] 1.4 Posicionar o botão "Cancelar" separado do grupo de transição primária (Abrir/Encerrar/Reabrir/Apurar) — ex.: mover para o fim da fileira, ao lado de "Representantes", com um `ml-auto` ou espaçador equivalente entre os dois grupos.
- [x] 1.5 Manter o bloco `{dialog === 'cancelar' && <ConfirmarDialog .../>}` exatamente como está — só muda o que dispara `setDialog('cancelar')`.

## 2. Suavizar o cabeçalho sticky

- [x] 2.1 Em `CotacaoDetalhePage.tsx`, no container do cabeçalho (`sticky top-0 bg-background z-10 pb-4 pt-4 border-b border-border shadow-sm mb-6`): remover a classe `shadow-sm`, mantendo `border-b border-border`.

## 3. Testes

- [x] 3.1 Teste: numa Cotação `RASCUNHO`, o botão "Cancelar" aparece visível (não dentro de um menu).
- [x] 3.2 Teste: numa Cotação `ABERTA`, o botão "Cancelar" aparece visível.
- [x] 3.3 Teste: numa Cotação `ENCERRADA`, o botão "Cancelar" NÃO aparece (caso que antes tinha regressão — cobrir explicitamente).
- [x] 3.4 Teste: numa Cotação `PEDIDOS_GERADOS` ou `CANCELADA`, o botão "Cancelar" não aparece (sem regressão do comportamento já existente).
- [x] 3.5 Teste: acionar "Cancelar" ainda abre o `ConfirmarDialog` existente antes de chamar a API (sem regressão).
- [x] 3.6 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [x] 4.1 Testar com dados reais (dev): conferir visualmente que "Cancelar" fica separado dos botões de transição primária, com estilo de alerta discernível; confirmar que o cabeçalho não tem mais a sombra elevada, mantendo a borda inferior legível ao rolar a lista de itens. **(verificado visualmente pelo dono do produto em 05/09/2026)**
