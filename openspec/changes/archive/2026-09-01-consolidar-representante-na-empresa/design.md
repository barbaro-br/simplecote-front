## Context

A relação Empresa↔Representante é 1:1 (`empresa_id` único — back §8.5). Hoje o front tem duas telas: `EmpresasPage` (cria empresa + representante, mas a edição só mexe no nome) e `RepresentantesPage` (CRUD separado). Motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Representante gerido inteiramente dentro da aba Empresas (criação e edição).
- Lista de Empresas mostra o representante.

**Non-Goals:**
- Não mudar endpoints nem o modelo do backend.
- Não reimplementar "inativar representante" (sai da UI).

## Decisions

### D1 — `EmpresaForm` faz upsert do representante na edição
No modo editar, o form carrega o representante da empresa (via `useRepresentantes()` + `find(r => r.empresaId === empresa.id)`), pré-preenche nome/e-mail/WhatsApp e, ao salvar:
1. `PUT /api/empresas/{id}` (nome);
2. se já há representante → `PUT /api/representantes/{id}` (nome, e-mail, whatsapp); senão → `POST /api/representantes` (empresaId + contato).

A criação continua como hoje (`POST /api/empresas` → `POST /api/representantes`).

### D2 — Representante lido do `useRepresentantes()`
Não há busca "empresa → representante" específica no back; como a lista é pequena, o form/lisst usam `useRepresentantes()` (que já traz todos, inclusive inativos) e casam por `empresaId`. Remove os campos mortos `nomeRepresentante?`/`emailRepresentante?`/`whatsappRepresentante?` do tipo `Empresa` (o `GET /api/empresas` nunca os retorna).

### D3 — Lista de Empresas mostra o representante
`EmpresasPage` monta um `Map<empresaId, Representante>` e exibe nome/e-mail ao lado do nome da empresa.

### D4 — Remover a aba Representantes
Remover `RepresentantesPage`/`RepresentanteForm`, a rota `admin/representantes` e o item de menu. Manter `representantes.api.ts` (o `RepresentantesModal` da cotação usa `useRepresentantes`). Os hooks que ficam órfãos (`useAtualizarRepresentante`, `useInativarRepresentante`) são removidos se não usados.

## Risks / Trade-offs

- **[R1] Perder a ação "inativar representante"** → aceito e registrado (a inativação da Empresa cobre a retirada do fornecedor). Se fizer falta, re-adicionar como ação dentro do formulário de Empresa numa change futura.
- **[R2] `useRepresentantes()` traz inativos e o modal de convite depende de só ativos** → não é tocado; o modal continua usando `useEmpresas()` (ativas) e `useRepresentantes()` como já faz.

## Migration Plan

- Sem migração de dados/API. Rollback: reverter o working tree.
