## 1. Reordenar os botões

- [x] 1.1 Em `CotacaoDetalhePage.tsx`: mover o `<Button variant="outline" onClick={() => setModalConviteAberto(true)}>Representantes</Button>` (hoje dentro do `<div className="ml-auto flex items-center gap-2">`) para logo depois do bloco de botão de transição primária (Abrir/Encerrar/Reabrir+Apurar/link "Ver resultado"), fora do `ml-auto`, mantendo a condição existente `status !== 'CANCELADA'`.
- [x] 1.2 Deixar só o botão "Cancelar" dentro do `<div className="ml-auto flex items-center gap-2">`, mantendo sua condição existente (`status === 'RASCUNHO' || status === 'ABERTA'`) e o estilo já implementado (`variant="outline"`, tom destrutivo).

## 2. Testes

- [x] 2.1 Atualizar `CotacaoDetalhePage.test.tsx` se algum teste depender da ordem/posição relativa dos botões no DOM.
- [x] 2.2 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [x] 3.1 Testar manualmente (dev) nos status `RASCUNHO`, `ABERTA`, `ENCERRADA` e `PEDIDOS_GERADOS`: confirmar que "Representantes" aparece ao lado do botão de transição primária de cada status, e "Cancelar" (quando aplicável) aparece isolado no extremo direito. **(verificado visualmente pelo dono do produto em 05/09/2026)**
