## 1. Dependência + wrapper

- [ ] 1.1 `npm rm lucide-react && npm i @phosphor-icons/react` (dependência nova aprovada)
- [ ] 1.2 (Recomendado) `src/shared/components/ui/icon.tsx`: `IconProvider` com `weight="regular"` como padrão global (`<IconContext.Provider>`), montado no `App`/`main`; re-exportar os ícones usados para centralizar a troca futura

## 2. Migração dos 36 arquivos

- [ ] 2.1 Levantar o mapa `lucide → phosphor` para todos os ícones em uso (`Trash2→Trash`, `PackageOpen→Package`, `ScanLine→Barcode`, `SendHorizonal→PaperPlaneRight`, `PlusCircle→PlusCircle`, `Search→MagnifyingGlass`, `X→X`, `Check→Check`, etc.)
- [ ] 2.2 Trocar `import ... from 'lucide-react'` → `@phosphor-icons/react` em todos, aplicando o mapa
- [ ] 2.3 Ajustar props: `size={n}` numérico ok; `className="size-4"` (Tailwind) ok; peso `bold`/`fill` só onde há ênfase (ação primária, estado ativo)
- [ ] 2.4 `grep` final por `lucide-react` — zero ocorrências

## 3. Testes

- [ ] 3.1 Ajustar testes que dependem de nome/classe de ícone do lucide (buscar por `lucide` nos `*.test.*`)
- [ ] 3.2 `npm run build` verde (pega import quebrado)
- [ ] 3.3 `npm test` + `npm run lint` verdes
- [ ] 3.4 Conferência visual rápida das telas principais
