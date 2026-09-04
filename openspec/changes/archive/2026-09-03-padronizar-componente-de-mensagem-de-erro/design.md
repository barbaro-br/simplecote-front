## Context

O padrão mais completo já existe e está em produção em
`RedefinirSenhaPage.tsx`:

```tsx
<div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
  <AlertTriangle className="size-4 shrink-0" />
  {erroServidor}
</div>
```

Só falta extrair isso pra um componente e usá-lo nos dois lugares que hoje
usam a versão sem fundo/borda/ícone.

## Decision

```tsx
// src/shared/components/ui/error-alert.tsx
import { AlertTriangle } from 'lucide-react'

export function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
    >
      <AlertTriangle className="size-4 shrink-0" />
      {children}
    </div>
  )
}
```

Em `CotacoesPage.tsx` e `CotacaoDetalhePage.tsx`, trocar:
```tsx
{erroAcao && (
  <div role="alert" className="text-sm text-destructive font-medium">
    {erroAcao}
  </div>
)}
```
por:
```tsx
{erroAcao && <ErrorAlert>{erroAcao}</ErrorAlert>}
```

## Alternatives Considered

- **Migrar todos os ~16 usos de `role="alert"` nesta mesma change**:
  rejeitado — a maioria já segue visualmente o padrão bom (mesmo sem usar
  o componente compartilhado ainda); forçar essa varredura agora foge do
  escopo do que foi pedido (só os dois casos "crus" que o usuário
  encontrou) e aumenta o risco de regressão em telas que não estavam
  quebradas. Migrações oportunistas dos demais ficam pra depois.
- **Variantes de cor/estilo no `ErrorAlert` (warning, info)**: fora de
  escopo — o pedido foi especificamente sobre erro; se surgir necessidade
  de um padrão de aviso/info, vira uma extensão futura do componente.
