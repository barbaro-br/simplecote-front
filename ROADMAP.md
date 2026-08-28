# SimpleCote Front — Roadmap de apply

> Linha do tempo de execução das changes OpenSpec até o front ficar demo-ready.
> Fonte da verdade do **o quê**: `spec.md` (§7 fases). Este arquivo é só a **ordem**.
> Última revisão: 2026-08-28.

## Estado das changes

| Change | Situação | Specs no archive |
|---|---|---|
| `setup-inicial-projeto` | código feito, tasks 0/9, **não arquivada** | `core/setup` (já sincronizado) |
| `melhoria-setup-inicial` | código feito, tasks 0/6, **não arquivada** | `core/domain-types`, `core/test-infra` (já sincronizados) |
| `feature-produtos` | ✓ completa, **não arquivada** | `admin/produtos` (3 reqs base, já sincronizados) |
| `feature-empresa-representante-e-edicao` | ✓ completa, **não arquivada** | `admin/empresas`, `admin/produtos` (já sincronizados) |
| `corrigir-build-e-tipos` | ✓ implementada (`tsc -b` → 0), **não arquivada** | `skip_specs` |
| `alinhar-contrato-api` | ✓ implementada (401 + enums), **não arquivada** | `core/setup`, `core/domain-types` (já sincronizados) |
| `limpar-scaffold-shadcn` | ✓ implementada (`./@/` removida), **não arquivada** | `skip_specs` |
| `auth-com-teste` | 0/5 — **a fazer** | `skip_specs` |
| `ligar-front-ao-backend` | 0/12 — **a fazer** | `skip_specs` |
| `admin-cotacoes` | 0/14 — **a fazer** | `admin/cotacoes` (nova capability) |
| `representante-cotacao-token` | 0/14 — **a fazer** | `representante/cotacao` (nova capability) |

## Linha do tempo

```
  ETAPA 0 — higiene (fora do OpenSpec, AGORA)
  ------------------------------------------------------------------
  [ ] commit inicial de verdade do front + push
        hoje só spec.md está versionado; src/, package.json, configs
        e openspec/ estão untracked. Ponto de retorno antes das telas.

  ETAPA 1 — fechar o que já está pronto
  ------------------------------------------------------------------
  [ ] /opsx:archive corrigir-build-e-tipos          (skip_specs)
  [ ] /opsx:archive alinhar-contrato-api            (sync core/setup + core/domain-types)
  [ ] /opsx:archive limpar-scaffold-shadcn          (skip_specs)
  [ ] /opsx:archive feature-produtos                (sync admin/produtos)
  [ ] /opsx:archive feature-empresa-representante-e-edicao
  [ ] /opsx:archive setup-inicial-projeto           (arquiva com aviso de tasks 0/9)
  [ ] /opsx:archive melhoria-setup-inicial          (arquiva com aviso de tasks 0/6)

  ETAPA 2 — infra restante (as duas em paralelo, sem dependência entre si)
  ------------------------------------------------------------------
  [ ] /opsx:apply auth-com-teste           dep: nada. Rápido, fecha a Regra 4.
  [ ] /opsx:apply ligar-front-ao-backend   dep: build verde (ok).
        entrega: .env, roadmap no spec.md §7, verificação e2e
        login -> Produtos -> Empresas contra o backend vivo.
        >>> destrava a ETAPA 3 <<<

  ETAPA 3 — telas (o grosso)
  ------------------------------------------------------------------
  [ ] resolver Open Questions no Swagger do backend rodando:
        - shape de CotacaoResponse / ResultadoDTO / PedidoDTO
        - a grade de respostas vem no GET /api/cotacoes/{id} ou só no /ao-vivo?
        - GET /public/cotacoes/{token} continua acessível após o prazo?
  [ ] /opsx:apply admin-cotacoes           dep: alinhar-contrato-api + ligar-front-ao-backend
  [ ] /opsx:apply representante-cotacao-token   dep: ligar-front-ao-backend
        (independente de admin-cotacoes no código; teste manual precisa
         de uma cotação ABERTA — do painel ou do seed)

  ETAPA 4 — fechamento
  ------------------------------------------------------------------
  [ ] /opsx:archive auth-com-teste                (skip_specs)
  [ ] /opsx:archive ligar-front-ao-backend        (skip_specs)
  [ ] /opsx:archive admin-cotacoes                (sync admin/cotacoes)
  [ ] /opsx:archive representante-cotacao-token   (sync representante/cotacao)
  [ ] commit + push -> front demo-ready
```

## Caminho crítico até "mostrar pro cliente"

```
  commit inicial ──▶ ligar-front-ao-backend ──┬──▶ admin-cotacoes ─────────┐
                                              └──▶ representante-token ─────┴──▶ DEMO
       auth-com-teste roda em paralelo, não bloqueia nada
```

## Gap vs `spec.md` §7

| Fase / item | Estado |
|---|---|
| F1.1 Setup (rotas, `api-client`, tipos base) | ✅ feito |
| F1.2 Produtos CRUD | ✅ criar/listar/inativar · 🟡 editar e lookup GTIN (spec, não código) |
| F1.2 Empresas CRUD (+ representante inline) | ✅ feito |
| F1.2 Representantes — tela dedicada `/admin/representantes` | ❌ pendente (follow-up) |
| F1.3 Cotações: criar, itens, convidar, abrir | ⏳ `admin-cotacoes` |
| F1.4 `/cotacao/:token` (autosave + fila) | ⏳ `representante-cotacao-token` |
| F1.5 Encerrar, apurar, resultado, pedidos, `/pedido/:token` | ⏳ `admin-cotacoes` + `representante-cotacao-token` |
| F2 Grade ao vivo (polling) | ❌ follow-up |
| F3 Análises, importação, scanner, duplicar | ❌ follow-up |
| "Por último" Login + guard + JWT | ✅ feito (adiantado) |
| Infra: build, 401, scaffold, `.env`, CI | ✅ build/401/scaffold · ⏳ `.env` em `ligar-front-ao-backend` · ❌ CI (follow-up) |

## Follow-ups explícitos (fora do MVP demo)

- `/admin/representantes` como tela dedicada (hoje só via cadastro inline de Empresa).
- Grade ao vivo com polling (`GET /api/cotacoes/{id}/ao-vivo`, `spec.md` §10.1 / Fase 2).
- Fase 3: análises (Recharts), importação de catálogo, scanner GTIN (`@zxing/browser`), duplicar cotação.
- CI: workflow com `tsc` + `vitest` + `oxlint` + `build`.
- Corrigir texto defasado de `spec.md` §1/§2 ("sem login até o JWT existir" — o JWT já existe).
- `admin/empresas` › requisito "Listagem do Catálogo de Fornecedores" ainda cita CNPJ/Razão Social (backend não tem).
