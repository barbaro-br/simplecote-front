## MODIFIED Requirements

### Requirement: Painel utilizável em larguras estreitas

O shell administrativo SHALL permanecer utilizável, sem texto cortado ou elementos sobrepostos, em larguras comuns de tablet (a partir de ~768px) e celular. Abaixo de 768px, a navegação lateral SHALL ser substituída por um **drawer oculto**: uma topbar fixa exibe o nome da loja (ou o logotipo) e um botão de menu (hamburger) que abre a sidebar como gaveta sobreposta ao conteúdo; fechar o drawer (tocar fora, no X ou navegar para uma rota) SHALL recolhê-lo. O conteúdo SHALL ocupar a largura total da tela quando o drawer está fechado, e a página NÃO SHALL rolar horizontalmente por inteiro — tabelas e a grade mantêm sua rolagem horizontal própria. Acima de 768px, o comportamento atual de sidebar expandir/recolher SHALL ser preservado.

#### Scenario: Dashboard em 768px

- **WHEN** o admin abre `/admin` numa tela de ~768px de largura
- **THEN** os cards do dashboard (incluindo "Gastos") exibem seu conteúdo por completo, sem texto cortado ou sobreposto

#### Scenario: Sidebar inicia colapsada em tela estreita

- **WHEN** o admin abre qualquer rota `/admin/**` numa tela abaixo de 768px
- **THEN** a sidebar não aparece inline ocupando a tela — ela fica oculta no drawer, acessível pelo botão de menu da topbar, deixando o conteúdo em largura total

#### Scenario: Menu hamburger abre o drawer em tela estreita

- **WHEN** o admin abre qualquer rota `/admin/**` numa tela abaixo de 768px e aciona o botão de menu na topbar
- **THEN** a sidebar aparece como gaveta sobreposta, com os mesmos itens de navegação, e o conteúdo atrás permanece no lugar

#### Scenario: Drawer fecha ao navegar

- **WHEN** o drawer está aberto numa tela estreita e o admin aciona um item de navegação (ou o botão de fechar/fora da gaveta)
- **THEN** o drawer recolhe e a rota navega normalmente, com o conteúdo em largura total

#### Scenario: Página não rola horizontalmente em 375px

- **WHEN** o admin abre uma rota com tabela densa (ex.: Cotações) numa tela de ~375px
- **THEN** a página em si não apresenta rolagem horizontal — apenas a tabela rola horizontalmente dentro de sua área
