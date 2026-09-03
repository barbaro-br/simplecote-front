## 1. API

- [x] 1.1 Em `src/admin/cotacoes/cotacoes.api.ts`: novo hook `useFinalizarParticipante(cotacaoId)`, espelhando `useReabrirParticipante` (chama `POST /api/participantes/{participanteId}/finalizar`, invalida `participantesKey(cotacaoId)` no sucesso).

## 2. ConfirmarDialog

- [x] 2.1 Em `src/admin/cotacoes/ConfirmarDialog.tsx`: adicionar prop opcional `children?: ReactNode`, renderizado entre a descrição e os botões.

## 3. Enriquecer o modal "Representantes" com status de resposta

- [x] 3.0 Excluir `src/admin/cotacoes/ParticipantesPainel.tsx` e `ParticipantesPainel.test.tsx` (criados numa iteração anterior desta change, descartados — ver design.md) e remover qualquer referência a eles em `CotacaoDetalhePage.tsx`.
- [x] 3.1 Em `RepresentantesModal.tsx`: importar e usar `useFinalizarParticipante(cotacaoId)` e `useReabrirParticipante(cotacaoId)` (ao lado do `useParticipantes` já usado ali).
- [x] 3.2 Na área "Badges e Ações Direita" de cada linha (por volta da linha 237-280 hoje), quando `isAberta && e.part`: adicionar um badge com o `participanteStatus` do participante (`e.part.participanteStatus` — rótulos "Convidado"/"Visualizou"/"Respondido"), ao lado do badge de `conviteStatus` já existente; e, na área "Ações Rápidas" (que já tem os ícones de WhatsApp/copiar link), adicionar o botão de ação aplicável: "Finalizar" quando `VISUALIZOU` (chama `finalizar.mutateAsync(e.part.participanteId)`), "Reabrir resposta" quando `RESPONDIDO` (chama `reabrir.mutateAsync(e.part.participanteId)`); nenhum botão quando `CONVIDADO`.
- [x] 3.3 Tratar erro das duas mutations com `toast.error(...)`, mesmo padrão já usado pro `convidar` nesse arquivo.

## 4. Aviso no diálogo de Apurar

- [x] 4.1 Em `CotacaoDetalhePage.tsx`: ao montar o `ConfirmarDialog` de `apurar`, usar os dados já buscados de `useParticipantes` pra filtrar `participanteStatus === 'VISUALIZOU'` e, se houver algum, renderizar a lista de nomes como `children` do diálogo.

## 5. Testes

- [x] 5.1 Criar `src/admin/cotacoes/RepresentantesModal.test.tsx`: teste cobrindo que, com a Cotação `ABERTA`/`ENCERRADA`, um participante `VISUALIZOU` mostra o botão "Finalizar" (e não "Reabrir resposta"), e um `RESPONDIDO` mostra "Reabrir resposta" (e não "Finalizar").
- [x] 5.2 Teste: acionar "Finalizar" chama a mutation e, no sucesso, a linha passa a refletir `Respondido` (mock da API + reconsulta de `useParticipantes`).
- [x] 5.3 Teste: diálogo de Apurar mostra a lista de pendentes quando há participantes `VISUALIZOU`, e nada quando não há (independe do modal — continua vindo de `useParticipantes` direto em `CotacaoDetalhePage`).
- [x] 5.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
