## Overview

O modal de Representantes (`RepresentantesModal.tsx`) já possui um botão "Enviar Restantes" e calcula quantos participantes estão com o convite pendente (`naoEnviadoCount`). Atualmente o clique apenas dispara um toast informando que não está implementado.

Para implementar isso no front:
1. Devemos consumir o endpoint `POST /api/participantes/{participanteId}/reenviar-convite`.
2. Como não existe um endpoint de reenvio em lote (bulk), o frontend iterará sobre os participantes filtrados cujo `conviteStatus` seja diferente de `ENVIADO`.
3. Para cada um, chamará a mutation `useReenviarConvite(participanteId)` do React Query, usando `Promise.allSettled` para que um erro em um participante não aborte o envio dos outros.
4. Enquanto aguarda, o botão "Enviar Restantes" deverá mostrar estado de loading e ser desabilitado.
5. Em caso de sucesso ou erro, um toast correspondente deve ser mostrado, e a lista de participantes deve ser invalidada no React Query (`['cotacao', cotacaoId, 'participantes']` provável key) para buscar o novo status de envio.

## UX/UI Design

- O botão "Enviar Restantes" terá um ícone de spinner (Loader2 com animate-spin) ou texto "Enviando..." enquanto `isPending` for verdadeiro.
- Ao concluir, se houver falhas, um `toast.error` ou warning avisará o usuário ("X convites enviados, Y falharam").
- Se todos enviarem com sucesso, `toast.success("Todos os convites reenviados!")`.
- Após a conclusão, a lista refetchada atualizará o badge de "Não enviado" para "Enviado".

## Technical Architecture

- **`cotacoes.api.ts`**: Adicionar um hook `useReenviarConvite(participanteId)` que chama `api.post(\`/api/participantes/\${participanteId}/reenviar-convite\`)` e invalida as queries relacionadas à cotação.
- **`RepresentantesModal.tsx`**: 
  - Adicionar um estado local `isEnviando` ou usar `useMutation` no nível do componente (ou passar os IDs para o hook).
  - Atualizar `handleDispararTodosEmail` para iterar nos representantes com `part.conviteStatus !== 'ENVIADO'`, executar o POST e exibir os toasts de conclusão.
