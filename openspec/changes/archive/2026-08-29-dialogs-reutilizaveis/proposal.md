## Why

Hoje "Novo produto", "Adicionar item" e "Nova/Editar empresa" **trocam a tela inteira** — o formulário aparece no lugar da lista, some o contexto. Já existem dois dialogs feitos à mão (`AbrirCotacaoDialog`, `ConfirmarDialog`) em `src/admin/cotacoes/`, cada um reimplementando overlay/foco. Falta um primitivo e o padrão de "form em modal".

## What Changes

- **`src/shared/components/ui/dialog.tsx`** — primitivo `Dialog` reutilizável: `createPortal` num nó no `body`, overlay com clique-fora pra fechar, `Escape` fecha, foco vai pro primeiro campo ao abrir e volta ao gatilho ao fechar, `role="dialog"` + `aria-modal` + `aria-labelledby`, trava o scroll do body. Extraído da lógica que `AbrirCotacaoDialog`/`ConfirmarDialog` já têm.
- **`AbrirCotacaoDialog` e `ConfirmarDialog`** reescritos sobre o primitivo (mesma API externa, sem duplicar overlay).
- **Migrar pra modal** (sem mudar campos, validação ou chamadas de API — só a apresentação):
  - `ProdutoForm` — "Novo produto"/"Editar produto" abre em `Dialog` sobre a `ProdutosPage`.
  - `ItensSection` — "Adicionar item" abre em `Dialog` sobre o `CotacaoDetalhePage`.
  - `EmpresaForm` — "Nova/Editar empresa" abre em `Dialog` sobre a `EmpresasPage`.
- Ao salvar com sucesso, o modal fecha e a lista revalida (comportamento que os `aoSalvar` já disparam).

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
Nenhuma. Refactor de apresentação: os mesmos formulários, com os mesmos campos, a mesma validação `zod` e as mesmas mutações, passam a renderizar dentro de um modal em vez de substituir a tela. Nenhum requisito de spec muda (ex.: `admin/produtos` "Erro de validação local" continua: erros abaixo dos campos, sem enviar). `.openspec.yaml` declara `skip_specs: true`.

## Impact

- Novo: `src/shared/components/ui/dialog.tsx` + teste.
- Edição: `src/admin/cotacoes/AbrirCotacaoDialog.tsx`, `ConfirmarDialog.tsx` (reescritos sobre o primitivo), `src/admin/produtos/ProdutosPage.tsx` + `ProdutoForm.tsx`, `src/admin/cotacoes/CotacaoDetalhePage.tsx` + `ItensSection.tsx`, `src/admin/empresas/EmpresasPage.tsx` + `EmpresaForm.tsx`.
- Testes das telas afetadas: ajustar as queries (o form agora está num `role="dialog"`; `getByRole('dialog')` + `within`). Comportamento asserido não muda.
- **Habilita** `criar-produto-no-fluxo-da-cotacao` (precisa de modal aninhável).
