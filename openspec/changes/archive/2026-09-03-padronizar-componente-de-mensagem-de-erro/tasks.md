## 1. Componente compartilhado

- [x] 1.1 Criar `src/shared/components/ui/error-alert.tsx` exportando `ErrorAlert({ children })`, com o markup `role="alert"`, `bg-destructive/10`, `border border-destructive/30`, `rounded-md px-3 py-2 text-sm text-destructive`, ícone `AlertTriangle` (lucide-react) `size-4 shrink-0`, `flex items-center gap-2` — mesmo padrão hoje em `RedefinirSenhaPage.tsx`.

## 2. Aplicar nos dois pontos "crus"

- [x] 2.1 Em `CotacoesPage.tsx`: trocar `<div role="alert" className="text-sm text-destructive font-medium">{erroAcao}</div>` por `<ErrorAlert>{erroAcao}</ErrorAlert>`.
- [x] 2.2 Em `CotacaoDetalhePage.tsx`: trocar o mesmo padrão (`erroAcao`) por `<ErrorAlert>{erroAcao}</ErrorAlert>`.

## 3. Testes

- [x] 3.1 Teste: `ErrorAlert` renderiza `role="alert"` e o texto passado como children.
- [x] 3.2 Atualizar os testes existentes de `CotacoesPage`/`CotacaoDetalhePage` que verificam a mensagem de erro, se buscarem pela classe antiga.
- [x] 3.3 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [x] 4.1 Testar manualmente (dev): provocar um erro de ação na lista de Cotações (ex.: tentar excluir algo que a API rejeite) e no detalhe da Cotação, conferindo visualmente o novo estilo com fundo/borda/ícone. **(verificado visualmente pelo dono do produto em 05/09/2026)**
