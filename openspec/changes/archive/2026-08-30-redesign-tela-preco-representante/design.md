## Context

Ver `proposal.md` (Why / What Changes). Estado atual:

- `CotacaoPorTokenPage.tsx` orquestra: `useCotacaoPorToken(token)` (GET), `useFilaDeSincronizacao(token)` (fila + retry em `localStorage` sob `simplecote:fila:{token}`), `useFinalizar(token)` (POST). Layout: header `sticky top`, lista de `ItemLanceCard`, barra `sticky bottom` com "Respondidos: N/T" + `<Button>` de finalizar.
- `ItemLanceCard.tsx` mantém estado local `precoTexto` + `naoCotado`, faz debounce de 800ms via `useDebounce`, valida com `precoSchema`, e chama `aoAssentar({ preco })` ou `aoAssentar({ naoCotado: true })`. Hoje esvaziar o campo **não** dispara nada (`valorDebounced === ''` → return sem enviar). Usa `<ToggleDuplo>` para o tri-estado.
- Tema: `src/index.css` já define `--primary` (verde ≈ `#3a6b2e`), `--success`, `--destructive`, `--background` (≈ `#f5f4f0`), e a subárvore `.tema-claro` (aplicada por `TemaClaro.tsx`, que também é o container de rolagem). Sem keyframes customizados hoje.
- O protótipo de referência (`App.tsx` colado pelo usuário) é auto-contido: mock `Product[]`, `localStorage` de preços, keyframes em CSS, `Tutorial`, `SuccessScreen`, swipe, bolha animada, modal de confirmação bottom-sheet.

Restrições: mobile-first, rede instável (a resiliência da fila não pode regredir), tema claro forçado, sem libs novas.

## Goals / Non-Goals

**Goals:**

- Trazer a aparência e as microinterações do protótipo para o produto reaproveitando 100% da lógica de dados/fila/finalização existente.
- Tornar o "não cotado" posicional (preço vazio) sem quebrar a fila nem o contrato da API.
- Manter `ItemLanceCard` e `CotacaoPorTokenPage` como os pontos de entrada (mesmos caminhos de arquivo), com subcomponentes novos ao lado.

**Non-Goals:**

- Nenhuma mudança em `/pedido/:token`, rotas, auth ou telas do admin.
- Nenhuma mudança de contrato da API pública.
- Não persistir preços em `localStorage` "por preço" como o protótipo faz — a fonte da verdade continua sendo a API + a fila de sincronização.
- Não portar o mock `Product[]`/`initialProducts` do protótipo.

## Decisions

### D1. "Não cotado" = campo de preço vazio (remoção do `ToggleDuplo`)

`ItemLanceCard` perde o estado `naoCotado` e o `<ToggleDuplo>`. Deriva-se tudo de `precoTexto`:

- `precoTexto` não-vazio e válido → `aoAssentar({ preco })` (igual a hoje).
- `precoTexto` vazio **e** já houve um envio de preço antes para aquele item (`jaEnviadoRef.current` era um número) → `aoAssentar({ naoCotado: true })`. Isso muda o comportamento atual (que fazia `return` sem enviar) — necessário para o comprador ver na grade ao vivo que o item passou a "não cotado".
- `precoTexto` vazio e nunca houve envio → não dispara nada (igual a hoje; evita PUT desnecessário ao abrir a tela).

Valor inicial: `item.preco != null ? String(item.preco) : ''`. `statusLance === 'NAO_COTADO'` também vira campo vazio (antes marcava o toggle).

Indicador de status é um componente puro `Checkbox`/`VistoStatus` que recebe `filled: boolean = !!precoTexto.trim()` e cruza-fade entre ✓ (`bg-success`) e ✗ (`bg-destructive`), portado do protótipo com tokens no lugar de `#3a6b2e`/`red-500`.

_Alternativa descartada:_ manter o toggle escondido atrás de um "gesto longo". Complexidade sem pedido — o usuário validou a perda da distinção PENDENTE vs NAO_COTADO explícito.

### D2. Keyframes em `src/index.css`, não CSS-in-JS

Adicionar ao `index.css` (fora do `@layer base`, como utilitários globais): `flashBorder` → `.flash-green`, `popNum` → `.pop`, `successDrop` → `.success-pop`, `fadeIn` → `.fade-in`. O protótipo já traz essas regras prontas; só trocar o verde fixo `#3a6b2e` por `var(--primary)` e o `#f3f4f6` de saída por `var(--border)`. Motivo: consistente com o resto do projeto (Tailwind + tokens), sem runtime.

### D3. Flash verde e bolha animada: mesma técnica do protótipo

- Flash: `useRef` do preço anterior; quando vai de vazio→preenchido, liga `.flash-green` por 700ms via `setTimeout` + duplo `requestAnimationFrame` para reiniciar a animação. Copiado do protótipo.
- Bolha "N de T": `N = itens.filter(i => temPreco(i)).length`. Um `bubbleKey` incrementa quando `N` muda para reiniciar a classe `.pop` no `<span>` do número. Fundo `bg-primary` quando `N === total`, senão `bg-foreground`/neutro.
- Derivado `contarComPreco(itens)` novo em `cotacao-token.derivados.ts` (ao lado de `contarRespondidos`), contando itens cujo lance tem `preco != null`. O estado "ao vivo" do preço digitado mas ainda não sincronizado fica no `ItemLanceCard`; para a bolha refletir a digitação na hora, a página precisa saber o preço corrente de cada card → ver D4.

### D4. Preço corrente sobe para a página via callback leve

Hoje o card só chama `aoAssentar` no debounce. A bolha precisa reagir a cada tecla. Opção escolhida: `ItemLanceCard` recebe um `onPrecoChange(itemCotacaoId, temPreco: boolean)` chamado no `onChange` do input (e no swipe), e `CotacaoPorTokenPage` mantém um `Set`/`Record` de "itens com preço agora" para calcular `N`. Não altera a fila nem o autosave; é só para o contador.

_Alternativa descartada:_ subir o texto completo do preço (`onChange` mais pesado, re-render da lista inteira a cada tecla). Só o booleano `temPreco` basta para a bolha e minimiza re-render.

### D5. Modal de confirmação usa o `Dialog` compartilhado

`src/shared/components/ui/dialog.tsx` já existe e é usado no admin. Novo componente `ConfirmarEnvioDialog` (em `src/representante/cotacao/`) recebe `aberto`, `itensSemPreco: number`, `total`, `aoConfirmar`, `aoCancelar`. Conteúdo: título "Enviar cotação?"; se `itensSemPreco > 0`, bloco de aviso âmbar "{n} {item|itens} sem preço serão enviados em branco"; senão "Todos os {total} itens estão preenchidos." Botões "Cancelar" / "Confirmar". `aoConfirmar` chama o `aoFinalizar` atual da página.

### D6. `SuccessScreen` e `Tutorial` como componentes locais

Portados quase 1:1 do protótipo, com tokens de tema. Estado na página:

- `finalizado: boolean` — vira `true` no sucesso do `finalizar.mutateAsync()`. Enquanto `true`, renderiza `<SuccessScreen>`. `onClose` (botão ou timeout de 3s) seta `finalizado=false`; a partir daí a resposta já refetada (`participanteStatus === 'RESPONDIDO'`, `podeEditar=false`) faz a página cair no modo somente leitura naturalmente. Disparar `cotacao.refetch()` no sucesso para garantir o novo estado.
- Tutorial: `localStorage` key `simplecote:tutorial-preco:v1` (booleano "visto"), **por dispositivo, não por token** — o representante só precisa aprender uma vez. `showTutorial` inicia `true` se a key estiver ausente. `dismissTutorial` grava a key. O overlay é irmão do conteúdo (não envolve), então os dados carregam por trás.

### D7. Swipe-to-clear fica dentro do `ItemLanceCard`

Handlers `onTouchStart/Move/End` + `swipeOffset` state, portados do protótipo. No `onTouchEnd`, se passou do limiar: `setPrecoTexto('')` e `onPrecoChange(id, false)` — o efeito de debounce cuida do envio `{ naoCotado: true }` (D1). Guardado por `podeEditar`. Sem libs de gesto.

### D8. Cores: mapa protótipo → token

| Protótipo | Token |
|---|---|
| `#3a6b2e`, `bg-[#3a6b2e]` | `primary` / `bg-primary` |
| `#f5f4f0` (fundo da tela) | `background` (já é o fundo do `TemaClaro`) |
| `#f0f7ed` (verde claro) | `bg-primary/10` |
| `bg-red-500` (X) | `bg-destructive` |
| verde do visto | `bg-success` |
| `text-amber-700` / `bg-amber-50` (aviso) | manter âmbar literal (não há token de warning-surface; `--warning` existe só como cor de texto) |

## Risks / Trade-offs

- **[Perda da distinção PENDENTE vs NAO_COTADO explícito]** → Aceito pelo requisitante. O modal de confirmação mostra a contagem de itens "em branco" antes de enviar, então não há envio silencioso.
- **[Novo PUT ao esvaziar um campo antes preenchido]** → É desejado (grade ao vivo precisa saber). Mitigação: só dispara quando `jaEnviadoRef` já era número; abrir a tela com itens sem preço não gera tráfego.
- **[`onPrecoChange` a cada tecla re-renderiza a página]** → Payload é só `(id, boolean)` e o estado é um `Set`; a lista usa `key` estável por item e `updateProduct` já é `useCallback`. Impacto pequeno mesmo com 50 itens. Se virar problema, memoizar `ItemLanceCard`.
- **[Swipe conflita com scroll vertical]** → Só reagir quando `dx < 0` e o movimento é predominantemente horizontal (protótipo já filtra `dx < 0`); limiar de 70px evita disparo acidental. Testar em device real.
- **[`localStorage` indisponível / modo privado]** → `try/catch` na leitura/escrita da key do tutorial (como o protótipo faz no `loadPrices`); na dúvida, mostra o tutorial (degrada para o comportamento "sempre mostra", não quebra).
- **[Testes existentes quebram]** → Esperado. `ItemLanceCard.test.tsx` e `CotacaoPorTokenPage.test.tsx` serão reescritos junto com a implementação (mesmo PR), cobrindo visto automático, esvaziar=não cotado, bolha, modal, sucesso e gate do tutorial via `localStorage`.

## Migration Plan

1. Adicionar keyframes ao `index.css` (aditivo, sem efeito colateral).
2. Reescrever `ItemLanceCard` (D1, D3, D7) + subcomponente de visto.
3. Reescrever `CotacaoPorTokenPage` (bolha, barra, D4, D5, D6).
4. Novos componentes: `ConfirmarEnvioDialog`, `SuccessScreen`, `Tutorial` (ou um `TutorialOnboarding`).
5. Atualizar/rescrever testes; rodar `wrapper npx vitest run` e `wrapper npm run build`.
6. Remover `src/shared/components/ui/toggle-duplo.tsx` e seu teste se não houver outro consumidor (grep confirmou: só o card usa).
7. `openspec validate redesign-tela-preco-representante --strict`.

Rollback: reverter o commit — não há migração de dados nem mudança de API; a fila em `localStorage` continua compatível (mesmas chaves e formato).

## Open Questions

- Texto exato da tela de sucesso ("Obrigado, {nome}. Até a próxima." do protótipo) e do primeiro nome — ajuste fino de cópia, não muda specs nem tasks.
- Duração exata do auto-dismiss da tela de sucesso (protótipo usa 3s) — parametrizável, sem impacto de escopo.
