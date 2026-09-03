## 1. Distinguir o estado "aguardando envio"

- [x] 1.1 Em `PedidoPorTokenPage.tsx`: adicionar `const aguardandoEnvio = p.status === 'GERADO'`.
- [x] 1.2 Envolver o bloco do botão "Confirmar" e o campo de observação (linhas ~103-141) para só renderizar quando `!aguardandoEnvio && !confirmado`.
- [x] 1.3 Quando `aguardandoEnvio` for verdadeiro, mostrar uma mensagem curta no lugar (ex.: "Aguardando envio pelo comprador."), mantendo "Baixar PDF" visível como está hoje.

## 2. Testes

- [x] 2.1 Teste: pedido com `status: 'GERADO'` não renderiza o botão "Confirmar" nem o campo de observação, e mostra a mensagem de aguardando envio.
- [x] 2.2 Teste: pedido com `status: 'ENVIADO'` continua mostrando "Confirmar" normalmente (sem regressão).
- [x] 2.3 Teste: pedido com `status: 'CONFIRMADO'` continua mostrando a tela de sucesso normalmente (sem regressão).
- [x] 2.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 3. Verificação visual

- [ ] 3.1 Testar com dados reais (dev): gerar um pedido sem enviar, abrir `/pedido/:token` e confirmar visualmente que "Confirmar" não aparece; depois enviar pelo admin e confirmar que o botão passa a aparecer.
