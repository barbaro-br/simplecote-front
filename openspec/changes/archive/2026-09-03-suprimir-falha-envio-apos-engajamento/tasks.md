## 1. Suprimir o badge após engajamento

- [x] 1.1 Em `RepresentantesModal.tsx`, no ponto onde o badge de `conviteStatus` é renderizado (`enviado`/`Falha no envio`/`Não enviado`): envolver essa renderização numa condição adicional `e.part.participanteStatus === 'CONVIDADO'` — quando falso, não renderizar nenhum badge de convite (só os badges de status de resposta, já existentes, continuam).

## 2. Testes

- [x] 2.1 Teste: participante com `conviteStatus: 'FALHOU'` e `participanteStatus: 'CONVIDADO'` continua mostrando o badge "Falha no envio" (sem regressão).
- [x] 2.2 Teste: participante com `conviteStatus: 'FALHOU'` e `participanteStatus: 'VISUALIZOU'` não mostra nenhum badge de convite.
- [x] 2.3 Teste: participante com `conviteStatus: 'FALHOU'` e `participanteStatus: 'RESPONDIDO'` não mostra nenhum badge de convite.
- [x] 2.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [x] 3.1 Testar com dados reais (dev): um participante com `conviteStatus: FALHOU` que finaliza a resposta deixa de mostrar "Falha no envio" no modal Representantes, mantendo só o badge "Respondido".
