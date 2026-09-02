## ADDED Requirements

### Requirement: Painel utilizável em larguras estreitas

O shell administrativo SHALL permanecer utilizável, sem texto cortado ou elementos sobrepostos, em larguras comuns de tablet (a partir de ~768px) e celular. Abaixo de 768px, a sidebar SHALL iniciar colapsada (modo ícone) para preservar espaço para o conteúdo.

#### Scenario: Dashboard em 768px

- **WHEN** o admin abre `/admin` numa tela de ~768px de largura
- **THEN** os cards do dashboard (incluindo "Gastos") exibem seu conteúdo por completo, sem texto cortado ou sobreposto

#### Scenario: Sidebar inicia colapsada em tela estreita

- **WHEN** o admin abre qualquer rota `/admin/**` numa tela abaixo de 768px
- **THEN** a sidebar aparece no modo ícone (colapsada), sem consumir a largura total do modo expandido
