## 1. Restruturar o shell

- [ ] 1.1 Em `AdminLayout.tsx`, trocar o root `<div className="flex min-h-screen">` por `<div className="flex h-screen overflow-hidden">`; verificar que a página não quebra visualmente em nenhuma rota.
- [ ] 1.2 Tornar a `<aside>` `sticky top-0 h-screen` (mantendo a transição de largura já existente entre colapsada/expandida); verificar que ela permanece visível ao rolar uma rota com conteúdo longo.
- [ ] 1.3 Tornar `<main>` o container de scroll (`h-screen overflow-y-auto`, mantendo `flex-1`); verificar que a barra de rolagem aparece dentro do `<main>`, não na janela.

## 2. Compatibilidade com o restante do app

- [ ] 2.1 Verificar `ScrollRestoration` (`AdminLayout.tsx:60`) com o novo container de scroll — navegar entre 2 rotas admin e confirmar que o comportamento de restauração de scroll continua aceitável.
- [ ] 2.2 Passar visualmente pelas rotas com dropdown/modal (ex.: filtro de status em `/admin/cotacoes`, formulários de usuário) e confirmar que nada ficou posicionado incorretamente com o novo contexto de scroll.

## 3. Verificar o sticky da grade ao vivo (não quebrar o que já existe)

- [ ] 3.1 Abrir uma cotação com itens suficientes para rolar (`/admin/cotacoes/:id`) e confirmar visualmente que o header e a primeira coluna de `GradeAoVivoTabela.tsx` continuam fixos ao rolar verticalmente dentro do novo `<main>`.
- [ ] 3.2 Se o sticky quebrar com o novo container, ajustar o `top`/contexto do sticky na tabela para o novo container de scroll; documentar o ajuste feito.

## 4. Testes e verificação final

- [ ] 4.1 Atualizar/estender `AdminLayout.test.tsx` cobrindo os dois novos requirements (`admin/layout`): sidebar permanece visível durante scroll, e o scroll ocorre dentro da área de conteúdo.
- [ ] 4.2 Rodar `npm test` completo e confirmar 0 regressões.
