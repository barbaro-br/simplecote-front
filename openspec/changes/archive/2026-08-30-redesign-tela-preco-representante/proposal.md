## Why

A tela `/cotacao/:token` — onde o representante digita os preços da cotação pelo celular — funciona, mas o visual atual é um formulário genérico. Já existe um protótipo de alta fidelidade (feito em Figma e prototipado em React) que deixa a tela muito mais clara e rápida de preencher: card de produto com hierarquia forte, visto verde/X vermelho automático, contador de progresso animado, gesto de deslizar para limpar, tela de sucesso e um tutorial curto na primeira visita. Este change traz esse protótipo para o produto, reaproveitando toda a lógica real (carregamento por token, autosave, fila offline, finalização).

## What Changes

- **Restyle do card de item** (`ItemLanceCard`): nome do produto em destaque, código de barras alinhado à direita, linha única "emb. com Nun · comprar N", campo `R$` compacto e um indicador de status automático — **visto verde** quando há preço, **X vermelho** quando não há. Sem botão "salvar".
- **BREAKING — remoção do toggle "Vou cotar / Não cotado"**: o `ToggleDuplo` sai do card. O significado passa a ser posicional: **campo de preço preenchido = item cotado; campo vazio = item não cotado**. Limpar um preço já salvo envia o item como "não cotado" pelo mesmo autosave. O representante perde a distinção explícita entre "ainda não respondi" e "não vou cotar" — os dois viram "sem preço".
- **Barra inferior fixa reformulada**: mantém título/saudação/contexto/prazo e o botão "Finalizar", e ganha uma **bolha flutuante de progresso "N de T"** (N = itens com preço) com animação de "pop" no número a cada mudança e troca de cor quando N = T. Substitui a linha de texto "Respondidos: N/T" + barra.
- **Flash de borda verde** no card quando um preço vai de vazio → preenchido.
- **Gesto de deslizar para limpar** (swipe-to-clear) no card em telas de toque: arrastar o card para a esquerda além de um limiar zera o preço (⇒ item vira "não cotado").
- **Modal de confirmação antes de finalizar** ("Enviar cotação?"), com aviso destacado de quantos itens serão enviados **sem preço / em branco** quando houver itens sem preço.
- **Tela de sucesso** em tela cheia após o `finalizar` retornar 204 (visto grande + "Cotação enviada!"), com auto-dispensa em ~3s e botão "Fechar"; ao sair, a tela reflete o estado `RESPONDIDO` (somente leitura).
- **Tutorial de onboarding** em 3 passos (anatomia do card, estados do visto, tela final "pronto para começar"), exibido só na primeira visita ao dispositivo, com "Pular tutorial" e navegação por passos.
- **Tokens de tema** do projeto (`primary`, `success`, `destructive`, `background`, `.tema-claro`) no lugar das cores fixas do protótipo (`#3a6b2e`, `#f5f4f0`, `red-500`); componentes de `@/shared` (`Dialog`, `Button`, `Input`) no lugar de markup solto.
- **Keyframes de animação** (`flashBorder`, `popNum`, `successDrop`, `fadeIn`) adicionados ao `src/index.css`.

Preservado sem mudança de comportamento: carregamento por token e campos exibidos, `podeEditar` como fonte da verdade da edição, cabeçalho fixo e regra de alerta de prazo (< 2h) / "prazo vencido", autosave por item com debounce de 800ms, fila de sincronização resiliente em `localStorage` (`simplecote:fila:{token}`), botão de finalizar travado enquanto a fila não esvazia, limpeza da fila só no 204, e a tela de `/pedido/:token`.

## Capabilities

### New Capabilities
<!-- Nenhuma. Todo o comportamento novo é uma evolução da capability existente. -->

### Modified Capabilities
- `representante/cotacao`: o controle de "não cotado" deixa de ser um toggle explícito e passa a ser posicional (preço vazio = não cotado), com indicador de status automático (visto/X) no card; o indicador de progresso vira uma bolha "N de T" animada com N = itens com preço; passam a existir gesto de deslizar para limpar, modal de confirmação de envio com aviso de itens em branco, tela de sucesso pós-finalização e um tutorial de primeira visita.

## Impact

- **Código**: `src/representante/cotacao/CotacaoPorTokenPage.tsx`, `src/representante/cotacao/ItemLanceCard.tsx`, `src/index.css`. Novos componentes em `src/representante/cotacao/` (tutorial, tela de sucesso, modal de confirmação, ou como subcomponentes). Provável remoção do uso de `src/shared/components/ui/toggle-duplo.tsx` (sem outros consumidores) — arquivo pode ser removido.
- **Testes**: `ItemLanceCard.test.tsx` e `CotacaoPorTokenPage.test.tsx` precisam ser reescritos (some o toggle, entram visto automático, bolha de progresso, modal, sucesso, tutorial). `cotacao-token.derivados.ts` / `.test.ts` podem precisar de um derivado "itens com preço".
- **API**: nenhuma mudança de contrato. O front continua mandando `{ itemCotacaoId, preco }` ou `{ itemCotacaoId, naoCotado: true }` no `PUT /public/cotacoes/:token/lances`.
- **UX / produto**: representante não consegue mais marcar explicitamente "não vou cotar este item" — ausência de preço cobre os dois casos. Decisão já validada com o requisitante.
- **Sem impacto** em rotas, auth, ou nas telas do painel admin.
