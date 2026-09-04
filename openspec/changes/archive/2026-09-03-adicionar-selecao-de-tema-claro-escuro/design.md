## Context

`ConfiguracaoLojaProvider.tsx` já é o ponto único de bootstrap que aplica
`corPrimaria` como `--primary` via `useEffect`. `ConfiguracoesPage.tsx` já
tem o padrão de radio buttons pro seletor "Estilo de navegação"
(`LATERAL`/`INFERIOR`). O tema escuro (`.dark`) já está totalmente
especificado em CSS (`src/index.css`) — só falta a classe `dark` ser
aplicada em algum elemento ancestral (convenção Tailwind: `.dark` no
`<html>` ou `<body>` liga as variantes `dark:`).

## Decision

**Schema**: em `configuracoes.schema.ts`, adicionar `export type Tema =
'CLARO' | 'ESCURO'` e `tema: z.enum(['CLARO', 'ESCURO'])` ao schema
existente; em `configuracoes.api.ts`, `tema: 'CLARO'` no valor default.

**UI**: em `ConfiguracoesPage.tsx`, replicar o bloco de radio de "Estilo de
navegação" pra "Tema" (`<input type="radio" value="CLARO"
{...form.register('tema')} />` / `"ESCURO"`).

**Aplicação**: em `ConfiguracaoLojaProvider.tsx`, um segundo `useEffect`
(ou o mesmo, ampliado):
```ts
useEffect(() => {
  document.documentElement.classList.toggle('dark', data?.tema === 'ESCURO')
}, [data?.tema])
```

## Alternatives Considered

- **Preferência por usuário, não por Comprador** (cada pessoa escolhe seu
  próprio tema, tipo dark mode de SO): rejeitado — o padrão já
  estabelecido pelo `estiloNavegacao` é configuração por loja (linha
  "SHALL se aplicar em todas as rotas... para todos os usuários dessa
  loja"), e o pedido original também foi nesses termos ("a gente já pode
  alterar a cor base... poderia colocar... no menu"). Preferência
  individual fica como possível evolução, não o pedido atual.
