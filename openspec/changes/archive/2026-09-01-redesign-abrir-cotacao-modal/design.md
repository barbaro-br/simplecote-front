## Technical Design

### Componentes UI (AbrirCotacaoDialog.tsx)
- Transformaremos o `Dialog` base para usar `className="p-0 overflow-hidden bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl relative"`.
- Adicionaremos um botão ou pill para os presets ("Hoje às 18h", "Amanhã às 12h", "Amanhã às 18h", "Personalizado").
- Presets devem calcular o timestamp programaticamente no front (ex: Date hoje com as horas settadas para 18).
- Se o preset for selecionado, esconde-se o input de datetime-local, que ficará atrás da aba "Personalizado". Se "Personalizado", exibe o input `type="datetime-local"` mas estilizaremos a classe dele para se alinhar ao form do sistema (ex: `bg-muted/40`).
- O cabeçalho terá um visual limpo e o botão final será verde chamativo (`bg-primary`).
