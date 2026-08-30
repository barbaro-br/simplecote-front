## 1. Refatoração Visual do Modal

- [x] 1.1 Remover completamente o campo de busca (`<input />`) e o estado `busca` de `RepresentantesModal.tsx`, pois não são mais necessários em nenhum fluxo.
- [x] 1.2 Garantir e adicionar na listagem de participantes (quando aberta) as 3 ações (WhatsApp, E-mail, Copiar) como botões iconográficos de tamanho reduzido (`size="icon" variant="ghost"`). Validar os tooltips via `title`.

## 2. Ação de E-mail em Lote

- [x] 2.1 Criar a função mock de disparo de e-mail em lote (para todos os participantes) dentro de `RepresentantesModal.tsx` que chame `toast.success('Envio de e-mails em lote iniciado (Simulação)')`.
- [x] 2.2 Inserir o botão global "Disparar Todos (E-mail)" no rodapé do modal (próximo ao botão de Fechar) quando a cotação estiver em estado `ABERTA`, linkado à nova função de mock. Garantir que a renderização ocorra sem quebrar o layout.

## 3. Testes

- [x] 3.1 Executar a suíte de testes de `src/admin/cotacoes` para garantir que a remoção do input de busca e a alteração dos botões não quebrou os testes existentes.
