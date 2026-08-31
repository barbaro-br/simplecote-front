## Implementação

- [x] 1.1 Criar o estado `view: 'presets' | 'calendar'` em `AbrirCotacaoDialog.tsx`.
- [x] 1.2 Mover a renderização do `<Calendar>` e os seletores de horário para um bloco condicional `if (view === 'calendar')`.
- [x] 1.3 Esconder o bloco das pílulas e o texto do Header (ou adaptá-lo) quando `view === 'calendar'`.
- [x] 1.4 Modificar o botão "Personalizado" para que ele dispare `setView('calendar')`. Opcionalmente, atualizar o label dele para mostrar a data/hora selecionada caso já exista uma.
- [x] 1.5 Ajustar o rodapé para ter botões específicos na view de calendário ("Voltar" e "Confirmar Data").
- [x] 1.6 Remover classes que causam rolagem (`overflow-y-auto`, `max-h-[50vh]`) do container central, deixando a altura mais estável.
