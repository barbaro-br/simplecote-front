## 1. Gate por status da Cotação

- [x] 1.1 Em `RepresentantesModal.tsx`: adicionar `const podeGerenciarResposta = status === 'ABERTA' || status === 'ENCERRADA'`, e envolver o bloco que hoje renderiza os botões "Finalizar" (`e.part.participanteStatus === 'VISUALIZOU'`) e "Reabrir resposta" (`e.part.participanteStatus === 'RESPONDIDO'`) para só aparecerem quando `podeGerenciarResposta` também é verdadeiro.

## 2. Distinguir falha de envio

- [x] 2.1 Em `RepresentantesModal.tsx`, na renderização do rótulo de convite (linha ~272): trocar a lógica binária `enviado ? 'Enviado' : 'Não enviado'` por três casos — `conviteStatus === 'ENVIADO'` → rótulo atual; `conviteStatus === 'FALHOU'` → novo rótulo com destaque visual de erro (ex.: "Falha no envio", cor de destructive); qualquer outro valor → rótulo neutro "Não enviado" atual.

## 3. Testes

- [x] 3.1 Teste: modal de uma Cotação `PEDIDOS_GERADOS` com participante `RESPONDIDO` não mostra o botão "Reabrir resposta".
- [x] 3.2 Teste: modal de uma Cotação `CANCELADA` com participante `VISUALIZOU` não mostra o botão "Finalizar".
- [x] 3.3 Teste: modal de uma Cotação `ABERTA`/`ENCERRADA` continua mostrando os botões normalmente (sem regressão).
- [x] 3.4 Teste: participante com `conviteStatus: 'FALHOU'` exibe o rótulo de erro, diferente do rótulo de um participante nunca convidado/`conviteStatus` ausente.
- [x] 3.5 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [ ] 4.1 Testar com dados reais (dev): abrir o modal Representantes numa cotação `PEDIDOS_GERADOS` e confirmar que os botões somem; confirmar visualmente o novo rótulo de falha de envio.
