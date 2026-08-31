## Implementação

- [x] 1.1 Em `AbrirCotacaoDialog.tsx`, mudar as propriedades do `<Dialog>` para adicionar as classes glassmorphic (`backdrop-blur-xl`, `bg-background/80`, etc).
- [x] 1.2 Implementar o estado `tipoPrazo` (`'hoje_18'`, `'amanha_12'`, `'amanha_18'`, `'custom'`).
- [x] 1.3 Criar a UI de "Pílulas" (buttons) permitindo o usuário alternar entre os estados `tipoPrazo`.
- [x] 1.4 Modificar a função `confirmar()` para calcular e retornar o timestamp exato em ISO baseado na pílula escolhida (se não for `'custom'`).
- [x] 1.5 Ocultar ou desabilitar graciosamente o input `datetime-local` caso o tipo não seja `custom`, ou renderizá-lo com estilização melhorada se for `custom`.
