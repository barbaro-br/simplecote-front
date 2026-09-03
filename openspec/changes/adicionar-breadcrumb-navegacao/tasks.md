## 1. Componente

- [ ] 1.1 Criar `src/shared/components/ui/breadcrumb.tsx`: componente `Breadcrumb`, recebendo `items: { label: string; to?: string }[]`; renderiza cada item separado por um separador visual (ex.: `/` ou ícone chevron), itens com `to` como `Link` (`react-router-dom`) com estilo `text-muted-foreground hover:text-foreground hover:underline`, o último item (ou qualquer item sem `to`) como texto simples (`text-foreground font-medium`, não clicável).

## 2. Aplicar nas telas

- [ ] 2.1 Em `src/admin/cotacoes/ResultadoPage.tsx`: remover o `Link` "← Detalhe" da linha com "Baixar XLSX"; adicionar `<Breadcrumb items={[{label: 'Cotações', to: '/admin'}, {label: cotacao.titulo, to: \`/admin/cotacoes/${id}\`}, {label: 'Resultado'}]} />` numa linha própria acima do `<h1>`.
- [ ] 2.2 Em `src/admin/cotacoes/CotacaoDetalhePage.tsx`: remover o `Link` "← Cotações"; adicionar `<Breadcrumb items={[{label: 'Cotações', to: '/admin'}, {label: cotacao.titulo}]} />` numa linha própria acima do `<h1>` (mesma posição onde o link estava).

## 3. Testes

- [ ] 3.1 Teste do `Breadcrumb`: itens com `to` renderizam como link navegável; o item sem `to` (ou o último) renderiza como texto, não como link.
- [ ] 3.2 Teste (ou ajuste dos testes existentes) de `ResultadoPage` e `CotacaoDetalhePage`: a trilha aparece com os textos esperados, e o link "Cotações" aponta para `/admin`.
- [ ] 3.3 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [ ] 4.1 Conferir em viewport estreito (~375-500px) que o breadcrumb não quebra nem colide com os botões de ação em nenhuma das duas telas.
