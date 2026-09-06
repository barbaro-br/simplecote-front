## 1. Insight de produto fiel ao contrato real

- [x] 1.1 Em `analise.schema.ts`, reescrever `insightProdutoSchema` espelhando o back: `ultimaCompra` (`empresa`, `representante`, `precoUnitario: z.number()`, `data`, `quantidade`, `cotacaoId`) nullable; `variacaoPct`/`menorPrecoUnitario`/`precoMedioUnitario90d` como `z.number().nullable()`; `compras`/`fornecedoresDistintos` como `z.number()`; `serie` como `z.array(z.object({ data: z.string(), precoUnitario: z.number() }))` — removendo `menorPreco`/`media90d`/`numeroCompras`/`numeroFornecedores`
- [x] 1.2 Em `InsightProdutoCard.tsx`, consumir números direto (remover `parseNum`): `moeda(insight.ultimaCompra.precoUnitario)` etc.; `variacaoPct` numérico; `Sparkline` recebe `insight.serie.map(p => p.precoUnitario)`
- [x] 1.3 Em `UltimaCompraPopover.tsx`, montar o insight derivado no novo formato (números, não `String(...)`), mantendo o guard de "sem compra anterior"
- [x] 1.4 Atualizar testes (`analise.schema.test.ts`, `analise.api.test.tsx`, `useInsightProdutos.test.tsx`, `InsightProdutoCard.test.tsx`, `Sparkline.test.tsx`) para o formato novo, incluindo cenário "resposta real com dinheiro número e série de pontos valida" (msm shape do back)
- [x] 1.5 Rodar `npx vitest run src/admin/analise` — verde

## 2. Configurações ligada à API real

- [x] 2.1 Em `configuracoes.api.ts`, remover mock (`CONFIGURACAO_SEED`, `valorEmMemoria`, `aguardar`, `definirConfiguracaoMock`, `resetarMock`, `definirFalhaAoSalvar`) e implementar `useConfiguracaoLoja` (`GET /api/configuracoes`) e `useAtualizarConfiguracao` (`PUT /api/configuracoes`, invalida/seta a query no sucesso)
- [x] 2.2 Em `configuracoes.schema.ts`, remover `destacarMenorPrecoNaGrade` do schema de submit e do tipo `Configuracao` (o `linkColaboradorToken` continua somente leitura)
- [x] 2.3 Em `ConfiguracoesPage.tsx`, remover o toggle "Destacar menor preço na grade ao vivo" do form
- [x] 2.4 Em `GradeAoVivoTabela.tsx`, deixar de ler `configuracao?.destacarMenorPrecoNaGrade` — destaque sempre ligado (`const destacarMenorPreco = true` com comentário apontando a decisão/spec)
- [x] 2.5 Trocar os testes que usavam os helpers de mock por handlers MSW de `GET/PUT /api/configuracoes`: `ConfiguracoesPage.test.tsx`, `GradeAoVivoTabela.test.tsx` (teste da "preferência desligada" vira teste do default ligado), e conferir `AdminLayout`/`LoginPage` se dependiam dos helpers
- [x] 2.6 Realinhar `ConfiguracoesPage.test.tsx` à UI atual: ativar abas antes de assertar radios; erro de salvamento via toast (não `role=alert`); link do colaborador vindo do MSW com token real; botão "Salvar configurações"

## 3. Shell responsivo (drawer + hamburger < 768px)

- [x] 3.1 Em `AdminLayout.tsx`, implementar modo móvel: abaixo de 768px, topbar fixa com hamburger + drawer lateral (`fixed`, overlay, `z-50`) com os mesmos itens da sidebar; fecha ao navegar/X/fora; acima de 768px comportamento atual preservado
- [x] 3.2 Garantir que o `main` não transborda horizontalmente em 375px (checar páginas densas — Cotações, Produtos, grade — e fechar gaps de `min-w`/overflow em tabelas se existirem)
- [x] 3.3 Adicionar/atualizar testes do layout: abaixo de 768px hamburger abre drawer e navegação fecha; acima de 768px sem regressão (se existir teste de AdminLayout, cobrir os dois modos)

## 4. Grade ao vivo — contêiner canônico

- [x] 4.1 Em `GradeAoVivoTabela.tsx`, voltar o contêiner para `overflow-x-auto overflow-y-auto max-h-[65vh]` (remover `overflow-auto max-h-[70vh] relative`)
- [x] 4.2 Realinhar `GradeAoVivoTabela.test.tsx` ao 65vh e eixo separado

## 5. Correções menores

- [x] 5.1 Em `produtos.schema.ts`, mensagens pt-BR para `number`/`int` de `quantidadePorEmbalagem` (ex.: "Informe a quantidade por embalagem" / "A quantidade deve ser um número inteiro") — cenário coberto em teste do schema
- [x] 5.2 Confirmar (sem regressão) as mensagens exclusivas de "trocar senha" (`RedefinirSenhaForm`) e o comportamento "editar produto sem fechar modal" — rodar `UsuariosPage.test.tsx` e `AdicionarItemModal.test.tsx`

## 6. Checagem de saúde

- [x] 6.1 Rodar `npx vitest run` completo — verde (sem regressões nos 381+ testes)
- [x] 6.2 Rodar `npx oxlint` e `npx tsc -b` — sem erros novos
- [x] 6.3 Rodar `VITE_API_BASE_URL=http://localhost:8080 npm run build` — sucesso
