## 1. Resumo na tela de detalhe

- [ ] 1.1 `CotacaoDetalhePage.tsx`: `entregues = (participantes.data ?? []).filter(p => p.conviteStatus === 'ENVIADO').length`, `total = (participantes.data ?? []).length`
- [ ] 1.2 Quando `status` ∈ {`ABERTA`, `ENCERRADA`} e `total > 0`, mostrar no cabeçalho "N de M convites entregues"
- [ ] 1.3 Se `entregues < total`, uma ação ("ver" / ícone de alerta) que abre o `RepresentantesModal`

## 2. Mensagem do WhatsApp padronizada

- [ ] 2.1 `RepresentantesModal.tsx`: trocar o texto inline do botão WhatsApp por `montarMensagemConvite({ representanteNome, titulo, empresaNome, prazo, link })` + `urlWhatsApp(msg, whatsapp)` de `compartilhar-link.ts`
- [ ] 2.2 Garantir que `titulo` da cotação e `prazo` chegam ao modal (via prop ou `useCotacao`)

## 3. Testes

- [ ] 3.1 `CotacaoDetalhePage.test.tsx`: "N de M convites entregues" com participantes mistos (`ENVIADO`/`FALHOU`); ausente em `RASCUNHO`; a ação "ver" abre o modal
- [ ] 3.2 `RepresentantesModal.test.tsx`: o `href` do WhatsApp contém a mensagem do helper (nome do representante, título da cotação, link)
- [ ] 3.3 `npm test` + `npm run build` + `npm run lint` verdes
