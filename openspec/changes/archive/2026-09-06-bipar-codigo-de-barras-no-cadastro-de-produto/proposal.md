## Why

No cadastro de produto (`ProdutoForm`) o código de barras só entra **digitado à mão** — não há como bipar com a câmera o produto que o comprador tem na mão. Resultado prático: quase todo produto acaba salvo **sem** código de barras, o que enfraquece a busca do catálogo, o `lookup` de GTIN e a bipagem em cotação.

O fluxo do colaborador (`/colaborador/{token}`) já resolve isso com o componente `LeitorCodigoBarras` (câmera + `@zxing/browser`, lazy). Falta trazer o mesmo recurso para o cadastro do admin e, quando ainda assim salvarem sem código, pedir **uma confirmação** — o campo continua opcional (produtos de hortifruti/granel legitimamente não têm GTIN), mas deixa de ser esquecido por acidente.

Change **só de front**. Nenhuma mudança de contrato ou no `simplecote-back` (`codigo_barras` já é nullable e normalizado).

## What Changes

- **Botão "Bipar"** ao lado do campo de código de barras no `ProdutoForm` (tanto em Novo quanto em Editar):
  - abre o `LeitorCodigoBarras` em tela cheia (câmera traseira), **lazy** — `@zxing/browser` não entra no bundle principal;
  - ao ler um GTIN: preenche o campo `codigoBarras`, fecha a câmera e **dispara a busca do nome** (mesma rotina do botão "Buscar"/Enter);
  - permissão negada / sem câmera: a própria tela do leitor já mostra "Câmera indisponível — use a busca por texto"; o cadastro manual segue funcionando.
- **Confirmação ao salvar sem código de barras:** se o campo estiver vazio no submit, abre um diálogo "Salvar sem código de barras?" nomeando a consequência ("o produto ficará sem GTIN e não aparecerá em buscas por código nem na bipagem"). Confirmar salva; cancelar volta ao formulário com foco no campo. Com o campo preenchido, salva direto, sem diálogo.

## Capabilities

### Modified Capabilities

- `admin/produtos`: o cadastro de produto passa a permitir **capturar o código de barras pela câmera** (botão "Bipar", reusando `LeitorCodigoBarras`) e a **pedir confirmação** quando o produto for salvo sem código de barras.

## Impact

- **`LeitorCodigoBarras`**: hoje em `src/colaborador/`. Não tem nada de colaborador (só `onRead`/`onClose` + câmera). Mover para `src/shared/components/LeitorCodigoBarras.tsx` e atualizar o único import (o `lazy(() => import('./LeitorCodigoBarras'))` em `src/colaborador/ColaboradorPage.tsx:18-19`) + mover `LeitorCodigoBarras.test.tsx` junto. Alternativa (se preferir escopo menor): manter onde está e importar de `@/colaborador/LeitorCodigoBarras` no `ProdutoForm` — feio, mas evita mexer no colaborador.
- **`src/admin/produtos/ProdutoForm.tsx`**:
  - estado `bipando: boolean`; botão "Bipar" (ícone de câmera do `@phosphor-icons/react`, ex.: `Camera`) ao lado do "Buscar";
  - render condicional de `<LeitorCodigoBarras onRead={...} onClose={() => setBipando(false)} />` via `lazy` + `<Suspense>`, no padrão do `ColaboradorPage`;
  - `onRead(gtin)`: `form.setValue('codigoBarras', gtin, { shouldDirty: true, shouldValidate: true })`, `setBipando(false)`, e chamar `handleLookup()`;
  - estado `confirmandoSemCodigo: boolean`; no `aoEnviar`, se `!valores.codigoBarras?.trim()` e ainda não confirmado, abrir o diálogo em vez de enviar; confirmar re-chama o envio pulando a checagem.
- **Diálogo de confirmação**: reusar o padrão já usado no admin (`src/admin/cotacoes/ConfirmarDialog.tsx`) — se não for reaproveitável direto, um `Dialog` (`@/shared/components/ui/dialog`) simples com "Cancelar" / "Salvar sem código".
- **`src/admin/produtos/produtos.test.tsx`** (ou `ProdutoForm.test.tsx` novo): mockar `LeitorCodigoBarras` no padrão do `src/colaborador/ColaboradorPage.test.tsx:10` (`vi.mock('.../LeitorCodigoBarras', () => ({ LeitorCodigoBarras: ({ onRead, onClose }) => (...botões...) }))`). Casos:
  - clicar "Bipar" monta o leitor; `onRead('789…')` preenche o campo e dispara o `lookup` (MSW do `/api/produtos/lookup`);
  - submeter com código de barras vazio abre o diálogo; "Salvar sem código" prossegue e chama `POST /api/produtos`; "Cancelar" não chama;
  - submeter com código de barras preenchido **não** abre o diálogo.
- **Sem dependência nova** (`@zxing/browser` já está no projeto). Sem mudança no back. Sem mudança de schema (`codigoBarras` segue `.optional()`).
