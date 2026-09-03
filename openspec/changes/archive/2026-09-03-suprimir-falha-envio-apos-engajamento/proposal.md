## Why

O rótulo "Falha no envio" (formalizado em `corrigir-modal-representantes-convidados`,
já arquivado, para distinguir `conviteStatus: FALHOU` de "ainda não
tentamos enviar") continua aparecendo mesmo depois que o participante já
visualizou ou respondeu a cotação. Reproduzido ao vivo: um participante que
já finalizou a resposta (`participanteStatus: RESPONDIDO`) aparece com os
badges "Falha no envio" **e** "Respondido" lado a lado no modal de
Representantes.

Levantado ao vivo: uma vez que o participante já demonstrou acesso à
cotação (visualizou ou respondeu — via WhatsApp, link copiado manualmente,
ou qualquer canal fora do e-mail automático), a falha do envio automático
de e-mail deixou de ser uma informação acionável — o objetivo (o
representante chegou até a cotação) já foi alcançado por outro caminho.
Manter o aviso de erro nesse ponto é só ruído, e a justaposição com
"Respondido" é confusa.

## What Changes

- O badge de "Falha no envio" só aparece enquanto o participante ainda está
  em `CONVIDADO` (nunca visualizou). A partir de `VISUALIZOU` ou
  `RESPONDIDO`, o badge de convite deixa de ser exibido — o badge de status
  de resposta já é a informação relevante nesse ponto.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Convidar Empresas" — restringe quando o
  indicador de falha de envio é exibido.

## Impact

- `src/admin/cotacoes/RepresentantesModal.tsx`
