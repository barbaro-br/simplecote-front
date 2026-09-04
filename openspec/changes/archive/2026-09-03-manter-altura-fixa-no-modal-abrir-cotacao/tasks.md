## 1. Corrigir a altura

- [x] 1.1 Em `AbrirCotacaoDialog.tsx`: adicionar `min-h-[420px]` (mesmo valor da visualização de Data Personalizada) na `<div>` da visualização de presets (`animate-in fade-in slide-in-from-left-4 duration-300`).
- [x] 1.2 Se sobrar espaço vazio na visualização de presets com a nova altura mínima, ajustar o container pra distribuir o espaço de forma equilibrada (`flex flex-col justify-center` ou equivalente), em vez de deixar um vão preso embaixo.
- [x] 1.3 Conferir visualmente que a visualização de Data Personalizada continua com a mesma altura de antes (não deve encolher).

## 2. Testes

- [x] 2.1 Rodar a suíte completa (`npm test`) e confirmar 0 regressões (não deve haver teste de snapshot/altura quebrando).

## 3. Verificação visual

- [ ] 3.1 Testar manualmente (dev): abrir "Abrir Cotação" numa Cotação `RASCUNHO`, clicar em "Data Personalizada" e depois em voltar, observando que o modal não muda de tamanho perceptivelmente em nenhuma das duas transições.
