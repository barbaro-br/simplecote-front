## 1. Formulário de Empresa com representante (criação e edição)

- [x] 1.1 Em `EmpresaForm.tsx`, carregar o representante da empresa no modo editar (via `useRepresentantes()` + `empresaId`) e pré-preencher nome/e-mail/WhatsApp. Verificar: `npm run build` verde.
- [x] 1.2 No salvar da edição, além do `PUT /api/empresas/{id}`, fazer upsert do representante (`PUT /api/representantes/{id}` se existir, `POST /api/representantes` se não). Verificar: `npm run build` verde.
- [x] 1.3 Remover os campos mortos `nomeRepresentante?`/`emailRepresentante?`/`whatsappRepresentante?` do tipo `Empresa` em `empresas.schema.ts` (o `GET /api/empresas` não os retorna). Verificar: `npm run build` verde.

## 2. Lista de Empresas mostra o representante

- [x] 2.1 Em `EmpresasPage.tsx`, montar `Map<empresaId, Representante>` e exibir nome/e-mail do representante ao lado do nome da empresa. Verificar: `npm run lint` verde.

## 3. Remover a aba Representantes

- [x] 3.1 Remover a rota `admin/representantes` (`routes.tsx`) e o item de menu (`AdminLayout.tsx`). Verificar: `npm run build` verde.
- [x] 3.2 Remover `RepresentantesPage.tsx`/`RepresentanteForm.tsx` e os hooks órfãos (`useAtualizarRepresentante`, `useInativarRepresentante`), mantendo `useRepresentantes` (usado pelo modal de convite e pelo `EmpresaForm`). Verificar: `npm run build` verde.

## 4. Testes

- [x] 4.1 Atualizar os testes de `EmpresaForm`/`EmpresasPage` para cobrir a edição do representante junto da empresa (e o caso "empresa sem representante"). Verificar: teste verde.
- [x] 4.2 Remover os testes da página de representantes (`RepresentantesPage.test.tsx`). Verificar: `npm test` verde.

## 5. Verificação final

- [x] 5.1 Rodar `npm run build`, `npm test` e `npm run lint` e confirmar os três verdes (regra AGENTS.md §3).
