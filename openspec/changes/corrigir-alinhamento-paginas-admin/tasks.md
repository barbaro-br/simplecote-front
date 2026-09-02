## 1. Componente compartilhado

- [x] 1.1 Criar `src/shared/components/layout/PageContainer.tsx` com prop `maxWidth: 'lg' | '4xl' | '5xl'` e `className` repassado; verificar com um teste unitário que renderiza `mx-auto w-full max-w-{N}` corretamente para cada valor de `maxWidth`.

## 2. Migrar as páginas (maxWidth `5xl`)

- [x] 2.1 `AnalisesPage.tsx`: trocar `<div className="space-y-5 max-w-5xl">` por `<PageContainer maxWidth="5xl" className="space-y-5">`; verificar que os testes existentes da página continuam passando.
- [x] 2.2 `DashboardPage.tsx`: mesma troca (`space-y-5`); verificar testes.
- [x] 2.3 `CotacoesPage.tsx`: mesma troca (`space-y-5`); verificar testes.
- [x] 2.4 `ResultadoPage.tsx`: trocar preservando `space-y-8`; verificar testes.
- [x] 2.5 `EmpresasPage.tsx`: trocar preservando `space-y-6`; verificar testes.
- [x] 2.6 `ProdutosPage.tsx`: trocar preservando `space-y-6`; verificar testes.
- [x] 2.7 `UsuariosPage.tsx`: trocar preservando `space-y-6`; verificar testes.

## 3. Migrar as páginas com largura diferente

- [x] 3.1 `CotacaoDetalhePage.tsx`: trocar `<div className="space-y-6 max-w-4xl">` por `<PageContainer maxWidth="4xl" className="space-y-6">`; verificar testes.
- [x] 3.2 `NovaCotacaoPage.tsx`: trocar `<div className="space-y-6 max-w-lg">` por `<PageContainer maxWidth="lg" className="space-y-6">`; verificar testes.

## 4. Verificação final

- [x] 4.1 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.
- [x] 4.2 Conferir visualmente (dev server, viewport largo) que as 9 rotas ficam centralizadas com espaço simétrico à esquerda/direita, sem vão desproporcional — conforme o cenário "Painel em viewport ultrawide" já especificado em `admin/layout`.
