## Why

O `RepresentantesModal` já tem quase tudo pro fluxo de convites (WhatsApp por representante, reenvio individual e em massa, estado `ENVIADO`/`FALHOU`, contador de não-enviados). Faltam dois retoques:

1. Depois de "Abrir", o admin não vê na **tela de detalhe** como foi a entrega — precisa abrir o modal. Um resumo "3 de 4 convites entregues" no cabeçalho ajudaria.
2. A mensagem do botão WhatsApp usa um texto cru de uma linha (`RepresentantesModal.tsx` ~linha 315), em vez do helper `montarMensagemConvite` (que já monta "Olá <nome>, aqui está o link da cotação <título> da <empresa>. O prazo é até <data>. Acesse: <link>").

## What Changes

- `CotacaoDetalhePage`: quando `status` ∈ {`ABERTA`, `ENCERRADA`} e há participantes, mostrar no cabeçalho um resumo curto: "**N de M convites entregues**" (M = total, N = `conviteStatus === 'ENVIADO'`). Se houver falhas, um link/botão "ver" que abre o `RepresentantesModal`.
- `RepresentantesModal`: o botão WhatsApp passa a usar `montarMensagemConvite({ representanteNome, titulo, empresaNome, prazo, link })` + `urlWhatsApp(msg, whatsapp)` de `compartilhar-link.ts`, em vez do texto inline.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a requirement de "Convidar Empresas" ganha (a) um resumo da entrega dos convites visível na tela de detalhe e (b) a mensagem de WhatsApp padronizada pelo helper `montarMensagemConvite`.

## Impact

- `CotacaoDetalhePage.tsx`: derivar `entregues = participantes.data.filter(p => p.conviteStatus === 'ENVIADO').length` e `total = participantes.data.length`; renderizar "N de M convites entregues" no cabeçalho quando `status` ∈ {`ABERTA`,`ENCERRADA`} e `total > 0`; se `entregues < total`, ação que abre o `RepresentantesModal`.
- `RepresentantesModal.tsx`: trocar a construção da mensagem do WhatsApp pelo `montarMensagemConvite(...)` já existente em `src/admin/cotacoes/compartilhar-link.ts` (passar `titulo` da cotação, `empresaNome`, `prazo`, `linkMagico`).
- Reusa `useParticipantes`, `montarMensagemConvite`, `urlWhatsApp`. Sem hook novo, sem dependência nova, sem mudança no back.
- Testes: `CotacaoDetalhePage.test.tsx` — resumo "N de M" com um mock de participantes (mistura de `ENVIADO`/`FALHOU`); ausente em `RASCUNHO`; ação de "ver" abre o modal. `RepresentantesModal.test.tsx` — o `href` do WhatsApp contém a mensagem do helper (nome, título, link).
