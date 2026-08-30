## 1. Estilos e animações

- [x] 1.1 Adicionar ao `src/index.css` os keyframes/classes `flashBorder`/`.flash-green`, `popNum`/`.pop`, `successDrop`/`.success-pop`, `fadeIn`/`.fade-in`, usando `var(--primary)` e `var(--border)` no lugar das cores fixas do protótipo. Verificar: `wrapper npm run build` passa e as classes aparecem no CSS gerado.

## 2. Card do item (`ItemLanceCard`)

- [x] 2.1 Criar subcomponente de indicador de status (visto ✓ `bg-success` / marca ✗ `bg-destructive`) que recebe `filled: boolean` e faz cross-fade. Verificar: teste de render mostrando ✓ com `filled` e ✗ sem.
- [x] 2.2 Remover `naoCotado` state e `<ToggleDuplo>` do `ItemLanceCard`; derivar tudo de `precoTexto`. Valor inicial vem de `item.preco` (inclusive `statusLance === 'NAO_COTADO'` → campo vazio). Verificar: card não renderiza mais o toggle (teste atualizado).
- [x] 2.3 Ajustar o efeito de debounce: campo preenchido e válido → `aoAssentar({ preco })`; campo esvaziado **e** `jaEnviadoRef` já era número → `aoAssentar({ naoCotado: true })`; campo vazio nunca enviado → não dispara. Verificar: testes cobrindo os três caminhos (digitar preço envia `preco`; apagar preço enviado antes envia `naoCotado: true`; abrir com item sem preço não dispara PUT).
- [x] 2.4 Reestilizar o layout do card conforme o protótipo (nome em destaque, código de barras à direita, linha "emb. com Nun · comprar N", campo `R$` compacto) usando tokens de tema. Verificar: inspeção visual via `run` / screenshot mobile.
- [x] 2.5 Portar o flash de borda verde (vazio → preenchido liga `.flash-green` por ~700ms com duplo `requestAnimationFrame`). Verificar: teste que dispara mudança de preço e checa a classe; conferência visual.
- [x] 2.6 Portar o gesto de deslizar-para-limpar (`onTouchStart/Move/End`, `swipeOffset`, limiar ~70px, fundo de "limpar"), ativo só com `podeEditar`. Ao passar do limiar: `setPrecoTexto('')` + `onPrecoChange(id, false)`. Verificar: teste simulando `touch` além e aquém do limiar; sem efeito quando `podeEditar` é falso.
- [x] 2.7 Adicionar prop `onPrecoChange(itemCotacaoId, temPreco: boolean)` chamada no `onChange` do input e no swipe. Verificar: spy recebe `(id, true/false)` nas transições.

## 3. Página (`CotacaoPorTokenPage`)

- [x] 3.1 Adicionar derivado `contarComPreco(itens)` em `cotacao-token.derivados.ts` + teste em `cotacao-token.derivados.test.ts` (conta itens com `preco != null`).
- [x] 3.2 Manter na página um `Set`/`Record` de "itens com preço agora", inicializado pelos itens da API e atualizado por `onPrecoChange`; calcular `N` a partir dele. Verificar: digitar num card move o contador na hora (teste de integração).
- [x] 3.3 Substituir a linha "Respondidos: N/T" + barra pela bolha flutuante "N de T": número com classe `.pop` reiniciada via `bubbleKey` a cada mudança de `N`; fundo `bg-primary` quando `N === total`, senão neutro. Verificar: teste checando texto "15 de 50" e a classe de destaque quando todos têm preço.
- [x] 3.4 Reorganizar a barra `sticky bottom` conforme o protótipo (título, saudação/contexto, linha de Prazo, botão "Finalizar", bolha), preservando: botão desabilitado com "Sincronizando N preço(s)…" enquanto a fila não esvazia; barra oculta em somente leitura. Verificar: testes existentes de pendência/somente-leitura adaptados continuam passando.
- [x] 3.5 Trocar cores fixas por tokens e garantir que a tela usa `background`/`.tema-claro`. Verificar: grep sem `#3a6b2e`/`#f5f4f0`/`red-500` nos arquivos da tela; conferência visual em tema claro.

## 4. Confirmação, sucesso e tutorial

- [x] 4.1 Criar `ConfirmarEnvioDialog` (usa `@/shared/components/ui/dialog`) com props `aberto`, `itensSemPreco`, `total`, `aoConfirmar`, `aoCancelar`: título "Enviar cotação?", aviso âmbar "{n} {item|itens} sem preço serão enviados em branco" quando `itensSemPreco > 0`, senão "Todos os {total} itens estão preenchidos."; botões "Cancelar"/"Confirmar". Verificar: testes de concordância singular/plural e de que "Confirmar" chama `aoConfirmar`.
- [x] 4.2 Ligar o botão "Finalizar" ao dialog: acionar abre o modal; só "Confirmar" chama `finalizar.mutateAsync()`. Verificar: teste de que o `POST` não é chamado até confirmar; "Cancelar" não envia.
- [x] 4.3 Criar `SuccessScreen` (tela cheia, visto grande, "Cotação enviada!", primeiro nome), com auto-dismiss ~3s e botão "Fechar". No sucesso do `finalizar`: `setFinalizado(true)`, `fila.limpar()`, `cotacao.refetch()`; ao dispensar, `setFinalizado(false)` e a tela cai em somente leitura pelo estado refetado. Verificar: teste de que 204 mostra a tela e, ao fechar, a lista aparece somente leitura sem a barra fixa.
- [x] 4.4 Criar `Tutorial` (3 passos: anatomia do card, estados do visto automático, "pronto para começar"; pontos de progresso, "Próximo"/"Entendi, vamos lá!", "Pular tutorial") portado do protótipo com tokens. Verificar: teste navegando os 3 passos e acionando "Pular".
- [x] 4.5 Gate do tutorial por `localStorage` key `simplecote:tutorial-preco:v1` (por dispositivo), com `try/catch` na leitura/escrita; `showTutorial` inicia `true` se ausente; concluir/pular grava a key. O overlay é irmão do conteúdo (dados carregam por trás). Verificar: teste — sem a key mostra o tutorial; após concluir, key gravada e não reaparece; `localStorage` lançando exceção não quebra a tela.

## 5. Limpeza e fechamento

- [x] 5.1 Remover `src/shared/components/ui/toggle-duplo.tsx` (grep confirma: só `ItemLanceCard` usava). Verificar: `wrapper npm run build` e `wrapper npx vitest run` passam sem referências pendentes.
- [x] 5.2 Rodar a suíte completa (`wrapper npx vitest run`) e o build (`wrapper npm run build`); conferir a tela no app real (`run`, screenshot mobile) contra o protótipo. Verificar: tudo verde e paridade visual.
- [x] 5.3 `openspec validate redesign-tela-preco-representante --strict` sem erros.
