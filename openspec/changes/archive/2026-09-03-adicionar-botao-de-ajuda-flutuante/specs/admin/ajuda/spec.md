## ADDED Requirements

### Requirement: Botão flutuante de ajuda

O painel administrativo SHALL exibir um botão flutuante circular com ícone de interrogação, fixo no canto inferior direito, visível em todas as rotas `/admin/**` independentemente do scroll da página. Ao ser clicado, SHALL abrir um modal "Ajuda" com uma lista de perguntas frequentes em formato acordeão, cada uma expandindo sua resposta em texto ao ser clicada.

#### Scenario: Botão sempre visível

- **WHEN** o admin navega para qualquer rota `/admin/**` e rola o conteúdo da página
- **THEN** o botão flutuante de ajuda permanece visível no canto inferior direito, sem rolar junto com o conteúdo

#### Scenario: Abrir o painel de ajuda

- **WHEN** o admin clica no botão flutuante de ajuda
- **THEN** um modal "Ajuda" abre exibindo a lista de perguntas frequentes

#### Scenario: Expandir uma pergunta

- **WHEN** o admin clica numa pergunta da lista dentro do modal de ajuda
- **THEN** a resposta correspondente expande em texto abaixo da pergunta, sem navegar para outra tela

#### Scenario: Fechar o painel de ajuda

- **WHEN** o admin clica fora do modal, no botão de fechar, ou pressiona Escape
- **THEN** o modal de ajuda fecha
