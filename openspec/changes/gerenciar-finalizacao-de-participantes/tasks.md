## 1. API

- [ ] 1.1 Em `src/admin/cotacoes/cotacoes.api.ts`: novo hook `useFinalizarParticipante(cotacaoId)`, espelhando `useReabrirParticipante` (chama `POST /api/participantes/{participanteId}/finalizar`, invalida `participantesKey(cotacaoId)` no sucesso).

## 2. ConfirmarDialog

- [ ] 2.1 Em `src/admin/cotacoes/ConfirmarDialog.tsx`: adicionar prop opcional `children?: ReactNode`, renderizado entre a descrição e os botões.

## 3. Seção de participantes

- [ ] 3.1 Novo componente `src/admin/cotacoes/ParticipantesPainel.tsx`: recebe `cotacaoId`, usa `useParticipantes(cotacaoId)`, `useFinalizarParticipante(cotacaoId)` e `useReabrirParticipante(cotacaoId)`; renderiza uma linha por participante com nome da Empresa/representante, badge de status (`Convidado`/`Visualizou`/`Respondido`) e o botão de ação aplicável.
- [ ] 3.2 Em `CotacaoDetalhePage.tsx`: renderizar `<ParticipantesPainel>` quando `status === 'ABERTA' || status === 'ENCERRADA'` (mesma condição da grade ao vivo).

## 4. Aviso no diálogo de Apurar

- [ ] 4.1 Em `CotacaoDetalhePage.tsx`: ao montar o `ConfirmarDialog` de `apurar`, usar os dados já buscados de `useParticipantes` pra filtrar `participanteStatus === 'VISUALIZOU'` e, se houver algum, renderizar a lista de nomes como `children` do diálogo.

## 5. Testes

- [ ] 5.1 Teste: `ParticipantesPainel` mostra o botão "Finalizar" só pra participantes `VISUALIZOU` e "Reabrir resposta" só pra `RESPONDIDO`.
- [ ] 5.2 Teste: acionar "Finalizar" chama a mutation e, no sucesso, o participante deixa de mostrar o botão (status atualizado).
- [ ] 5.3 Teste: diálogo de Apurar mostra a lista de pendentes quando há participantes `VISUALIZOU`, e nada quando não há.
- [ ] 5.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
