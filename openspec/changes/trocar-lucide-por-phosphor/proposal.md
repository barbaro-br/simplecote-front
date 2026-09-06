## Why

Os ícones atuais (`lucide-react`, usado em 36 arquivos) estão achando "sem graça". Packs pagos do GitHub Student Pack (Iconscout, Icons8) têm licença de uso pessoal/educacional — **não cobrem SaaS comercial**. A alternativa grátis e mais expressiva: **Phosphor** (`@phosphor-icons/react`, MIT) — tem pesos `regular`/`bold`/`fill`/`duotone`, o que dá um visual menos genérico mantendo consistência.

## What Changes

- Substituir `lucide-react` por `@phosphor-icons/react` em todo o front.
- Um peso padrão consistente (proposta: `regular`, com `bold`/`fill` pontual para ênfase — ex.: ação primária, estado ativo).
- Mapear cada ícone `lucide` para o equivalente Phosphor (nomes diferem: `Trash2` → `Trash`, `PlusCircle` → `PlusCircle`, `PackageOpen` → `Package`, `ScanLine` → `Barcode`/`Scan`, `SendHorizonal` → `PaperPlaneRight`, etc.).
- `lucide-react` sai do `package.json`.

## Capabilities

### Modified Capabilities

- `shared/design-system`: a biblioteca de ícones da interface passa a ser Phosphor (`@phosphor-icons/react`), com um peso padrão consistente, no lugar de `lucide-react`.

## Impact

- `package.json`: remover `lucide-react`, adicionar `@phosphor-icons/react` (dependência nova — **aprovada pelo usuário para esta change**, `AGENTS.md`).
- 36 arquivos com `import { X } from 'lucide-react'` → `import { Y } from '@phosphor-icons/react'`, com o mapa de nomes. Opcional: um wrapper `src/shared/components/ui/icon.tsx` que fixa o peso padrão e re-exporta, para centralizar (recomendado — futura troca fica num arquivo).
- Ajustar props: lucide usa `size`/`className`; Phosphor usa `size`/`weight`/`color`/`className` — a maioria dos usos com `className="size-4"` do Tailwind continua valendo (Phosphor respeita `width/height` via CSS), mas conferir os que passam `size={16}`.
- `IconButton`, `menu-acoes`, `StatusBadge`, telas de cotação/colaborador/admin — todos os pontos de uso.
- Testes: os que buscam por `aria-label` / `role` continuam; os que buscam um ícone por `data-testid`/nome de classe do lucide precisam de ajuste. `npm run build` pega imports quebrados.
- Sem mudança no back.
