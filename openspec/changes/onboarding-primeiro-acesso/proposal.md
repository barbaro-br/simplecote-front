## Why

Depois do cadastro público (`cadastro-publico-self-service`), o dono do supermercado entra num painel **vazio**: sem produtos, sem representantes, sem cotação. Nada indica por onde começar, e o "momento aha" do SimpleCote — ver representantes disputando preço numa grade ao vivo — exige montar três coisas antes. Sem um caminho guiado, muita conta de teste morre no primeiro acesso.

## What Changes

- No primeiro acesso de um `Comprador` sem dados, o painel exibe um **checklist de primeiros passos** (dispensável, reexibível): (1) cadastrar produtos, (2) cadastrar um representante, (3) abrir uma cotação de teste. Cada passo leva à tela existente e se marca sozinho quando cumprido.
- Um **wizard guiado opcional** ("Configurar em 3 passos") encadeia essas telas reusando o que já existe: `ProdutoForm` / importação, `RepresentantesModal` / `representantes.api`, e o `NovaCotacaoWizard`. Quem prefere explorar sozinho fecha o wizard e usa o checklist.
- Opção **"Preencher com dados de exemplo"**: popula o `Comprador` de teste com um catálogo e representantes fictícios (equivalente por-tenant e sob demanda ao `SeedDadosDev`), para o dono ver o produto funcionando antes de digitar os próprios dados. Os dados de exemplo são marcados e podem ser limpos de uma vez.
- O checklist e o wizard somem quando os três passos estão cumpridos (ou quando dispensados).

## Capabilities

### Added Capabilities

- `admin/onboarding`: experiência de primeiro acesso — checklist de primeiros passos, wizard guiado opcional de 3 passos e opção de dados de exemplo, para um `Comprador` recém-criado.

## Impact

- Novo `src/admin/onboarding/`: `OnboardingChecklist.tsx`, `OnboardingWizard.tsx`, `onboarding.api.ts` (estado dos passos + acionar dados de exemplo + limpar), `useOnboarding.ts`.
- `src/admin/analise/DashboardPage.tsx` (ou `AdminLayout`): renderizar o checklist quando `Comprador` sem dados e não dispensado.
- Reuso: `src/admin/produtos/ProdutoForm.tsx`, `src/admin/cotacoes/NovaCotacaoWizard.tsx`, `src/admin/cotacoes/RepresentantesModal.tsx`, `representantes.api.ts`.
- Persistência do "dispensado": preferir estado no back (por `Comprador`) para valer entre dispositivos; `localStorage` como fallback.
- Testes: checklist aparece só com `Comprador` vazio; cada passo marca ao ser cumprido; dispensar e reexibir; wizard encadeia as 3 telas; "dados de exemplo" popula e "limpar exemplos" remove.
- **Contrato com o `simplecote-back`**: endpoint(s) de estado de onboarding por `Comprador` (passos cumpridos, dispensado) e de dados de exemplo (`POST /api/onboarding/dados-exemplo`, `DELETE`). Alternativa: derivar os passos de contadores já existentes (`GET /api/produtos` vazio etc.) e guardar só o "dispensado".
