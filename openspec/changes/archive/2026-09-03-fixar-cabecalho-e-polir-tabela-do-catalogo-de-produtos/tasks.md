## 1. Cabeçalho da página fixo

- [x] 1.1 Em `ProdutosPage.tsx`: envolver o bloco `<div className="flex items-start justify-between">` (título/subtítulo/botão "Novo produto") com `sticky top-0 bg-background z-10 border-b` (mesmo padrão de `CotacaoDetalhePage.tsx`), ajustando padding para ficar visualmente consistente com o resto da página.

## 2. Tabela com cabeçalho de colunas fixo

- [x] 2.1 Dar ao `<div className="overflow-x-auto">` que envolve a `<table>` uma altura máxima com scroll vertical próprio (`max-h-[...] overflow-y-auto`, ajustar o valor testando visualmente).
- [x] 2.2 Tornar o `<thead className="bg-muted/50 border-b">` `sticky top-0` dentro desse contêiner, mantendo o fundo opaco (`bg-muted/50`) para as linhas não aparecerem por baixo ao rolar.

## 3. Coluna Qtd. e separação visual

- [x] 3.1 Trocar o texto do `<th>` de "Qtd./embalagem" para "Qtd." (cabeçalho) — manter a célula de dados (`{produto.quantidadePorEmbalagem}`) como está.
- [x] 3.2 Adicionar separação visual (borda vertical sutil ou padding extra) entre a coluna "Qtd." e a coluna "Ações", para os dois grupos não ficarem colados.

## 4. Ícones de Ações

- [x] 4.1 Em `icon-button.tsx`: adicionar prop opcional `tone?: 'default' | 'destructive'` (default `'default'`) ao tipo `Props`; quando `tone === 'destructive'`, usar classes de hover mais quentes (ex.: `hover:bg-destructive/10 hover:text-destructive`) em vez das classes neutras atuais (`hover:bg-muted hover:text-foreground`). Sem `tone` passado, o comportamento e o visual permanecem idênticos ao atual — conferir que nenhum outro uso existente de `IconButton` (`CotacoesPage`, `CotacaoDetalhePage`, `RepresentantesModal`/`MenuAcoes`, etc.) muda de aparência.
- [x] 4.2 Em `ProdutosPage.tsx`: trocar o import `EyeOff`/`Eye` por `Archive`/`ArchiveRestore` (lucide-react); usar `Archive` no `IconButton` de "Inativar" (com `tone="destructive"`) e `ArchiveRestore` no de "Ativar" (`tone` padrão).

## 5. Testes

- [x] 5.1 Teste: `IconButton` sem `tone` renderiza as mesmas classes de antes (sem regressão visual nos demais usos).
- [x] 5.2 Teste: `IconButton` com `tone="destructive"` inclui as classes de hover destrutivas.
- [x] 5.3 Atualizar `ProdutosPage.test.tsx` (se cobrir os ícones antigos `EyeOff`/`Eye`) para os novos `Archive`/`ArchiveRestore`.
- [x] 5.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 6. Verificação visual

- [x] 6.1 Testar manualmente (dev, com um catálogo grande — reaproveitar os 200 produtos de teste já semeados no banco de dev) rolando a lista: confirmar que o cabeçalho da página e o cabeçalho de colunas da tabela permanecem visíveis, sem sobreposição entre os dois nem com as linhas de dados.
- [x] 6.2 Confirmar visualmente a separação entre "Qtd." e "Ações", e os novos ícones de Archive/ArchiveRestore com o tom de alerta sutil no hover do "Inativar".
