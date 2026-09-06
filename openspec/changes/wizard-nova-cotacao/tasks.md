## 1. Estrutura do wizard

- [ ] 1.1 `NovaCotacaoWizard` (componente): stepper de 3 passos com estado local (`itens`, `empresasSelecionadas`, `prazoIso`), recebe o `cotacaoId` criado
- [ ] 1.2 Passo 1 — Itens: reusa `AdicionarItemModal`/`ItensSection` sobre a cotação recém-criada (`RASCUNHO`)
- [ ] 1.3 Passo 2 — Representantes: reusa `RepresentantesModal` para selecionar empresas (sem convidar ainda — a seleção fica no estado)
- [ ] 1.4 Passo 3 — Prazo & revisar: picker de prazo + resumo ("N itens · M empresas · expira <prazo formatado>")
- [ ] 1.5 Navegação: voltar/avançar preservam o estado; "Abrir" só habilita com ≥1 item e ≥1 empresa

## 2. Integração

- [ ] 2.1 `NovaCotacaoPage.tsx`: após `useCriarCotacao`, entrar no wizard com o `cotacaoId`; link "Montar direto na tela de detalhe" que faz o `navigate('/admin/cotacoes/' + id)` atual
- [ ] 2.2 "Abrir" no passo 3: `useConvidarEmpresas(id).mutateAsync(empresasSelecionadas)` → `useAbrir(id).mutateAsync({ prazo })` → `navigate` para a tela de detalhe
- [ ] 2.3 Erros (`ApiError.message`) em cada passo; nada de catch vazio (`AGENTS.md §3`)

## 3. Testes

- [ ] 3.1 Fluxo completo dos 3 passos até "Abrir" cria itens, convida e abre
- [ ] 3.2 "Abrir" desabilitado sem item ou sem empresa
- [ ] 3.3 Voltar entre passos preserva itens/empresas/prazo
- [ ] 3.4 Link "montar direto" navega para a tela de detalhe sem passar pelo wizard
- [ ] 3.5 `npm test` + `npm run build` + `npm run lint` verdes
