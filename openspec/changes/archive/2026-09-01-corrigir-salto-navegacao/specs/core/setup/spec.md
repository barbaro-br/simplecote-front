## ADDED Requirements

### Requirement: Reset de scroll na navegação
A aplicação SHALL resetar a posição de scroll para o topo ao navegar entre rotas do painel (`/admin/**`), sem que o conteúdo da nova tela apareça deslocado para baixo ou "salte". Ao usar o back/forward (POP) do navegador, a posição de scroll anterior SHALL ser restaurada.

#### Scenario: Navegação entre telas do painel
- **WHEN** o usuário navega de uma tela do painel para outra (ex.: `/usuarios` → `/cotacoes`)
- **THEN** a nova tela abre com o scroll no topo, sem deslocamento ou salto visível

#### Scenario: Voltar restaura a posição
- **WHEN** o usuário usa o botão voltar (back) do navegador
- **THEN** a tela anterior reaparece na posição de scroll em que estava
