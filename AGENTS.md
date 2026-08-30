# AGENTS.md

Lido por qualquer agente de código que trabalhe neste projeto (Antigravity, Claude Code, …).
Regras curtas e duras. Se uma bater de frente com o que você "acha melhor": as regras ganham.

## Regras inquebráveis

1. **Faça só o que a tarefa pede.** Nada de melhoria em código adjacente, arquivo novo,
   dependência ou abstração que a tarefa não exige. Um arquivo que a change **não nomeia** não entra no diff sem você dizer **qual arquivo e por quê**. Incluir arquivo fora do escopo calado = violação.
2. **Edite o código ANTES de marcar `[x]`.** Nunca marque tarefa concluída sem um diff correspondente.
3. **Checagem de Saúde OBRIGATÓRIA:** Depois de cada tarefa, rode os testes, build e linter da respectiva aplicação (Front ou Back). **Vermelho = pare.**
4. **Resolução de Erros e Limite de Tentativas:** Se o código ou teste quebrar após sua alteração, faça no máximo **3 tentativas** de correção. Se falhar na 3ª, **desfaça a alteração daquela tarefa (git restore/checkout)** e chame o humano. Não entre em loop infinito.
5. **Busca de Impacto (Discovery Obrigatório):** Antes de alterar a assinatura de uma função, classe, componente ou DTO exportado, **busque ativamente (grep)** onde ele é usado no repositório. Atualize os consumidores. Se o impacto for gigante (ex: 20+ arquivos), avise antes de prosseguir.
6. **Integridade de Testes:** Nunca edite um teste pré-existente pra ele passar a menos que o comportamento tenha mudado de propósito — e aí diga o porquê.
7. **Sem Commits:** Não commite nem pushe. Deixe as mudanças no working tree.
8. **Não "conserte" infra fora da change:** Mock global, setups, config de DB, helper de render — só mexe se a tarefa for sobre isso.

## Autonomia e Modo "Auto-Approve"

1. **Permissão Total Autorizada:** Quando configurado no ambiente (flag CLI `--dangerously-skip-permissions` ou IDE destravada), você tem permissão irrestrita para rodar scripts, alterar arquivos e avançar tarefas **sem perguntar "posso continuar?"**.
2. **Execução Contínua:** Vá de ponta a ponta na spec. Só pare se encontrar um impeditivo real (erro persistente ou ambiguidade de escopo).
3. **Tratamento de Exceções:** Nenhuma exceção deve ser engolida silenciosamente (ex: `catch(e) {}` vazio). Falhas de API no front devem refletir na UI. No back, use o Logger oficial.

## Fatos do projeto (Front-end)
*Diretório: `simplecote-front`*

- **Stack:** Vite + React 19 + TypeScript + Tailwind v4 + `@base-ui/react` + componentes hand-rolled estilo shadcn em `src/shared/components/ui/`. Fonte Geist.
- **Comandos:** `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm test` (`vitest run`), `npm run lint` (`oxlint`).
- **Trabalho de UI:** Entenda o propósito e estados (loading/erro/etc). Reuse tokens e primitives (`variants`), copy em **pt-BR**. Telas `/representante` são mobile-first, tema claro forçado.
- Testes usam **MSW** (mockam a API). Passar no MSW não garante a integração real.
- **Não puxe dependências extras:** Zero dependência nova (ex: `shadcn add`) sem aprovação explícita.

## Fatos do projeto (Back-end)
*Diretório: `simplecote-back`*

- **Stack:** Java 25 + Spring Boot 4.1.1 + Maven.
- **Testes e DB:** PostgreSQL, Flyway, Testcontainers, JUnit Jupiter.
- **Comandos:** `./mvnw spring-boot:run` (iniciar), `./mvnw clean test` (testar), `./mvnw clean package -DskipTests` (build).
- **Banco e Migrações (Flyway):** **NUNCA altere um arquivo de migração (`V*.sql`) já aplicado.** Se a tarefa exige mudança no banco, crie sempre um **NOVO arquivo** de migração com a numeração subsequente. Nunca drope/delete colunas ou tabelas sem consultar o humano.

## Handoff — ao terminar a change OU ao parar

Escreva um resumo com:
- **Arquivos novos e modificados** (caminho + resumo de 1 linha).
- **Testes pré-existentes que você alterou** e qual comportamento justificou a mudança.
- **Fora do escopo** que entrou no diff e o motivo.
- **Status da suíte:** Resultado do build/test/lint das aplicações que você tocou.

---
_Regras destiladas dos skills `ai-loop`, `moyu` e `anti-ui-slop`, com proteções rígidas de circuito (circuit breakers) e autonomia injetadas._
