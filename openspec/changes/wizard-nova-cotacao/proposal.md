## Why

Criar uma cotação hoje é: `NovaCotacaoPage` pede só o título → cai na tela de detalhe → adiciona itens → clica "Abrir", e a seleção de empresas está embutida no `AbrirCotacaoDialog`; o botão "Representantes" fica solto no cabeçalho. Pra quem cria pela primeira vez, a ordem não é óbvia e é fácil abrir sem convidar ninguém (o back rejeita, mas depois de tentar).

## What Changes

- Após criar a cotação (título), em vez de cair direto na tela de detalhe, oferecer um **wizard opcional de 3 passos** para cotação nova:
  1. **Itens** — adicionar produtos (reusa `AdicionarItemModal`/`ItensSection`).
  2. **Representantes** — selecionar empresas a convidar (reusa `RepresentantesModal`).
  3. **Prazo & revisar** — escolher o prazo (reusa `AbrirCotacaoDialog`/o picker) e ver um resumo ("4 itens, 3 empresas, expira sábado 18h") antes de "Abrir".
- Cada passo permite voltar; "Abrir" só habilita com ≥1 item e ≥1 empresa.
- **Escape hatch**: um link "montar direto na tela de detalhe" leva ao fluxo atual, sem wizard — quem já conhece não é obrigado a passar pelos passos.
- Nenhuma mudança de API — o wizard orquestra os endpoints/hooks que já existem (`useCriarCotacao`, `useAdicionarItem`, `useConvidarEmpresas`, `useAbrir`).

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: a criação de Cotação ganha um wizard opcional de 3 passos (Itens → Representantes → Prazo & revisar) que guia até "Abrir", com um resumo antes de disparar; a montagem direta pela tela de detalhe continua disponível.

## Impact

- Novo `src/admin/cotacoes/NovaCotacaoWizard.tsx` (ou passos em `NovaCotacaoPage`): stepper com estado local dos 3 passos, reusando `AdicionarItemModal`, `RepresentantesModal` e o picker de prazo.
- `NovaCotacaoPage.tsx`: após `useCriarCotacao`, entrar no wizard (com o `cotacaoId` recém-criado) em vez de `navigate` direto pra detalhe; link "montar direto" que faz o `navigate` atual.
- `routes.tsx`: possivelmente uma rota `/admin/cotacoes/:id/montar` para os passos, ou tudo em `cotacoes/nova` com estado. Decidir na implementação; preferir não fragmentar rota se der.
- Reusa `useConvidarEmpresas`, `useAbrir`, `useAdicionarItem`, `useCotacao`. Sem hook novo, sem dependência nova.
- Testes: `NovaCotacaoPage.test.tsx` / novo `NovaCotacaoWizard.test.tsx` — fluxo dos 3 passos até "Abrir"; "Abrir" desabilitado sem item ou sem empresa; voltar entre passos preserva o que foi feito; link "montar direto" pula o wizard; o resumo do passo 3 reflete itens/empresas/prazo.
- Sem mudança no back.
