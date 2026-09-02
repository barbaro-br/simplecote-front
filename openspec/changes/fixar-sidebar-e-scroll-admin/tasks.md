## 1. Restruturar o shell

- [x] 1.1 Em `AdminLayout.tsx`, trocar o root `<div className="flex min-h-screen">` por `<div className="flex h-screen overflow-hidden">`; verificar que a página não quebra visualmente em nenhuma rota.
- [x] 1.2 Tornar a `<aside>` `sticky top-0 h-screen` (mantendo a transição de largura já existente entre colapsada/expandida); verificar que ela permanece visível ao rolar uma rota com conteúdo longo.
- [x] 1.3 Tornar `<main>` o container de scroll (`h-screen overflow-y-auto`, mantendo `flex-1`); verificar que a barra de rolagem aparece dentro do `<main>`, não na janela.

## 2. Compatibilidade com o restante do app

- [x] 2.1 Verificar `ScrollRestoration` (`AdminLayout.tsx:60`) com o novo container de scroll — navegar entre 2 rotas admin e confirmar que o comportamento de restauração de scroll continua aceitável.
- [x] 2.2 Passar visualmente pelas rotas com dropdown/modal (ex.: filtro de status em `/admin/cotacoes`, formulários de usuário) e confirmar que nada ficou posicionado incorretamente com o novo contexto de scroll.

## 3. Verificar o sticky da grade ao vivo (não quebrar o que já existe)

- [x] 3.1 Abrir uma cotação com itens suficientes para rolar (`/admin/cotacoes/:id`) e confirmar visualmente que o header e a primeira coluna de `GradeAoVivoTabela.tsx` continuam fixos ao rolar verticalmente dentro do novo `<main>`.
- [x] 3.2 Se o sticky quebrar com o novo container, ajustar o `top`/contexto do sticky na tabela para o novo container de scroll; documentar o ajuste feito.

## 4. Testes e verificação final

- [x] 4.1 Atualizar/estender `AdminLayout.test.tsx` cobrindo os dois novos requirements (`admin/layout`): sidebar permanece visível durante scroll, e o scroll ocorre dentro da área de conteúdo.
- [x] 4.2 Rodar `npm test` completo e confirmar 0 regressões.

---

### Observações

As tasks **2.1**, **2.2** e **3.1** exigiam conferência em navegador — não executadas pelo agente (Opencode), verificadas manualmente depois: sidebar permanece fixa ao rolar, modal "Apurar cotação" abre centralizado corretamente (novo container de scroll não afeta o `Dialog`, que usa portal pro `document.body`), e navegação entre `/admin/produtos` → `/admin/cotacoes` não quebra nada. A task **3.2** era condicional a 3.1: como o sticky da grade ao vivo continuou funcionando sem ajuste (confirmado visualmente), nada precisou ser alterado em `GradeAoVivoTabela.tsx` — a análise estrutural do agente (container de scroll da grade não foi tocado por esta change) se confirmou correta.
