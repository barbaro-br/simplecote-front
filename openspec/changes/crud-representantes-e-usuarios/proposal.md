## Why

O painel do admin tem CRUD para produtos, empresas e cotações, mas **não tem tela para representantes nem para usuários**. Hoje um representante só nasce embutido no cadastro de empresa (o "representante principal" no `EmpresaForm`), sem forma de listar, editar ou inativar depois; e não há nenhuma forma de gerir os usuários (admin/operador) do painel pela UI. O backend já expõe todos os endpoints (`/api/representantes/**`, `/api/usuarios/**`) — falta só o front consumir, seguindo a fatia de referência que `produtos` e `empresas` já estabeleceram.

## What Changes

- **Nova tela `/admin/representantes`** (`src/admin/representantes/`): lista (com inativos), criar (nome, e-mail, whatsapp opcional, **select de Empresa** obrigatório), editar (nome, e-mail, whatsapp — sem trocar de empresa, que o backend não suporta), inativar. Segue `src/admin/empresas/`: `RepresentantesPage.tsx` + `RepresentanteForm.tsx` (dentro de `Dialog`) + `representantes.api.ts` (hooks TanStack Query) + `representantes.schema.ts` (zod) + `representantes.test.tsx` (MSW).
- **Nova tela `/admin/usuarios`** (`src/admin/usuarios/`): lista (com inativos), criar (nome, e-mail, papel ADMIN/OPERADOR, senha ≥ 8), editar (nome, e-mail, papel), **trocar senha** (ação separada, campo senha + confirmar-senha), inativar. Mesma estrutura de arquivos.
- **Fiação**: duas rotas novas em `src/routes.tsx` sob `/admin` (dentro do `AdminLayout`, atrás do `AuthGuard`), e dois `NavLink` novos em `src/admin/layout/AdminLayout.tsx` (ícones `lucide-react`).
- **Sem dependência nova**, **sem mudança no backend**, sem tocar em `.github/workflows/**`, `vercel.json` ou `openspec/specs/**`. A criação inline de representante no `EmpresaForm` **continua como está** — a tela nova é adicional.

## Capabilities

### New Capabilities
- `admin/representantes`: tela de gestão de representantes no painel do admin — listar (incluindo inativos, com o nome da Empresa de cada um), criar vinculando a uma Empresa, editar dados de contato, inativar. Cobre o comportamento observável: o que a lista mostra, os campos e validações dos formulários, os estados carregando/vazio/erro, e a ausência de troca de Empresa na edição.
- `admin/usuarios`: tela de gestão dos usuários do painel (papéis ADMIN e OPERADOR) — listar (incluindo inativos), criar com senha inicial, editar nome/e-mail/papel, trocar a senha, inativar. Cobre os campos, validações (senha ≥ 8, confirmação de senha), papéis, e os estados da tela.

### Modified Capabilities
_Nenhuma._ As telas `admin/produtos`, `admin/empresas` e `admin/cotacoes` não mudam de comportamento; ganham no máximo dois itens de navegação vizinhos.

## Impact

- **Código (front)**: novos diretórios `src/admin/representantes/` e `src/admin/usuarios/` (Page + Form + api + schema + testes). Alterados: `src/routes.tsx` (2 rotas), `src/admin/layout/AdminLayout.tsx` (2 NavLink).
- **API**: só consumo — `GET/POST /api/representantes`, `PUT /api/representantes/{id}`, `POST /api/representantes/{id}/inativar`; `GET/POST /api/usuarios`, `GET/PUT /api/usuarios/{id}`, `POST /api/usuarios/{id}/senha`, `POST /api/usuarios/{id}/inativar`. Nenhum contrato novo.
- **Dependências**: nenhuma.
- **Testes**: MSW por tela (schema, api, Page, Form) + regressão de `EmpresasPage`, `ProdutosPage`, `AdminLayout`.
- **Fora de escopo**: reativar representante/usuário (não há endpoint), trocar representante de empresa (backend não suporta), tela `/admin/analise` com gráficos, scanner GTIN, import de catálogo, qualquer mudança de backend.
