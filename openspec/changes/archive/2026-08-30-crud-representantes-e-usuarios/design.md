## Context

Ver `proposal.md` — Why. Estado do front:

- Fatia de referência (copiar a forma): `src/admin/empresas/` = `EmpresasPage.tsx` (lista + `Dialog` com o form + `useEmpresas({ incluirInativos: true })`, `useInativarEmpresa`, `useAtivarEmpresa`), `EmpresaForm.tsx` (react-hook-form + zod dentro do `Dialog`), `empresas.api.ts` (hooks TanStack Query que invalidam a query da lista no `onSuccess`), `empresas.schema.ts` (zod), `empresas.test.tsx` (MSW). `src/admin/produtos/` segue o mesmo molde.
- `src/shared/api/api-client.ts` já injeta `Authorization`, converte `ProblemDetail` → `ApiError` (com `.problem.detail`), trata 401.
- `src/routes.tsx`: rotas de `/admin/**` são filhas de `<AuthGuard>` → `<AdminLayout>`; `produtos` e `empresas` são `path: 'produtos'` / `path: 'empresas'`.
- `src/admin/layout/AdminLayout.tsx`: nav lateral com `<NavLink to=...>` + ícone `lucide-react`.
- Kit UI hand-rolled: `card`, `button`, `input`, `icon-button`, `dialog`, `skeleton`, `menu-acoes`. Sem tabela pronta — as telas existentes usam lista/`Card`.
- Backend (endpoints e DTOs no `proposal.md`): representante tem só `inativar` (sem `ativar`, sem `GET /{id}`); `PUT` de representante **não aceita `empresaId`**. Usuário tem `inativar` (sem `ativar`), `GET /{id}`, `PUT` (nome/email/papel), `POST /{id}/senha`.

## Goals / Non-Goals

**Goals:**
- Duas telas idênticas em forma às de `empresas`/`produtos` — nada de padrão novo.
- Contrato do backend refletido fielmente no zod (inclui `whatsapp` nulo, `ativo`, papéis).
- Zero dependência, zero mudança de backend, zero toque em workflows/`vercel.json`/`openspec/specs/**`.

**Non-Goals (nível de design):**
- Reativar representante/usuário (não há endpoint). A tela nem mostra a ação.
- Trocar representante de Empresa (o `PUT` não aceita). O form de edição não tem o campo.
- Paginação/busca/ordenação nas listas — as telas de referência também não têm.
- Componente de tabela genérico. Segue o mesmo `Card`/lista das outras.
- Mexer no `EmpresaForm` (criação inline do representante principal continua).

## Decisions

### 1. Nome da Empresa na lista de representantes

`RepresentantesPage` chama `useEmpresas({ incluirInativos: true })` (hook já existente) além de `useRepresentantes()`, e monta um `Map<empresaId, nome>` para exibir o nome ao lado de cada representante. Empresa não encontrada no mapa (edge raro) → exibe "—".

- Alternativa: endpoint que já devolvesse o nome. Rejeitada — não existe e é mudança de backend.
- Alternativa: um request por representante. Rejeitada — a lista de empresas é pequena e já vem em uma chamada.

### 2. Select de Empresa só no cadastro

`RepresentanteForm` recebe uma prop `modo: 'criar' | 'editar'`.
- `criar`: campo `<select>` (ou o padrão de select do kit, se houver; senão `<select>` nativo estilizado como os outros inputs) com as **empresas ativas** de `useEmpresas()`; zod exige `empresaId` UUID.
- `editar`: sem `empresaId` no schema nem no form. Mostra o nome da Empresa atual como texto read-only no topo, com a linha "Para mover de empresa, fale com o suporte." O `mutationFn` do `useAtualizarRepresentante` manda só `{ nome, email, whatsapp }`.

### 3. Trocar senha do usuário — form próprio

Ação separada da edição (item no `menu-acoes` da linha, ou botão). Abre um `Dialog` com `RedefinirSenhaForm`: dois campos `type="password"` (`senha`, `confirmar`). zod: `senha` `min(8)`, e um `refine`/`superRefine` exigindo `senha === confirmar` (erro no campo `confirmar`). `mutationFn` manda só `{ senha }` para `POST /api/usuarios/{id}/senha`. `confirmar` nunca sai do cliente.

- Alternativa: reaproveitar o `UsuarioForm` com um modo "senha". Rejeitada — mistura responsabilidades e polui as validações do form principal.

### 4. `.api.ts` — hooks e invalidação

Espelha `empresas.api.ts`:
- `representantes.api.ts`: `useRepresentantes()`, `useCriarRepresentante()`, `useAtualizarRepresentante()`, `useInativarRepresentante()`. Query key `['representantes']`. Cada mutation invalida `['representantes']` no `onSuccess`.
- `usuarios.api.ts`: `useUsuarios()`, `useCriarUsuario()`, `useAtualizarUsuario()`, `useRedefinirSenhaUsuario()`, `useInativarUsuario()`. Query key `['usuarios']`.
- Erros do backend sobem como `ApiError`; o form pega `err.problem?.detail` e mostra numa área de erro do `Dialog`.

### 5. Schemas zod

- `representantes.schema.ts`: `representanteSchema` (`id` uuid, `empresaId` uuid, `nome` string, `email` string, `whatsapp` `z.string().nullable()`, `ativo` boolean) + `representanteListaSchema = z.array(...)`; `criarRepresentanteFormSchema` (nome/email obrigatórios, email `.email()`, `empresaId` uuid) e `editarRepresentanteFormSchema` (sem `empresaId`).
- `usuarios.schema.ts`: `papelSchema = z.enum(['ADMIN','OPERADOR'])`; `usuarioSchema` (`id`,`nome`,`email`,`papel`,`ativo`); form de criar (com `senha` `min(8)`), form de editar (sem senha), form de senha (`senha` `min(8)` + `confirmar`, `refine` de igualdade).

### 6. Rotas e nav

- `src/routes.tsx`: dentro do bloco de `<AdminLayout>`, `{ path: 'representantes', element: <RepresentantesPage /> }` e `{ path: 'usuarios', element: <UsuariosPage /> }`, na mesma forma de `produtos`/`empresas`.
- `AdminLayout.tsx`: dois `<NavLink>` — "Representantes" (ícone `Users`) perto de "Empresas"; "Usuários" (ícone `UserCog`) ao final do grupo admin. Só markup/nav; nenhuma outra mudança no layout.

## Risks / Trade-offs

- **`useEmpresas` acoplado à tela de representantes** → se a assinatura do hook mudar, a lista quebra. Aceitável: é o mesmo hook que `EmpresasPage` e `EmpresaForm` já usam.
- **Sem reativar** → um representante/usuário inativado por engano só volta por operação de backend. Documentado no spec; fora de escopo (vira change no backend se incomodar).
- **Select nativo de Empresa** se o kit não tiver um Select próprio → visual pode destoar levemente dos outros inputs; estilizar com as mesmas classes/tokens. Não introduzir `@base-ui/react` Select se ainda não estiver em uso no repo sem antes checar (AGENTS.md: não adicionar dependência; mas `@base-ui/react` já é dep — usar o Select dele **se já houver precedente** no código; senão `<select>` estilizado).
- **`git diff` de `routes.tsx`/`AdminLayout.tsx`** precisa ficar mínimo (2 linhas de rota, 2 de NavLink + imports). Se passar disso, é sinal de estar mexendo em coisa fora do escopo.

## Open Questions

- ~~O kit (`src/shared/components/ui/`) tem um componente de Select, ou o repo já usa `@base-ui/react` Select em algum form?~~ **Resolvido na implementação:** o kit não tem componente de Select e nenhum form do repo usa `@base-ui/react` Select — os forms existentes (`EmpresaForm`, `NovaCotacaoPage`) só usam `Input`/`<select>` nativo. Decisão: `<select>` nativo estilizado com a mesma classe utilitária dos inputs (`flex h-9 w-full rounded-md border border-input …`). Sem dependência nova. Comportamento inalterado ("escolher uma Empresa entre as ativas").

## Notas de implementação

- **Schema de form único por módulo, não dois.** As tasks 2.1/3.1 pedem `criar*FormSchema` + `editar*FormSchema` separados. Na prática, passar um resolver zod condicional (`isEdit ? editarSchema : criarSchema`) para um único `useForm<T>()` não compila: o TS vê os dois schemas como tipos diferentes de `Resolver<T>` (um é subconjunto do outro) e recusa a união. A solução — e o padrão que o próprio `EmpresaForm` já usa — é **um** schema de form por módulo (`representanteFormSchema`, `usuarioFormSchema`) com os campos só-criar lenientes (`empresaId: z.string()`, `senha: z.string().optional()`) e a exigência do modo criar feita por `form.setError(...)` no handler de submit. Comportamento externo idêntico ao especificado (criar exige empresa / senha ≥ 8; editar não mostra esses campos). Os testes de schema cobrem `representanteFormSchema`/`usuarioFormSchema` + `redefinirSenhaFormSchema`.
