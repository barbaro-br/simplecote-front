## Why

Duas falhas encontradas no modal "Representantes Convidados"
(`RepresentantesModal.tsx`) ao testar o sistema:

1. **"Finalizar"/"Reabrir resposta" aparecem mesmo fora de `ABERTA`/`ENCERRADA`.**
   O requirement "Correção de lance e reabertura de resposta pelo admin" já
   diz que esses controles são só para Cotação `ABERTA` ou `ENCERRADA`, mas o
   componente não checa o status da Cotação — só o status do participante
   (`participanteStatus === 'VISUALIZOU'`/`'RESPONDIDO'`). Reproduzido ao
   vivo: numa cotação `PEDIDOS_GERADOS`, os dois botões continuavam visíveis
   e clicáveis, deixando o admin clicar "Reabrir resposta" numa cotação já
   apurada sem nenhum efeito útil (o representante continua sem poder
   editar) e sem nenhum aviso.
2. **"Não enviado" esconde falha real de envio de e-mail.** O front só
   distingue `conviteStatus === 'ENVIADO'` de "qualquer outra coisa" — mas o
   enum `ConviteStatus` (back) tem só `ENVIADO`/`FALHOU`. Quando o envio
   genuinamente falha (SMTP fora do ar, endereço inválido), o admin vê o
   mesmo rótulo "Não enviado" que veria se o sistema nunca tivesse tentado
   enviar. Reproduzido em dev: 3 participantes com `conviteStatus: "FALHOU"`
   apareceram todos como "Não enviado", sem indicação de erro.

A proteção correspondente no backend (rejeitar `reabrir`/`finalizar` fora de
`ABERTA`/`ENCERRADA`) é tratada à parte, no repo `simplecote-back`.

## What Changes

- `RepresentantesModal.tsx` só mostra os botões "Finalizar"/"Reabrir
  resposta" quando a Cotação está `ABERTA` ou `ENCERRADA` (já é o que o
  requirement descreve — é um bug de implementação, não mudança de escopo).
- O rótulo de status de convite passa a distinguir três casos: nunca
  tentado, `ENVIADO`, `FALHOU` (com destaque visual de erro).

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Correção de lance e reabertura de resposta
  pelo admin" — adiciona cenário cobrindo o caso fora de
  `ABERTA`/`ENCERRADA`; requirement "Convidar Empresas" — adiciona cenário
  para o status de convite `FALHOU`.

## Impact

- `src/admin/cotacoes/RepresentantesModal.tsx`
