## Technical Design

### Componentes UI (AbrirCotacaoDialog.tsx)
- Criar um estado `view: 'presets' | 'calendar'`. O modal inicia em `'presets'`.
- Na view `'presets'`: renderiza os botões como hoje, exceto que clicar em "Personalizado" não seta apenas o `tipoPrazo`, mas altera `setView('calendar')`.
- Na view `'calendar'`:
  - Renderiza apenas o `<Calendar>` e os `<select>` de horas e minutos de forma centralizada.
  - O rodapé muda: "Voltar" (seta view para 'presets') e "Salvar Data" (salva a data, altera o label da pílula Personalizado para exibir a data escolhida e seta view para 'presets').
- A barra de rolagem `overflow-y-auto` será removida pois o conteúdo será sempre de altura fixa ou previsível.
