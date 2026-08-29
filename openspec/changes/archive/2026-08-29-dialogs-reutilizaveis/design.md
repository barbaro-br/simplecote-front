## Context

Ver `proposal.md`. Estado:

- `AbrirCotacaoDialog` e `ConfirmarDialog` já implementam overlay + `role="dialog"` à mão em `src/admin/cotacoes/`.
- `ProdutoForm`, `EmpresaForm`, `ItensSection` são renderizados condicionalmente (`{mostrarForm && <Form/>}`) no lugar da lista.
- `@base-ui/react` está no `package.json` (veio do scaffold shadcn) mas não é usado. Primitivos de UI ficam em `src/shared/components/ui/`.
- `spec.md` §4.4: toda tela nova tem teste; §7 mobile-first só na tela do representante (modais do admin são desktop).

## Goals / Non-Goals

**Goals:**
- Um `Dialog` acessível e testável, dono de portal/foco/esc/scroll-lock.
- Os 3 formulários do admin em modal, sem regressão de comportamento.
- Menos código: os 2 dialogs de cotação param de duplicar overlay.

**Non-Goals:**
- Adotar `@base-ui/react` ou Radix agora — um primitivo próprio de ~60 linhas cobre o caso e evita a dependência (mesma filosofia "sem lib por conveniência" do `spec.md` §3). Pode-se trocar depois sem mexer nos call-sites.
- Animação de entrada/saída elaborada (um `fade`/`scale` via CSS basta).
- Mudar qualquer validação, campo ou chamada de API dos formulários.

## Decisions

### 1. `Dialog` próprio via `createPortal`
`src/shared/components/ui/dialog.tsx`:
```
<Dialog open onClose title> {children} </Dialog>
```
- `createPortal(node, document.body)`; monta só quando `open`.
- Overlay `fixed inset-0 bg-black/40`; clique no overlay → `onClose`.
- `useEffect`: `document.body.style.overflow='hidden'` enquanto aberto; listener de `keydown` Escape → `onClose`; ao montar, `ref` do container recebe foco (ou o primeiro `[autofocus]`); ao desmontar, devolve foco ao `document.activeElement` capturado na abertura.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no `<h2>` do título.
- Focus trap simples: `keydown` Tab que cicla dentro do container (querySelectorAll de focáveis).

- Alternativa `<dialog>` nativo + `showModal()`: bom, mas o polyfill de foco/estilo do `::backdrop` varia e o teste com jsdom é irregular. O portal manual é previsível.

### 2. Padrão "form em modal"
Cada `*Page` mantém o estado `formAberto` (+ `itemParaEditar` quando aplica) e renderiza `<Dialog open={formAberto} onClose={...}><XForm aoSalvar={fecha}/></Dialog>` em vez de `{formAberto && <XForm/>}`. O `XForm` **não muda** — ele já recebe `aoSalvar`. O botão "Novo X" só faz `setFormAberto(true)`.

### 3. Reescrever os 2 dialogs de cotação sobre o primitivo
`AbrirCotacaoDialog` (coleta `prazo`) e `ConfirmarDialog` (título/descrição/ação) passam a compor `<Dialog>`; a API que `CotacaoDetalhePage` consome não muda.

### 4. Testes
Os testes das 3 telas passam a buscar o form via `within(screen.getByRole('dialog'))`. Novo teste do `Dialog`: abre → foco no container; `Escape` → `onClose`; clique no overlay → `onClose`; fechado → não está no DOM.

## Risks / Trade-offs

- **Focus trap incompleto** deixa Tab escapar do modal — implementação mínima cobre o comum; não é um requisito AA rígido pra um painel interno. Aceitável, documentar como "melhorável".
- **`createPortal` + jsdom** — RTL lida bem; garantir que o `render` limpa o portal entre testes (o `Dialog` desmonta ao `open=false`).
- **Scroll-lock vazando** se o componente desmontar sem passar por `open=false` — o cleanup do `useEffect` restaura `overflow`. Cobrir com teste (desmontar com `open` → `body.style.overflow` volta).
- **Testes existentes das 3 telas** vão quebrar nas queries → parte do escopo ajustá-los (comportamento asserido idêntico).
