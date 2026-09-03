## Context

Cinco ajustes independentes, agrupados por serem todos de severidade
média/baixa e não precisarem de mudança de backend:

1. `PainelDashboard.tsx:34` — `{ chave: 'apurada', rotulo: 'Apurada', status: 'PEDIDOS_GERADOS', ... }`.
2. `AbrirCotacaoDialog.tsx` — `tipoPrazo` sempre inicia `'hoje_18'`; validação de prazo passado só acontece em `confirmarFinal()`.
3. `AdicionarItemModal.tsx:155` — `qtdSelecionados = itens.length` (prop, não `drafts`).
4. `CotacaoDetalhePage.tsx:186` — `Encerrar` chama `executar(() => encerrar.mutateAsync())` direto; `Apurar`/`Cancelar` usam `setDialog('apurar'|'cancelar')` com um modal de confirmação.
5. Sidebar do shell administrativo — nome da loja truncado mesmo com espaço disponível.

## Decisions

- **(1) Trocar só o rótulo**: `rotulo: 'Apurada'` → `rotulo: 'Pedidos
  gerados'`. Não muda `chave`/`status`/lógica de navegação.
- **(2) Presets desabilitados quando já vencidos**: calcular, pra cada
  preset, se o horário resultante (`calcularPrazoIso`) já passou
  (`< Date.now()`); presets vencidos ficam com `disabled` visual (opacidade
  reduzida + não clicável) em vez de aparentar disponíveis. O preset padrão
  inicial (`useState<TipoPrazo>`) passa a escolher o primeiro preset ainda
  válido na ordem `hoje_18 → amanha_12 → amanha_18` em vez de sempre
  `'hoje_18'`.
- **(3) Subtítulo do modal combina `itensMap` + `drafts`**: contar
  `itensMap.size` mais/menos o que `drafts` adiciona ou remove (uma entrada
  em `drafts` com valor `0` para um item que estava em `itensMap` conta como
  remoção; uma entrada positiva para um item que não estava em `itensMap`
  conta como adição), em vez de só `itens.length`.
- **(4) "Encerrar" ganha confirmação no mesmo padrão de "Apurar"/"Cancelar"**:
  trocar `onClick={() => executar(...)}` por `onClick={() =>
  setDialog('encerrar')}`, com um bloco de diálogo simples nomeando a
  consequência (a Cotação para de aceitar respostas; pode ser reaberta
  depois — menos irreversível que Apurar/Cancelar, então o texto do diálogo
  reflete isso, sem o tom de "não pode ser desfeito").
- **(5) Investigar e corrigir a largura do texto do nome da loja**: o
  cabeçalho da sidebar tem o ícone da loja, o nome e o botão de
  recolher/expandir lado a lado; o nome está sendo truncado com uma largura
  menor do que o espaço realmente disponível. Ajustar pra usar o espaço
  flexível restante (`flex-1 min-w-0` + `truncate` no texto, garantindo que
  o truncamento só ocorra quando genuinamente não há espaço, não sempre).

## Risks / Trade-offs

- Nenhum destes muda comportamento de dados/backend — são ajustes de
  apresentação e de uma confirmação a mais. Risco de regressão visual é
  baixo; cobrir com teste de snapshot/interação simples em cada um.
