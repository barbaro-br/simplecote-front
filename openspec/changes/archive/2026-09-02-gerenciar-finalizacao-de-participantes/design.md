## Context

`useParticipantes(cotacaoId)` (`cotacoes.api.ts`) já busca `GET /api/cotacoes/{id}/participantes`, retornando `ParticipanteDaCotacao[]` com `participanteStatus: 'CONVIDADO'|'VISUALIZOU'|'RESPONDIDO'` (`cotacoes.schema.ts`) — hoje esse campo não é lido em lugar nenhum do front. `useReabrirParticipante(cotacaoId)` já existe e já chama `POST /api/participantes/{id}/reabrir`, também sem consumidor. A tela de detalhe (`CotacaoDetalhePage.tsx`) já tem o padrão de diálogo de confirmação (`ConfirmarDialog`) pra Apurar/Cancelar, e a grade ao vivo (`GradeAoVivoTabela`) é onde hoje se corrige lance por participante — mas ela não expõe `participanteStatus` por coluna (só o status do lance por célula), então não é o lugar certo pra essa ação; ela pertence à granularidade de participante, não de lance.

`RepresentantesModal.tsx` já usa `useParticipantes(cotacaoId)` pra montar a mesma lista (uma linha por Empresa/representante convidado), já muda de título ("Convidar Empresas" → "Representantes Convidados") e de comportamento quando `isAberta`, e já mostra, por linha, um badge de `conviteStatus` (Enviado/Não enviado) mais ações de convite (copiar link, WhatsApp, e-mail, reenviar). Ou seja: quando a Cotação está `ABERTA`/`ENCERRADA`, esse modal já É a tela "participantes" — só falta mostrar o outro eixo de status (a resposta, não o convite).

## Goals / Non-Goals

**Goals:**
- Dar visibilidade ao estado de cada participante (Convidado/Visualizou/Respondido) na tela de detalhe.
- Deixar claro, antes de apurar, quando há participantes que engajaram mas não finalizaram.
- Reusar o hook `useReabrirParticipante` já existente em vez de duplicar.

**Non-Goals:**
- Não muda a grade ao vivo (`GradeAoVivoTabela`) — o status/ação por participante fica no modal de participantes, não em preço por item.
- Não bloqueia o Comprador de apurar mesmo havendo participantes pendentes — só avisa; a decisão de seguir em frente é do Comprador (`spec.md` já trata isso como escolha do negócio, não do sistema).
- Não cria um segundo botão/modal pra "participantes" — ver Decisions.

## Decisions

- **Enriquecer `RepresentantesModal.tsx` em vez de criar um botão/modal novo.** Considerado (e descartado): um botão "Participantes" separado abrindo um modal dedicado. Rejeitado porque é a mesma lista de participantes que `RepresentantesModal` já mostra quando `isAberta` — dois botões pra "ver quem está na cotação" obrigaria o Comprador a adivinhar qual clicar (convite? resposta?) e duplicaria a busca/filtro/lista já implementados. Em vez disso, cada linha do modal existente (quando `isAberta`) passa a trazer também um badge do `participanteStatus` (Convidado/Visualizou/Respondido) e o botão de ação aplicável (`Finalizar`/`Reabrir resposta`), ao lado do badge de `conviteStatus` e das ações de convite que já existem ali.
- O componente `ParticipantesPainel.tsx` criado numa iteração anterior desta change é descartado (sua lógica — badges de status + ações finalizar/reabrir — é incorporada diretamente às linhas de `RepresentantesModal.tsx`, não vive num arquivo/modal separado).
- **`ConfirmarDialog` ganha `children?: ReactNode`** renderizado entre a descrição e os botões, em vez de duplicar o componente ou forçar a lista de pendentes dentro da prop `descricao: string` — mudança aditiva, não quebra os usos existentes (Apurar, Cancelar).
- **O aviso no diálogo de Apurar é só informativo** (lista os nomes dos participantes `VISUALIZOU`) — não é um novo passo de confirmação nem trava o botão "Apurar"; o Comprador já vê o aviso e decide. Continua vindo direto de `useParticipantes` em `CotacaoDetalhePage.tsx`, independente do modal.

## Risks / Trade-offs

- [Risco] Enquanto o backend (`permitir-finalizar-participante-pelo-admin`) não estiver em produção, o botão "Finalizar" chama um endpoint inexistente. Mitigação: aplicar essa change depois da do back (mesma ordem já estabelecida pra `sinalizar-desempate`/`exibir-desempate`).
- [Risco] `RepresentantesModal.tsx` cresce em responsabilidade (convite + resposta). Aceitável: é a mesma entidade (Participante) vista por completo, e o alternativa (dois modais) tem custo de UX maior que o custo de um componente um pouco mais rico.
