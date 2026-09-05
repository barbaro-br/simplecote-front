## 1. Constante compartilhada

- [x] 1.1 Criar `src/shared/creditos-desenvolvedor.ts` exportando `CREDITO_DESENVOLVEDOR: { texto: string; href: string | null }` com `texto: 'Desenvolvido por Francisco Montalvão'` e `href: null` (placeholder — ajustar antes/depois de rodar, conforme o texto e link definidos).

## 2. Login

- [x] 2.1 Em `LoginPage.tsx`, logo abaixo do `<Link to="/esqueci-senha">`, renderizar `CREDITO_DESENVOLVEDOR.texto` num `<p className="text-center text-xs text-muted-foreground/70 mt-2">` (ou `<a href={CREDITO_DESENVOLVEDOR.href} className="...">` quando `href` não for `null`, com `target="_blank" rel="noopener noreferrer"`).

## 3. Sidebar

- [x] 3.1 Em `AdminLayout.tsx`, logo depois do `<button id="sidebar-logout">`, renderizar `CREDITO_DESENVOLVEDOR.texto` (ou link, mesma lógica condicional do item 2.1) em `text-[11px] text-muted-foreground/60`, aplicando o mesmo padrão de opacity/width controlado por `isExpanded` já usado no `<span>` do rótulo "Sair", para sumir quando a sidebar está recolhida.

## 4. Testes

- [x] 4.1 Teste: `LoginPage` renderiza o texto de `CREDITO_DESENVOLVEDOR`.
- [x] 4.2 Teste: `AdminLayout` renderiza o crédito com a sidebar expandida, e ele fica com `opacity-0`/oculto com a sidebar recolhida (mesma asserção já usada para o rótulo "Sair", se existir).
- [x] 4.3 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 5. Verificação visual

- [x] 5.1 Testar manualmente (dev): abrir a tela de login e conferir o crédito abaixo de "Esqueci minha senha"; no admin, expandir/recolher a sidebar e confirmar que o crédito aparece/some junto com o rótulo "Sair". **(verificado visualmente pelo dono do produto em 05/09/2026)**
