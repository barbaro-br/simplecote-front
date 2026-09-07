## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Decidir a fonte do estado dos passos: derivar de contadores existentes (`/api/produtos`, `/api/representantes`, `/api/cotacoes` vazios) OU endpoint dedicado de onboarding
- [ ] 0.2 Persistir "checklist dispensado" por `Comprador`
- [ ] 0.3 `POST /api/onboarding/dados-exemplo` e `DELETE` — popular/limpar catálogo e representantes de exemplo (só para `Comprador` em TESTE)

## 1. Estado de onboarding

- [ ] 1.1 `src/admin/onboarding/onboarding.api.ts` + `useOnboarding.ts`: passos cumpridos (produtos/representante/cotação), flag "dispensado", ações de dados de exemplo
- [ ] 1.2 Fallback de "dispensado" em `localStorage` quando o back ainda não persistir

## 2. Checklist

- [ ] 2.1 `src/admin/onboarding/OnboardingChecklist.tsx`: três itens com link para as telas; item vira "cumprido" pelo estado; botão dispensar
- [ ] 2.2 Render no `DashboardPage.tsx` (ou `AdminLayout`) só quando `Comprador` sem dados e não dispensado; ação "mostrar primeiros passos" quando dispensado
- [ ] 2.3 Some quando os três passos estão cumpridos

## 3. Wizard guiado

- [ ] 3.1 `src/admin/onboarding/OnboardingWizard.tsx`: encadeia produtos → representante → cotação reusando `ProdutoForm`, `RepresentantesModal`/`representantes.api`, `NovaCotacaoWizard`
- [ ] 3.2 Fechar a qualquer momento preserva o progresso; concluir deixa uma cotação aberta

## 4. Dados de exemplo

- [ ] 4.1 Ação "preencher com dados de exemplo" (visível só em modo TESTE) → `POST /api/onboarding/dados-exemplo`
- [ ] 4.2 Ação "limpar dados de exemplo" → `DELETE`; dados de exemplo marcados na UI

## 5. Testes

- [ ] 5.1 Checklist aparece só com `Comprador` vazio; some com tudo cumprido
- [ ] 5.2 Passo se marca ao cumprir a condição (mock do estado)
- [ ] 5.3 Dispensar e reexibir
- [ ] 5.4 Wizard encadeia as três telas; fechar no meio preserva o feito
- [ ] 5.5 "Dados de exemplo" só aparece em TESTE; popular e limpar chamam a API certa

## 6. Checagem de saúde

- [ ] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual: cadastrar conta nova, seguir o checklist e o wizard até uma cotação aberta; testar dados de exemplo e limpeza
