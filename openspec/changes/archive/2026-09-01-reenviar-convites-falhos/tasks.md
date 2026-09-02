## Tasks

- [x] 1. **Adicionar hook `useReenviarConvite`**: Em `src/admin/cotacoes/cotacoes.api.ts`, exportar um novo hook que faz `POST /api/participantes/{participanteId}/reenviar-convite` e, no `onSuccess`, invalida a query de participantes da cotação associada.
- [x] 2. **Implementar `handleDispararTodosEmail`**: Em `src/admin/cotacoes/RepresentantesModal.tsx`:
  - Usar o hook recém-criado.
  - No onClick, filtrar `filtrados` para pegar os itens com `isAberta` e que têm `part` com `conviteStatus !== 'ENVIADO'`.
  - Percorrer essa lista executando a mutation com `Promise.allSettled`.
  - Exibir toast apropriado baseado nos resultados (sucesso parcial, total ou erro).
  - Adicionar estado de loading (`isPending` ou state local) e desabilitar o botão enquanto roda.
- [x] 3. **Atualizar testes**: Se houver teste em `RepresentantesModal.test.tsx` (ou `CotacaoDetalhePage.test.tsx`) que testa o modal, adicionar um cenário onde ele clica em "Enviar Restantes" e verifica se o botão entra em estado de loading e se o toast é exibido (pode requerer mock do msw).
