## 1. API

- [x] 1.1 `useSugestoesCadastro(q)` em `produtos.api.ts`: `useQuery`, chave `['produtos', 'sugestoes', q]`, `enabled` só com 2+ caracteres, `staleTime` curto
- [x] 1.2 Tipos `SugestaoCatalogoGlobal` (`codigoBarras`, `nome`, `marca`) e `SugestoesCadastro` (`doProprioCatalogo: Produto[]`, `doCatalogoGlobal: SugestaoCatalogoGlobal[]`)

## 2. Formulário

- [x] 2.1 Campo "Nome do produto" observa o valor com debounce (`useDebounce`, 300ms) e busca sugestão só quando `!isEdit` e o campo está focado
- [x] 2.2 Painel de sugestão abaixo do campo: grupo "Já no seu catálogo" (texto, não clicável) e grupo "Sugestão da base compartilhada" (clicável)
- [x] 2.3 Escolher uma sugestão do catálogo global preenche nome + código de barras (`shouldDirty`/`shouldValidate`) e mostra aviso "preenchidos da base compartilhada"; fecha o painel
- [x] 2.4 Editar o nome depois de escolher uma sugestão limpa o aviso (mesmo padrão do campo de código de barras)

## 3. Testes

- [x] 3.1 Escolher sugestão do catálogo global preenche nome e código de barras, mostra o aviso
- [x] 3.2 "Já no seu catálogo" aparece só como aviso — não preenche nada sozinho
- [x] 3.3 `npx tsc --noEmit`, `oxlint`, `vitest run` verdes
