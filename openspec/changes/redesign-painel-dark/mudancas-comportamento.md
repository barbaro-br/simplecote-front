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

- **Economia estimada no rodapé da cotação (ABERTA/ENCERRADA).** Novo: o
  rodapé mostra "Economia estimada até agora" = soma, por item, de quanto o
  menor lance atual ficou abaixo da referência de última compra (× quantidade);
  sem referência de última compra, usa o spread entre o maior e o menor lance.
  Some quando ainda não há economia (cai no contador de itens). Só leitura,
  não afeta apuração.

- **Chip de fornecedor com × em RASCUNHO.** Novo: cada chip de fornecedor tem
  um × para desconvidar sem abrir o modal de Representantes (`DELETE
  /api/participantes/:id`, endpoint que já existia). Só em RASCUNHO — depois de
  ABERTA, remover participante segue pelo modal.

## Grade ao vivo (admin)

- **`10a4d84` — Célula do menor preço em menta + pulso.**
  Antes: fundo verde-claro fixo; no flash, um verde chapado. Depois: menta da
  marca no estado assentado e um pulso de ~2s (2 batidas + glow) ao assumir a
  liderança ou mudar de valor. Puramente visual; a lógica de "quem é o menor"
  é a mesma.
