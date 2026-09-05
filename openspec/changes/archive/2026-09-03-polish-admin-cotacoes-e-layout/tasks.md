## 1. Nomenclatura de status no Dashboard

- [x] 1.1 Em `PainelDashboard.tsx:34`: trocar `rotulo: 'Apurada'` por `rotulo: 'Pedidos gerados'` na entrada `{ chave: 'apurada', status: 'PEDIDOS_GERADOS', ... }`.
- [x] 1.2 Teste: o pipeline de status renderiza "Pedidos gerados" para o segmento `PEDIDOS_GERADOS`.

## 2. Preset de prazo vencido em "Lançar Cotação"

- [x] 2.1 Em `AbrirCotacaoDialog.tsx`: para cada preset (`hoje_18`, `amanha_12`, `amanha_18`), calcular se o horário resultante já passou (`calcularPrazoIso(id, ...) < Date.now()`), e aplicar `disabled` no botão correspondente quando vencido (com estilo visual de indisponível).
- [x] 2.2 Trocar o valor inicial de `tipoPrazo` (hoje sempre `'hoje_18'`) para o primeiro preset ainda válido na ordem `hoje_18 → amanha_12 → amanha_18` (calculado uma vez, na inicialização do componente).
- [x] 2.3 Teste: com o relógio mockado depois das 18h, o preset "Hoje às 18h" aparece desabilitado e não é o selecionado por padrão.
- [x] 2.4 Teste: com o relógio mockado antes das 18h, o comportamento atual (preset "Hoje às 18h" disponível e selecionado) continua igual.

## 3. Subtítulo do modal "Adicionar Produtos"

- [x] 3.1 Em `AdicionarItemModal.tsx`: recalcular `qtdSelecionados` combinando `itensMap` com `drafts` — um produto conta se (está em `itensMap` E não tem draft de remoção `0`) OU (tem draft positivo, esteja ou não em `itensMap`).
- [x] 3.2 Teste: marcar 2 checkboxes num modal de cotação sem itens atualiza o subtítulo para "2 produtos na cotação" imediatamente, sem precisar clicar "Concluído".
- [x] 3.3 Teste: desmarcar um item que já estava na cotação decrementa o subtítulo imediatamente.

## 4. Confirmação ao "Encerrar"

- [x] 4.1 Em `CotacaoDetalhePage.tsx`: trocar o `onClick` do botão "Encerrar" (hoje `executar(() => encerrar.mutateAsync())`) para `setDialog('encerrar')`, seguindo o mesmo padrão usado por `apurar`/`cancelar`.
- [x] 4.2 Adicionar o bloco `{dialog === 'encerrar' && (...)}` com um diálogo de confirmação simples, nomeando a consequência (para de aceitar respostas; pode ser reaberta depois) — tom mais leve que os diálogos de `apurar`/`cancelar`, já que é reversível.
- [x] 4.3 Teste: acionar "Encerrar" abre o diálogo de confirmação em vez de chamar a API direto; confirmar chama `encerrar.mutateAsync()`.

## 5. Nome da loja truncado na sidebar

- [x] 5.1 Localizar o componente do cabeçalho da sidebar (shell administrativo, `AdminLayout.tsx` ou componente de sidebar por ele usado) e ajustar o container do nome da loja para `flex-1 min-w-0` (ou equivalente), garantindo que ele ocupe o espaço realmente disponível ao lado do ícone e do botão de recolher, em vez de uma largura fixa menor.
- [x] 5.2 Verificação visual (achado ao testar ao vivo): a sidebar tem largura fixa (`w-64`, 256px) **independente da largura da viewport** — o redistribuição de espaço (5.1) por si só não é suficiente pra "Sara Supermercado" caber por completo nesse espaço fixo junto do ícone e do botão de recolher. Corrigido reduzindo a fonte do nome (`text-xl` → `text-lg`) e adicionando `title={nome}` no `<span>`, para que o nome completo fique disponível via tooltip nativo ao passar o mouse quando truncado. A spec foi ajustada para refletir esse comportamento esperado (truncamento + tooltip), em vez de prometer que qualquer nome comum cabe por completo.

## 6. Verificação geral

- [x] 6.1 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
- [x] 6.2 Testar com dados reais (dev) os 5 pontos acima, um a um, confirmando visualmente cada correção. **(verificado visualmente pelo dono do produto em 05/09/2026)**
