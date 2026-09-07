## 0. Pré-requisito (repo `simplecote-back`)

- [ ] 0.1 Decidir a fonte do estado dos passos: derivar de contadores existentes (`/api/produtos`, `/api/representantes`, `/api/cotacoes` vazios) OU endpoint dedicado de onboarding
- [ ] 0.2 Persistir "checklist dispensado" por `Comprador`
- [ ] 0.3 `POST /api/onboarding/dados-exemplo` e `DELETE` — popular/limpar catálogo e representantes de exemplo (só para `Comprador` em TESTE)

## 1. Estado de onboarding

- [x] 1.1 `src/admin/onboarding/onboarding.api.ts`: `useOnboarding` (passos cumpridos + `dispensado` + `modoTeste`), `useDispensarOnboarding`, `useSemearDadosExemplo`, `useLimparDadosExemplo` (hooks no `.api.ts`, convenção do repo — não criei `useOnboarding.ts` separado)
- [x] 1.2 ~~Fallback de "dispensado" em `localStorage`~~ **não se aplica**: o back já persiste (`comprador.onboarding_dispensado`). O front usa só o back como fonte — sem `localStorage`.

## 2. Checklist

- [x] 2.1 `src/admin/onboarding/OnboardingChecklist.tsx`: três itens com link para as telas; item vira "cumprido" pelo estado; botão dispensar
- [x] 2.2 Render no `DashboardPage.tsx` só quando `Comprador` sem dados e não dispensado; ação "mostrar primeiros passos" quando dispensado
- [x] 2.3 Some quando os três passos estão cumpridos

## 3. Wizard guiado

- [x] 3.1 `src/admin/onboarding/OnboardingWizard.tsx`: encadeia produtos → representante → cotação reusando `ProdutoForm`, `EmpresaForm` (que usa `representantes.api`) e a rota de nova cotação (`NovaCotacaoWizard`)
- [x] 3.2 Fechar a qualquer momento preserva o progresso; concluir deixa uma cotação aberta (navega para `/admin/cotacoes/nova`)

## 4. Dados de exemplo

- [x] 4.1 Ação "preencher com dados de exemplo" (visível só em `modoTeste` do `GET /api/onboarding`) → `POST /api/onboarding/dados-exemplo`
- [x] 4.2 Ação "limpar dados de exemplo" → `DELETE`. *Marcação por registro na UI não foi feita*: o back não expõe flag "exemplo" nos DTOs de produto/representante (a marca fica na tabela interna `dado_exemplo`) — a limpeza é do back; o front só aciona o `DELETE`.

## 5. Testes

- [x] 5.1 Checklist aparece só com `Comprador` vazio; some com tudo cumprido
- [x] 5.2 Passo se marca ao cumprir a condição (mock do estado)
- [x] 5.3 Dispensar e reexibir
- [x] 5.4 Wizard encadeia as três telas; fechar no meio preserva o feito (os formulários salvam direto no back)
- [x] 5.5 "Dados de exemplo" só aparece em TESTE; popular e limpar chamam a API certa

## 6. Checagem de saúde

- [x] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual: cadastrar conta nova, seguir o checklist e o wizard até uma cotação aberta; testar dados de exemplo e limpeza
