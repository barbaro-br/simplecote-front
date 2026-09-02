## Why

O domínio já diz que um Representante pertence a **exatamente uma** Empresa (1:1, `empresa_id` único no banco — `simplecote-back/spec.md` §8.5). Mas o front separa isso em duas telas: a criação do representante acontece junto do cadastro da Empresa, porém a **edição** da Empresa não permite editar o representante (só o nome), obrigando o usuário a ir à aba "Representantes" para corrigir nome/e-mail/WhatsApp. A mudança consolida o representante dentro da aba de Empresas, refletindo a relação 1:1 do domínio.

## What Changes

- **EmpresaForm gerencia o representante na criação E na edição**: no modo editar, carrega o representante da empresa, pré-preenche nome/e-mail/WhatsApp e, ao salvar, atualiza a Empresa (`PUT /api/empresas/{id}`) e faz upsert do representante (`PUT /api/representantes/{id}` se existir, `POST /api/representantes` se não).
- **Lista de Empresas exibe o representante** (nome e e-mail) ao lado do nome da empresa.
- **Remove a aba "Representantes"** (rota, item de menu e página), mantendo os hooks da API de representantes (usados pelo modal de convite da cotação e agora pelo `EmpresaForm`).

## Capabilities

### New Capabilities

<!-- Nenhuma capability nova. -->

### Modified Capabilities

- `admin/empresas`: a edição da Empresa passa a incluir os dados do representante (nome, e-mail, WhatsApp) e a lista passa a exibi-los.

### Removed Capabilities

- `admin/representantes`: a tela dedicada de representantes é removida — o representante passa a ser gerido dentro de `admin/empresas`.

## Impact

- **Código front:** `src/admin/empresas/EmpresaForm.tsx` (upsert do representante na edição), `src/admin/empresas/EmpresasPage.tsx` (exibir representante na lista), `src/admin/representantes/*` (remover página/form), `src/routes.tsx` e `src/admin/layout/AdminLayout.tsx` (remover rota e item de menu).
- **Mantido:** `representantes.api.ts` (hooks), pois o modal de convite de cotações usa `useRepresentantes`.
- **Testes:** `EmpresaForm`/`EmpresasPage` (edição com representante), remoção dos testes da página de representantes.
- **Sem mudança no backend** (a relação 1:1 e os endpoints já existem).

## Non-Goals

- Não muda a relação de dados nem os endpoints do backend.
- A ação "inativar representante" (que só existia na aba removida) sai da UI; a desativação do fornecedor segue pela inativação da Empresa.
