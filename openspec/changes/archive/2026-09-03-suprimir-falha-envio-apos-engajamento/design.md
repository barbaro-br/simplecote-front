## Context

`RepresentantesModal.tsx` (após `corrigir-modal-representantes-convidados`)
calcula o rótulo de convite (`Enviado`/`Falha no envio`/`Não enviado`) só a
partir de `conviteStatus`, sem olhar `participanteStatus`. As duas
informações (convite e engajamento) são mostradas lado a lado sempre,
mesmo quando uma delas parou de ser relevante — e o card já foi apontado
como sobrecarregado de badges/ícones (achado à parte, sessão de redesign
futura).

## Goals / Non-Goals

**Goals:**
- Um participante que já visualizou ou respondeu nunca mostra o badge de
  "Falha no envio" — a informação de entrega deixou de importar.

**Non-Goals:**
- Não muda o `conviteStatus` em si no backend (continua `FALHOU` nos
  dados) — só a apresentação, condicionada ao `participanteStatus`.
- Não mexe no comportamento de "Reenviar convite" (continua disponível
  independente do status do participante, conforme requirement "Convidar
  Empresas" já existente).

## Decisions

- **Omitir o badge de convite inteiramente quando `participanteStatus !==
  'CONVIDADO'`**, em vez de trocar por outro rótulo — uma vez engajado, o
  badge de status de resposta (`Visualizou`/`Respondido`) já é a
  informação relevante; mostrar "Enviado" seria impreciso (o e-mail não foi
  enviado com sucesso) e "Não enviado" seria enganoso da mesma forma que o
  problema original. Omitir é a opção mais honesta e também reduz um pouco
  a quantidade de badges por linha.

## Risks / Trade-offs

- [Risco] Se o admin quiser saber, depois do fato, se o e-mail automático
  chegou a falhar (ex.: pra investigar configuração de SMTP), essa
  informação fica menos visível uma vez que o participante engajou —
  aceitável, já que "Reenviar convite" continua disponível e o dado
  (`conviteStatus`) não é apagado, só não é mais destacado nessa tela.
