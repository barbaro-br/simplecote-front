## 1. Primitivo Dialog

- [x] 1.1 Criar `src/shared/components/ui/dialog.tsx` — `Dialog({ open, onClose, title, children })` com `createPortal(body)`, overlay clique-fora, `Escape` fecha, scroll-lock com cleanup, foco no container ao abrir e devolução ao fechar, `role="dialog"`/`aria-modal`/`aria-labelledby`, focus-trap simples de Tab. Verificar: teste — abre → container focado; `Escape`/clique-no-overlay → `onClose`; `open=false` → fora do DOM; desmontar com `open` → `body` volta a rolar.

## 2. Reescrever os dialogs de cotação sobre o primitivo

- [x] 2.1 `AbrirCotacaoDialog.tsx` e `ConfirmarDialog.tsx` passam a compor `<Dialog>` (mesma API externa, sem overlay próprio). Verificar: `npx vitest run src/admin/cotacoes` verde (os testes de "Apurar pede confirmação" e "abrir envia prazo ISO" seguem passando).

## 3. Migrar os 3 formulários pra modal

- [x] 3.1 `ProdutosPage` + `ProdutoForm`: "Novo produto"/"Editar" abre `<Dialog>` sobre a lista; `ProdutoForm` inalterado. Ajustar `produtos.test.tsx` pra `within(getByRole('dialog'))`. Verificar: teste — abrir modal, preencher, salvar → modal fecha, lista revalida; validação local segue exibindo erro sem request.
- [x] 3.2 `CotacaoDetalhePage` + `ItensSection`: "Adicionar item" abre `<Dialog>`. Ajustar o teste. Verificar: em `RASCUNHO` adiciona/remove item pelo modal; fora de `RASCUNHO` o botão não aparece.
- [x] 3.3 `EmpresasPage` + `EmpresaForm`: "Nova/Editar empresa" abre `<Dialog>`. Ajustar `empresas.test.tsx`. Verificar: criar empresa (+ representante) pelo modal → fecha, lista revalida.

## 4. Fechamento

- [x] 4.1 `npx vitest run` verde (novo teste do Dialog + os 3 ajustados + cotações), `npx tsc -b` 0, `npm run build` completa.
- [x] 4.2 `grep -rn "role=\"dialog\"" src/admin` — só via o primitivo (nenhum overlay à mão restante). `openspec validate dialogs-reutilizaveis` sem erros.
