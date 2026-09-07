## 1. Tornar o leitor de câmera reutilizável

- [x] 1.1 Mover `src/colaborador/LeitorCodigoBarras.tsx` → `src/shared/components/LeitorCodigoBarras.tsx` (e o `.test.tsx` junto); ajustar o `lazy(() => import('./LeitorCodigoBarras'))` em `src/colaborador/ColaboradorPage.tsx` para o novo caminho. `npm run build` verde confirma que não sobrou import quebrado.
- [x] 1.2 (Se optar por não mover) documentar no diff por que o `ProdutoForm` importa de `@/colaborador/...`

## 2. Botão "Bipar" no ProdutoForm

- [x] 2.1 `ProdutoForm.tsx`: estado `bipando`; botão **Bipar** (ícone `Camera` do `@phosphor-icons/react`) ao lado do botão "Buscar", mesma faixa do campo de código de barras
- [x] 2.2 Render de `<LeitorCodigoBarras />` via `lazy` + `<Suspense fallback={null}>`, só quando `bipando` (padrão do `ColaboradorPage`) — mantém `@zxing/browser` fora do bundle principal
- [x] 2.3 `onRead(gtin)`: `form.setValue('codigoBarras', gtin, { shouldDirty: true, shouldValidate: true })`, `setBipando(false)` e chamar `handleLookup()` (mesma busca do "Buscar"/Enter)
- [x] 2.4 `onClose`: `setBipando(false)`; o estado de erro de câmera fica no próprio `LeitorCodigoBarras`, cadastro manual segue disponível

## 3. Confirmação ao salvar sem código de barras

- [x] 3.1 `ProdutoForm.tsx`: estado `confirmandoSemCodigo`; em `aoEnviar`, se `!valores.codigoBarras?.trim()` e não veio de confirmação, abrir o diálogo em vez de enviar
- [x] 3.2 Diálogo "Salvar sem código de barras?" nomeando a consequência (sem GTIN → fora de buscas por código e da bipagem); ações **Cancelar** (volta ao form, foco no campo `codigoBarras`) e **Salvar sem código** (prossegue o envio)
- [x] 3.3 Com `codigoBarras` preenchido: envio direto, sem diálogo
- [x] 3.4 Reusar `src/admin/cotacoes/ConfirmarDialog.tsx` se couber; senão `Dialog` de `@/shared/components/ui/dialog`

## 4. Testes

- [x] 4.1 Mockar `LeitorCodigoBarras` no padrão de `src/colaborador/ColaboradorPage.test.tsx` (componente fake com botões que chamam `onRead`/`onClose`)
- [x] 4.2 "Bipar" monta o leitor; `onRead('7891234567890')` preenche o campo de código de barras e dispara o `lookup` (`GET /api/produtos/lookup?gtin=` via MSW), preenchendo o nome
- [x] 4.3 Submeter com código de barras vazio abre o diálogo; "Salvar sem código" chama `POST /api/produtos`; "Cancelar" não chama e mantém o form aberto
- [x] 4.4 Submeter com código de barras preenchido NÃO abre o diálogo
- [x] 4.5 `npm test` + `npm run build` + `npm run lint` verdes
