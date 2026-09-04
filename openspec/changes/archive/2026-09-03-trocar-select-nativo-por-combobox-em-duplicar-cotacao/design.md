## Context

O projeto não tem `cmdk` nem um Combobox pronto — os controles suspensos
existentes (`MenuAcoes` em `menu-acoes.tsx`) usam `@base-ui/react`
(`Popover`/`Menu`), que já é dependência do projeto. AGENTS.md proíbe
dependência nova sem aprovação explícita, então o Combobox é construído
com o que já existe, sem adicionar biblioteca.

## Decision

`Combobox` é um componente genérico e reutilizável:

```tsx
type ComboboxOption = { value: string; label: string }
function Combobox(props: {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string // ex.: "Nenhuma cotação encontrada"
}): JSX.Element
```

Implementação: `@base-ui/react` `Popover.Root`/`Popover.Trigger`/`Popover.Popup`
(mesmo padrão de `menu-acoes.tsx`) com um `<input>` de busca dentro do
popup controlando um `useState` de texto de filtro; a lista de opções é
filtrada em memória (`options.filter(o => o.label.toLowerCase().includes(filtro.toLowerCase()))`)
— sem chamada de API, já que a lista de cotações já vem carregada no
formulário. Navegação por teclado: seta para baixo/cima move um índice
"realçado" no estado local, Enter seleciona a opção realçada, Escape
fecha sem selecionar.

Em `NovaCotacaoPage.tsx`, o `<select>` vira:
```tsx
<Combobox
  options={cotacoesAnteriores.map(c => ({ value: c.id, label: c.titulo }))}
  value={origemId}
  onChange={setOrigemId}
  placeholder="Selecione uma cotação..."
/>
```
sem mudar `origemId`, `duplicar.mutateAsync(origemId)` nem o `disabled`
do botão "Duplicar".

## Alternatives Considered

- **Instalar `cmdk`/um pacote de combobox pronto**: rejeitado — nova
  dependência sem aprovação explícita (AGENTS.md), e o volume de opções
  (histórico de cotações de um Comprador) não justifica a robustez extra
  de uma lib dedicada.
- **Manter o `<select>` nativo e só restilizar via CSS**: rejeitado — não
  resolve a falta de busca, que é o ganho real pedido; `<select>` nativo
  também não permite estilização completa do popup em todos os
  navegadores.
