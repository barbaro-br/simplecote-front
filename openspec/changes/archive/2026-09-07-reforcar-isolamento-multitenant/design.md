## Context

Ver `proposal.md` — Why. O isolamento por `comprador_id` já existe e é dirigido pelo JWT (`JwtCompradorIdResolver` no back). O risco é regressão silenciosa: uma consulta futura sem filtro, ou um payload que passe a aceitar `compradorId` do cliente. O front não tem como "consertar" o back, mas pode garantir que nunca é a origem do vazamento e documentar o contrato.

## Goals / Non-Goals

**Goals**
- Provar, por teste, que o front nunca transporta a identidade do inquilino.
- Deixar a regra explícita onde os agentes de código leem antes de codar (`AGENTS.md`, `spec.md` §4).

**Non-Goals**
- Implementar `@Filter`/RLS no `simplecote-back` (é lá, não aqui).
- Testar isolamento cruzado ponta a ponta (precisa de 2 compradores reais e do cadastro público — vem depois, na change `cadastro-publico-self-service`).

## Decisions

- **Schema compartilhado + `comprador_id`, NÃO banco (ou schema) por tenant.** A coluna já existe em todas as tabelas e o `JwtCompradorIdResolver` já filtra por ela — cadastro novo é um `INSERT`, não um provisionamento. Banco por tenant no Heroku seria um add-on por cliente (custo, limite de conexões), migrations rodando N vezes, e cadastro self-service lento. Analytics do backoffice ("quantas lojas, quem está inadimplente") é trivial no schema compartilhado. Só se move um cliente para banco dedicado se um contrato enterprise exigir isolamento físico — modelo híbrido, sem mexer no resto.
- **Barreira no back: Postgres RLS como camada final, além do `@Filter`.** RLS cria a fronteira no banco, independente de a aplicação lembrar do filtro — é o que torna o schema compartilhado seguro o suficiente para concorrentes dividirem as tabelas. O `@Filter` do Hibernate cobre o caminho ORM e é mais barato de introduzir; os dois juntos dão defesa em profundidade. O interceptor do Spring faz `SET LOCAL app.tenant_id` por transação a partir do `CompradorIdResolver`. *(Decisão registrada aqui para o repo do back; não é implementada nesta change.)*
- **Teste-guarda por interceptação de rede, não por leitura estática.** Um lint/grep de `compradorId` daria falso-negativo fácil (spread de objeto, nome via variável). Interceptar a requisição real no MSW e inspecionar o corpo serializado é o que de fato prova o contrato. Alternativa considerada: regra de lint custom — rejeitada por frágil.
- **Cobertura representativa, não exaustiva.** O teste cobre uma mutação de cada feature (produtos, empresas, cotações, configurações, usuários, representantes). Cobrir 100% das chamadas seria manutenção alta com ganho marginal — o objetivo é pegar o padrão errado, não cada instância.

## Risks / Trade-offs

- **Teste representativo pode não cobrir uma chamada nova que introduza o vazamento** → a regra no `AGENTS.md` e a revisão de PR são a segunda linha; o teste é rede de segurança, não garantia formal.
- **RLS mal configurado no back pode bloquear queries legítimas de rotas por token** (que resolvem o inquilino pelo token, não pelo JWT) → o interceptor precisa setar `app.tenant_id` também no caminho `/public/**`, a partir do token. Rastreado como parte do pré-requisito.

## Migration Plan

1. Back: introduzir `@Filter`/RLS atrás de uma flag, rodar a suíte de isolamento cruzado, ligar em produção.
2. Front: auditoria + teste-guarda + doc (esta change) — pode ir antes ou depois do back, é aditivo e sem risco.
