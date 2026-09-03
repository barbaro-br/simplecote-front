## Why

Pesquisa e decisão do usuário sobre a barra de ações da tela de detalhe da
Cotação:

1. **"Cancelar" deixa de ficar escondido no menu "⋯"**. O padrão atual
   (Cancelar só dentro do overflow, formalizado em uma change anterior desta
   mesma sessão) segue a prática recomendada para ações destrutivas
   (NN/G — "Dangerous UX: Consequential Options Close to Benign Options"),
   mas o usuário decidiu, cientemente da recomendação, que prefere o botão
   visível — decisão de produto, não um erro a corrigir. Para não abrir mão
   de toda a proteção contra clique acidental, o botão continua
   visualmente distinto (estilo de alerta, não o mesmo peso visual dos
   botões de transição primária) e espacialmente separado deles na fileira.

2. **Bug encontrado ao revisar a lógica atual**: o front mostra "Cancelar"
   sempre que o status não é `CANCELADA` nem `PEDIDOS_GERADOS` — incluindo
   `ENCERRADA`. O backend (`Cotacao.cancelar()`) só permite cancelar em
   `RASCUNHO` ou `ABERTA`; numa Cotação `ENCERRADA`, clicar "Cancelar" hoje
   resulta em erro do backend depois da confirmação. Este change corrige a
   condição para bater com a regra real do domínio.

3. **Cabeçalho sticky com efeito de "caixa flutuante"**: o header da tela de
   detalhe (`sticky top-0 ... shadow-sm border-b`) usa uma sombra elevada
   que dá a impressão de um cartão/chatbox sobreposto à página, em vez de
   uma barra de navegação integrada. Remove a sombra, mantendo só a borda
   inferior sutil para separar visualmente o cabeçalho fixo do conteúdo
   rolável.

Achado à parte, **fora de escopo deste change**: o usuário também pediu
para os representantes serem avisados quando uma Cotação é cancelada — hoje
`cancelar()` só muda o status, nenhuma notificação é disparada. É uma
funcionalidade nova de backend (não visual), a ser formalizada como change
própria depois.

A cor de fundo global do sistema ("branco seco" → algo mais agradável) foi
discutida na mesma conversa, mas por ser uma mudança de token de tema
(`--background`/`--card`, usada em toda tela do admin), fica como
change separada, com sua própria pesquisa de paleta antes de qualquer
implementação.

## What Changes

- "Cancelar" vira botão visível (`variant="outline"` com tom de alerta),
  posicionado com separação visual dos botões de transição primária
  (Abrir/Encerrar/Reabrir/Apurar), próximo a "Representantes" mas com um
  espaçamento/divisor que o distingue como ação de risco diferente.
- "Cancelar" só aparece quando `status` é `RASCUNHO` ou `ABERTA` — não mais
  em `ENCERRADA` (bug corrigido).
- O cabeçalho sticky da tela de detalhe deixa de usar `shadow-sm`, mantendo
  a borda inferior para separação de scroll.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Transições de estado com confirmação" —
  muda onde e quando "Cancelar" é exibido.

## Impact

- `src/admin/cotacoes/CotacaoDetalhePage.tsx`
