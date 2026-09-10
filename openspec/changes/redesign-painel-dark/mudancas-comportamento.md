# Mudanças de comportamento — redesign-painel-dark

Registro de tudo que **muda o que o sistema faz** (não só a aparência) durante
o redesign. Carta branca do fundador para melhorar UX/fluxos; aqui fica a
trilha para ninguém ser pego de surpresa ao testar.

Formato: `[commit]` — o que mudou · antes → depois · por quê.

---

## Fluxo de cotação

- **`fa04631` / `2607446` — Nova cotação sem wizard.**
  Antes: `/admin/cotacoes/nova` criava a cotação e abria um wizard de 3 passos
  (Itens → Representantes → Prazo & revisar). Depois: cria a cotação (só o
  título) e navega direto para `/admin/cotacoes/:id` em RASCUNHO — a montagem
  (adicionar itens, convidar fornecedores, definir prazo e abrir) acontece toda
  inline na própria tela da cotação. O botão "Montar direto na tela de detalhe"
  deixou de existir (virou o padrão).

- **`96e2359` — Tela da cotação é uma superfície só.**
  Antes: barra de cabeçalho + card de itens + container de grade eram blocos
  separados, e as ações ficavam numa fileira de botões no topo. Depois: uma
  superfície única, igual em todos os estados, com um **único botão primário
  por estado** no rodapé (Abrir → Encerrar → Apurar → Ver resultado) e o
  secundário (Cancelar/Reabrir) ao lado. Os fornecedores convidados aparecem
  como **chips** logo abaixo do cabeçalho (antes: só um texto "N de M convites
  entregues"). Nenhuma rota ou endpoint mudou.

## Tela do representante (`/cotacao/:token`)

- **`687799b` — Grade no lugar dos cards.**
  Antes: um card por item com campos P.CX / P.UN e um "visto" (verde/vermelho).
  Depois: uma tabela — coluna "Seu preço" editável + "Unitário" calculado. O
  autosave (debounce 800ms, fila offline, "não cotado") é o mesmo.

- **`687799b` — Limpar um preço agora é um botão ×.**
  Antes: deslizar o card para a esquerda limpava o preço. Depois: um botão ×
  ao lado do campo (o toast "Desfazer" continua). Motivo: gesto de swipe não
  cabe bem numa linha de tabela e era pouco descoberto.

- **`569ef59` — Sem tutorial de primeira visita.**
  O onboarding de 3 telas (`TutorialOnboarding`) foi removido: ele descrevia a
  UI antiga ("P.CX/P.UN", "deslize para limpar") que não existe mais. A tabela
  de preços dispensa tutorial.

## Melhorias de usabilidade (carta branca)

- **Fornecedores escolhidos em RASCUNHO aparecem como chips na tela.** Antes,
  ao marcar fornecedores no modal "Representantes" numa cotação em RASCUNHO,
  a seleção sumia da vista assim que o modal fechava (só ia pro servidor no
  "Abrir"); pra conferir quem tinha marcado era preciso reabrir o modal.
  Agora os selecionados aparecem como chips logo abaixo do cabeçalho, cada um
  com um × pra tirar, e a linha "N fornecedores" da faixa de contexto passa a
  contar a seleção. Nada muda no back — o convite continua disparando só no
  "Abrir".


- **Economia estimada no rodapé da cotação (ABERTA/ENCERRADA).** Novo: o
  rodapé mostra "Economia estimada até agora" = soma, por item, de quanto o
  menor lance atual ficou abaixo da referência de última compra (× quantidade);
  sem referência de última compra, usa o spread entre o maior e o menor lance.
  Some quando ainda não há economia (cai no contador de itens). Só leitura,
  não afeta apuração.

- **Chip de fornecedor com × (RASCUNHO/ABERTA).** Novo: cada chip de
  fornecedor tem um × para desconvidar direto, sem abrir o modal de
  Representantes (`DELETE /api/participantes/:id`, endpoint que já existia). Só
  aparece enquanto o participante ainda não respondeu (`participanteStatus !==
  'RESPONDIDO'`).

- **Resumo/aviso no diálogo de Abrir.** Novo: ao abrir a cotação, o diálogo de
  prazo mostra "X itens · Y fornecedores" e avisa (não bloqueia) se faltar item
  ou fornecedor — antes o `abrir` só falhava no servidor com uma mensagem
  genérica.

## Catálogo — produtos, fornecedores e usuários

- **Filtro Todos / Ativos / Inativos.** Novo: cada uma das três listas ganhou
  uma fileira de chips pra filtrar por situação. O padrão é "Todos" (mesma
  visão de antes — inativos aparecem no fim da lista, esmaecidos). Só filtra
  no cliente; nenhuma chamada nova.
- **Chips de situação/papel padronizados.** "Inativo/Inativa" e o papel do
  usuário (Dono/Administrador/Operador) agora usam o `Selo` do design system
  (mesmo chip de status da cotação). Só aparência.

## Status da cotação (chip)

- **`StatusBadge` usa o `Selo` do design system.** As cores de estado
  mudaram levemente pra casar com a paleta do painel: Aberta = menta,
  Encerrada = âmbar, Rascunho = cinza, **Pedidos gerados = azul** (era
  verde), Cancelada = vermelho. Rótulos idênticos; nada de comportamento.

## Diálogos (todo o app)

- **Todo modal renderiza escuro.** O componente `Dialog` compartilhado passou
  a portar num container `data-painel="dark"`. Antes cada modal herdava (ou
  não) o tema conforme onde era montado — vários ficavam claros sobre o painel
  escuro. Agora os 17 modais do app (novo produto, convidar representante,
  abrir cotação, confirmar apuração, ajuda…) ficam navy/menta. Sem mudança de
  fluxo, texto, foco ou atalhos (Esc/Tab).

## Primeiros passos (dashboard)

- **Barra de progresso.** Novo: o card "Primeiros passos" mostra "N de 3
  concluídos" no cabeçalho e uma barra de progresso menta. Antes só os itens
  riscados indicavam avanço. Os passos, links e ações (Dispensar, Configurar
  em 3 passos, dados de exemplo) são os mesmos.

## Dashboard (admin)

- **Variação do gasto do mês.** Novo: o KPI "Gasto do mês" mostra abaixo do
  valor uma linha "▲/▼ N% vs. mês anterior" quando há mês anterior com gasto
  (▲ vermelho = gastou mais, ▼ verde = gastou menos). Puramente informativo,
  some quando o mês anterior está zerado. Antes o dashboard só mostrava os
  dois valores lado a lado sem o percentual.

## Montagem de itens da cotação (RASCUNHO)

- **Botões +/- da quantidade ganham nome acessível.** Os controles de
  stepper (aumentar/diminuir a "Qtd. solicitada") só tinham o ícone; agora
  têm `aria-label` "Aumentar quantidade" / "Diminuir quantidade". Leitor de
  tela e testes passam a conseguir mirá-los. Sem mudança visual/de fluxo.

## Grade ao vivo (admin)

- **Cabeçalho da grade dentro da mesma superfície.** Antes "Grade de Respostas
  (Ao Vivo)" era um bloco à parte, com `mt-8`, título grande e um contador
  cinza flutuante. Agora é uma faixa de seção da própria `Superficie` (ponto
  menta pulsando quando ABERTA, contador "N de M responderam", botão
  "Adicionar item"). Sem mudança de fluxo — os mesmos elementos, encaixados
  no cartão único.

- **Tabela da grade encaixada na superfície.** A tabela era um card com
  borda/sombra própria dentro da `Superficie` (card dentro de card) e o
  cabeçalho fixo tinha fundo translúcido — as linhas apareciam por baixo dele
  ao rolar. Agora a tabela é rente ao cartão e o cabeçalho fixo (linha e
  primeira coluna) tem fundo opaco. Só aparência.

- **Coluna "Item" mais larga por padrão (240 → 280 px).** O nome do produto
  vinha espremido/sobreposto pelos controles de quantidade quando a coluna
  estava no tamanho padrão. Agora o nome trunca com reticências e tudo se
  alinha; a coluna continua redimensionável e o valor salvo no navegador
  prevalece sobre o novo padrão.



- **`10a4d84` — Célula do menor preço em menta + pulso.**
  Antes: fundo verde-claro fixo; no flash, um verde chapado. Depois: menta da
  marca no estado assentado e um pulso de ~2s (2 batidas + glow) ao assumir a
  liderança ou mudar de valor. Puramente visual; a lógica de "quem é o menor"
  é a mesma.

## Acessibilidade

- **Menos movimento também congela os pontos "ao vivo".** Com
  `prefers-reduced-motion`, além das microanimações já cobertas, os pontos
  pulsantes (`animate-ping`/`animate-pulse`) dos cabeçalhos de seção param —
  vira um ponto estático. O spinner de sincronização (`animate-spin`)
  continua girando de propósito.
- **Anel de foco nos chips de filtro e nas linhas de lista.** Navegando por
  teclado, os chips (Todos/Ativos/Inativos, período) e as `LinhaLista`
  clicáveis agora mostram um anel de foco menta. Sem mudança no mouse.
