## Context

`useParticipantes(cotacaoId)` (`cotacoes.api.ts`) já busca `GET /api/cotacoes/{id}/participantes`, retornando `ParticipanteDaCotacao[]` com `participanteStatus: 'CONVIDADO'|'VISUALIZOU'|'RESPONDIDO'` (`cotacoes.schema.ts`) — hoje esse campo não é lido em lugar nenhum do front. `useReabrirParticipante(cotacaoId)` já existe e já chama `POST /api/participantes/{id}/reabrir`, também sem consumidor. A tela de detalhe (`CotacaoDetalhePage.tsx`) já tem o padrão de diálogo de confirmação (`ConfirmarDialog`) pra Apurar/Cancelar, e a grade ao vivo (`GradeAoVivoTabela`) é onde hoje se corrige lance por participante — mas ela não expõe `participanteStatus` por coluna (só o status do lance por célula), então não é o lugar certo pra essa ação; ela pertence à granularidade de participante, não de lance.

## Goals / Non-Goals

**Goals:**
- Dar visibilidade ao estado de cada participante (Convidado/Visualizou/Respondido) na tela de detalhe.
- Deixar claro, antes de apurar, quando há participantes que engajaram mas não finalizaram.
- Reusar o hook `useReabrirParticipante` já existente em vez de duplicar.

**Non-Goals:**
- Não muda a grade ao vivo (`GradeAoVivoTabela`) — a nova seção de participantes é separada, focada em status/ação por participante, não em preço por item.
- Não bloqueia o Comprador de apurar mesmo havendo participantes pendentes — só avisa; a decisão de seguir em frente é do Comprador (`spec.md` já trata isso como escolha do negócio, não do sistema).

## Decisions

- **Seção "Participantes" nova, ao lado da grade** (não dentro da `RepresentantesModal`, que é sobre convites/seleção de Empresas antes de abrir, nem dentro da `GradeAoVivoTabela`, que é sobre preço por item) — granularidade certa: uma linha por participante, com seu status e as duas ações admin (finalizar/reabrir) que fazem sentido nesse nível.
- **`ConfirmarDialog` ganha `children?: ReactNode`** renderizado entre a descrição e os botões, em vez de duplicar o componente ou forçar a lista de pendentes dentro da prop `descricao: string` — mudança aditiva, não quebra os usos existentes (Apurar, Cancelar).
- **O aviso no diálogo de Apurar é só informativo** (lista os nomes dos participantes `VISUALIZOU`) — não é um novo passo de confirmação nem trava o botão "Apurar"; o Comprador já vê o aviso e decide.

## Risks / Trade-offs

- [Risco] Enquanto o backend (`permitir-finalizar-participante-pelo-admin`) não estiver em produção, o botão "Finalizar" chama um endpoint inexistente. Mitigação: aplicar essa change depois da do back (mesma ordem já estabelecida pra `sinalizar-desempate`/`exibir-desempate`).
