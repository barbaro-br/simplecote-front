## Context

`LoginPage.tsx` já tem um `<Link to="/esqueci-senha">` como último elemento
dentro do `<Card>`. `AdminLayout.tsx` já tem um botão "Sair" no fim da
`<aside>`, com um padrão estabelecido de esconder o rótulo em texto quando
a sidebar está recolhida (`isExpanded` controla `opacity`/`translate-x`/
`width` do `<span>` do rótulo).

## Decision

Centralizar o texto/link numa constante única, fácil de editar depois:

```ts
// src/shared/creditos-desenvolvedor.ts
export const CREDITO_DESENVOLVEDOR = {
  texto: 'Desenvolvido por Francisco Montalvão',
  href: null as string | null, // ex.: 'mailto:...', 'https://wa.me/...' — null = texto estático, sem link
}
```

**Login**: logo abaixo do `<Link to="/esqueci-senha">`, um
`<p className="text-center text-xs text-muted-foreground/70 mt-2">` (ou
`<a>` se `href` não for `null`) com `CREDITO_DESENVOLVEDOR.texto`.

**Sidebar**: logo depois do `<button id="sidebar-logout">`, um elemento
seguindo o mesmo padrão de `isExpanded` já usado pro rótulo "Sair" —
`text-[11px] text-muted-foreground/60`, escondido (via a mesma técnica de
opacity/width) quando a sidebar está recolhida no modo ícone.

## Alternatives Considered

- **Só na tela de login**: rejeitado — a sidebar é vista o dia inteiro
  pelo admin logado; incluir os dois lugares dá mais visibilidade sem
  poluir nenhum dos dois (ambos de baixo tráfego de atenção).
- **Rodapé das telas públicas do representante** (mencionado como opção
  na conversa, por causa do potencial de geração de lead): fora de
  escopo desta change — fica registrado no backlog
  (`docs/backlog-ux-2026-09-03.md`) como possível expansão futura, já que
  depende de decisão de marketing, não só de UI.
