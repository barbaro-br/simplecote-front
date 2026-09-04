## Context

`src/index.css` já centraliza os tokens de tema (`--border`,
`--muted-foreground`, etc.) e é onde outras utilities globais do projeto
vivem. Não há nenhuma dependência de scrollbar hoje — a solução é CSS puro,
sem biblioteca nova.

## Decision

Adicionar em `src/index.css`, fora dos blocos `:root`/`.dark` (mas usando
os tokens deles via `var(--...)`, para funcionar nos dois temas
automaticamente):

```css
.scrollbar-fina {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.scrollbar-fina::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.scrollbar-fina::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-fina::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 9999px;
}
.scrollbar-fina::-webkit-scrollbar-thumb:hover {
  background-color: var(--muted-foreground);
}
```

Aplicar `scrollbar-fina` na `<div className="overflow-x-auto overflow-y-auto max-h-[...] ...">`
de `ProdutosPage.tsx` (o contêiner de rolagem da tabela).

## Alternatives Considered

- **Biblioteca de scrollbar customizada (ex.: `simplebar`,
  `react-custom-scrollbars`)**: rejeitado — dependência nova sem
  necessidade (AGENTS.md proíbe sem aprovação explícita); CSS puro já
  cobre os navegadores relevantes (Chrome/Edge/Safari via
  `::-webkit-scrollbar`, Firefox via `scrollbar-width`/`scrollbar-color`).
- **Aplicar globalmente em `*` ou `body`**: rejeitado — mudaria a aparência
  de toda barra de rolagem do sistema (inclusive a da página inteira),
  quando o pedido foi especificamente sobre a tabela de produtos; uma
  classe utilitária aplicada pontualmente é mais seguro e reaproveitável
  onde fizer sentido depois.
