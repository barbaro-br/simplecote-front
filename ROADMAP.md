# SimpleCote Front — Roadmap

> Estado atual do front-end e próximos passos.
> Fonte da verdade do **o quê**: `spec.md` (§7 fases). Este arquivo é a **ordem e o estado**.
> Última revisão: 2026-09-01.

## Estado das changes OpenSpec

### Ativas

| Change | Tasks | Status | Descrição |
|---|---|---|---|
| `preparar-deploy-2026-08-31` | 0/15 | in-progress | Housekeeping: commits já feitos, falta arquivar e push |
| `saas-multi-tenant-transformation` | 0/12 | in-progress | Transformação SaaS multi-tenant (~8 tasks backend) |

### Arquivadas (2026-09-01)

| Change | Specs sincronizadas |
|---|---|
| `convidar-apos-abertura` | — |
| `reenviar-convites-falhos` | `--skip-specs` (cenários já na spec principal) |
| `redesign-abrir-cotacao-modal` | `--skip-specs` (cenários já na spec principal) |
| `enhance-modal-product-info` | `--skip-specs` |
| `bulk-add-items-modal` | `cotacoes/bulk-add-items-modal` (criada) |
| `redesign-adicionar-itens-modal` | `cotacoes/redesign-adicionar-itens-modal` (criada) |

### Arquivadas anteriormente

| Change | Specs sincronizadas |
|---|---|
| `setup-inicial-projeto` | `core/setup` |
| `melhoria-setup-inicial` | `core/domain-types`, `core/test-infra` |
| `feature-produtos` | `admin/produtos` |
| `feature-empresa-representante-e-edicao` | `admin/empresas`, `admin/produtos` |
| `corrigir-build-e-tipos` | `skip_specs` |
| `alinhar-contrato-api` | `core/setup`, `core/domain-types` |
| `limpar-scaffold-shadcn` | `skip_specs` |
| `auth-com-teste` | `skip_specs` |
| `ligar-front-ao-backend` | `skip_specs` |
| `admin-cotacoes` | `admin/cotacoes` |
| `representante-cotacao-token` | `representante/cotacao` |
| `fix-admin-layout-test` | — |
| `alterar-favicon` | — |
| `melhorias-modal-representantes` | — |
| `investigar-erro-email` | — |
| `reactive-live-grid` | `admin/cotacoes-live-stream` |

---

## Gap vs `spec.md` §7

| Fase / item | Estado |
|---|---|
| F1.1 Setup (rotas, `api-client`, tipos base) | ✅ feito |
| F1.2 Produtos CRUD (criar/editar/inativar/lookup GTIN) | ✅ feito |
| F1.2 Empresas CRUD (+ representante inline) | ✅ feito |
| F1.2 Representantes — tela dedicada `/admin/representantes` | ✅ feito |
| F1.3 Cotações: criar, itens, convidar empresas, abrir | ✅ feito |
| F1.3 Encerrar/Reabrir/Cancelar cotação | ✅ feito |
| F1.3 Convidar após abertura + reenviar convite + link mágico | ✅ feito |
| F1.4 `/cotacao/:token` (autosave + fila de sincronização) | ✅ feito |
| F1.4 Tutorial onboarding do representante | ✅ feito |
| F1.5 Apurar, resultado, pedidos | ✅ feito |
| F1.5 `/pedido/:token` (visualizar + confirmar) | ✅ feito |
| F2 Grade ao vivo | ✅ feito (**SSE**, evoluiu do polling previsto na spec) |
| F3 Análises/Dashboard (Sparklines, insights por produto/empresa) | ✅ feito |
| F3 Importação de catálogo (upload) | ❌ follow-up |
| F3 Scanner GTIN (`@zxing/browser`) | ❌ follow-up |
| F3 Duplicar cotação | ✅ feito |
| "Por último" Login + guard + JWT + 401 | ✅ feito |
| Infra: build, `.env`, proxy heroku | ✅ feito |
| Infra: CI (GitHub Actions) | ❌ follow-up |
| Usuários CRUD + troca de senha | ✅ feito |

---

## Saúde do projeto (2026-09-01)

| Métrica | Resultado |
|---|---|
| `tsc -b` | ✅ 0 erros |
| `vite build` | ✅ (requer `VITE_API_BASE_URL` em produção) |
| `vitest run` | ✅ 44 arquivos, 207 testes, 0 falhas |
| Working tree | 🟢 Limpo |

---

## Próximos passos

### Curto prazo — housekeeping

1. Fechar a change `preparar-deploy-2026-08-31` (commits já feitos, falta push + archive).
2. Atualizar `spec.md` §Estado atual — texto defasado (ex.: "sem login" quando o JWT já existe; cotações/representante listados como pendentes).

### Médio prazo — proteção

3. CI pipeline: GitHub Actions com `tsc -b` + `vitest` + `oxlint` + `vite build`.

### Estratégico — evolução

4. **SaaS multi-tenant** (`saas-multi-tenant-transformation`): change planejada com 12 tasks. Maioria é backend (tabela tenant, Hibernate @Filter, JWT com `tenantId`, ROLE_MASTER_ADMIN, seed demo). No front: AuthContext com `tenantId`, novas telas `/saas/admin/clientes`, ajuste de mocks.

### Follow-ups explícitos (fora do escopo atual)

- Importação de catálogo (upload de arquivo).
- Scanner GTIN (`@zxing/browser`).
- Testes e2e (Playwright/Cypress) — depende de CI existir.
- PWA / Service Worker.
- Tema customizável por tenant (cor da marca do Comprador).
