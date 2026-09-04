## 1. Finalizar a partir de Convidado

- [x] 1.1 No `RepresentantesModal`, oferecer o botão "Finalizar" também quando `participanteStatus === 'CONVIDADO'` (hoje só aparece para `VISUALIZOU`), reaproveitando `useFinalizarParticipante`
- [x] 1.2 Atualizar/adicionar teste em `RepresentantesModal.test.tsx` cobrindo: participante `Convidado` mostra "Finalizar"; ao acionar, chama a API e a linha passa a mostrar `Respondido`
- [x] 1.3 Rodar `npx tsc -b`, `npx oxlint` e `npx vitest run` — sem regressões

## 2. Aviso e finalização em massa antes de Encerrar

- [x] 2.1 Em `CotacaoDetalhePage.tsx`, calcular a lista de participantes com ≥1 lance `COTADO` (via dado da Grade ao Vivo já carregado) e `participanteStatus !== 'RESPONDIDO'`
- [x] 2.2 No diálogo de confirmação de "Encerrar", quando essa lista não estiver vazia, listar os nomes e mostrar um botão "Finalizar todos antes de encerrar"
- [x] 2.3 Implementar a finalização em massa com `Promise.allSettled` sobre `useFinalizarParticipante`, mesmo padrão de `handleDispararTodosEmail`; recalcular a lista de pendentes após a resposta e mostrar quem ainda falhou
- [x] 2.4 Escrever testes cobrindo: diálogo sem pendências não mostra o aviso; diálogo com pendências lista os nomes e finaliza em massa ao clicar; "Encerrar" continua funcionando normalmente mesmo com o aviso visível (não bloqueia a confirmação)
- [x] 2.5 Rodar `npx tsc -b`, `npx oxlint` e `npx vitest run` — sem regressões

## 3. Popover de linha do tempo do participante — implementado e depois revertido

- [x] 3.1 Confirmar que o back (mudança irmã) já expõe `conviteEnviadoEm`, `visualizadoEm` e `respondidoEm` em `GET /api/cotacoes/{id}/participantes` antes de iniciar esta seção
- [x] 3.2 ~~Adicionar o ícone de informação...~~ Implementado e, a pedido explícito do usuário em revisão de layout ao vivo ("do card de representantes vamos remover o icone de informacoes"), **removido** do `RepresentantesModal` — o ícone de informação e o popover de linha do tempo não fazem mais parte do card. O backend continua expondo os timestamps (usados por outras partes da UI), só o popover no card foi descartado.
- [x] 3.3 ~~Escrever teste cobrindo o popover~~ — teste removido junto com a feature (não há mais popover a cobrir)
- [x] 3.4 Rodar `npx tsc -b`, `npx oxlint` e `npx vitest run` — sem regressões, após a remoção

## 4. Verificação end-to-end

- [x] 4.1 Backend da mudança irmã confirmado rodando localmente (`:8080`, `/actuator/health` → 200). Verificação manual no navegador (finalizar um `Convidado`, aviso de Encerrar com pendências reais) não pôde ser feita nesta sessão — extensão Chrome não conectada neste ambiente em background; recomenda-se checagem manual pelo usuário antes ou depois do merge, como reforço à cobertura de testes automatizados (que já passam integralmente).
