## 1. Migrar formulários de Usuários para Organização

- [ ] 1.1 Mover `UsuarioForm.tsx` para `src/admin/organizacao/`, adaptando as props para o subconjunto de `Membro` (`{ id, nome, email, papel }`) e mantendo os dois modos (criar/editar) e a validação de senha (8+ caracteres, revelar/ocultar, indicador ao vivo) intactos
- [ ] 1.2 Mover `RedefinirSenhaForm.tsx` para `src/admin/organizacao/`, adaptando a prop de identificação do membro; manter confirmação client-side e indicadores ao vivo intactos
- [ ] 1.3 Mover as mutations de `usuarios.api.ts` (criar, editar, redefinir senha) para dentro de `organizacao.api.ts` (ou um novo arquivo em `src/admin/organizacao/`), preservando as chamadas HTTP (`POST/PUT /api/usuarios`, `POST /api/usuarios/{id}/senha`) e invalidando a query de `useMembros` no `onSuccess`
- [ ] 1.4 Rodar os testes migrados/adaptados de `UsuarioForm` e `RedefinirSenhaForm` (de `UsuariosPage.test.tsx`) contra os componentes na nova localização e verificar que passam

## 2. Modal único de "Adicionar membro"

- [ ] 2.1 Criar um modal com duas opções ("Convidar por e-mail" como padrão, "Criar com senha") que engloba `ConvidarMembroDialog` (existente) e o modo "criar" do `UsuarioForm` migrado
- [ ] 2.2 Verificar que o fluxo de convite por e-mail continua funcionando sem alteração de comportamento (teste existente de `ConvidarMembroDialog` continua passando)
- [ ] 2.3 Verificar (novo teste) que a criação direta com senha, a partir do modal unificado, cria o membro como ativo e ele aparece na lista

## 3. Ações de linha condicionadas por status em MembrosPage

- [ ] 3.1 Adicionar botões de "Editar" e "Redefinir senha" na coluna de Ações de `MembrosPage.tsx`, visíveis apenas para linhas com `status === 'ATIVO'` ou `status === 'INATIVO'`
- [ ] 3.2 Verificar (novo teste) que uma linha com `status === 'CONVITE_PENDENTE'` não exibe os botões de editar nem de redefinir senha
- [ ] 3.3 Verificar (novo teste) que editar um membro ativo muda papel/nome/e-mail e a lista reflete a mudança
- [ ] 3.4 Verificar (novo teste) que redefinir senha de um membro ativo/inativo completa com sucesso

## 4. Remover a tela antiga e redirecionar a rota legada

- [ ] 4.1 Em `src/routes.tsx`, substituir a rota `path: 'usuarios'` por um redirect declarativo para `/admin/membros` (ex.: `<Navigate to="/admin/membros" replace />`), preservando a sessão autenticada
- [ ] 4.2 Remover `src/admin/usuarios/UsuariosPage.tsx`, `UsuariosPage.test.tsx` e qualquer arquivo remanescente da pasta que não tenha sido migrado no grupo 1
- [ ] 4.3 Verificar (novo teste) que acessar `/admin/usuarios` autenticado redireciona para `/admin/membros`

## 5. Navegação

- [ ] 5.1 Remover a entrada `/admin/usuarios` de `ITENS` (`AdminLayout.tsx`) e `ITENS_MAIS` (`BottomNavBar.tsx`)
- [ ] 5.2 Verificar (testes existentes de `AdminLayout.test.tsx` e `BottomNavBar.test.tsx`, adaptados) que a aba "Usuários" não aparece mais no menu, e que "Membros" continua visível só para `OWNER`/`ADMIN`

## 6. Limpeza e não-regressão

- [ ] 6.1 Remover `usuarios.schema.ts`, `usuarios.api.ts`, `usuarios.schema.test.ts`, `usuarios.api.test.tsx` de `src/admin/usuarios/` (o que não migrou nos grupos 1–3); remover a pasta se ficar vazia
- [ ] 6.2 Rodar `npm run build`, `npm test` e `npm run lint` e verificar que passam sem referências quebradas a `src/admin/usuarios/*`
