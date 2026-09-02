## Context

Ver `proposal.md`. Hoje: `"SimpleCote"` é literal em `AdminLayout.tsx:77` e `LoginPage.tsx:53`; `--primary` é uma constante `oklch()` em `src/index.css`, referenciada via classes Tailwind (`text-primary`/`bg-primary`/etc.) em dezenas de componentes — nunca como hex cru, o que já é favorável para injetar um valor dinâmico. Não existe nenhum modelo de "loja"/"configuração" nem no front nem no back (confirmado por busca em ambos os repositórios).

## Goals / Non-Goals

**Goals:**
- Uma única fonte de verdade para nome/cor/telefone/layout de e-mail da loja.
- Aplicar nome e cor dinamicamente onde hoje são hardcoded (login, sidebar, `--primary`).

**Non-Goals:**
- Multi-tenant: nenhum `lojaId`, nenhum isolamento de dados. É uma configuração global (singleton).
- Não implementa o envio de e-mail em si (isso já existe no back) — só o campo de "layout"/template salvo na Configuração; a integração de qual e-mail usa qual campo é decisão de implementação, não coberta aqui em detalhe.
- Não inclui o "estilo de menu" (lateral vs. inferior) — tratado em `menu-configuravel-lateral-ou-inferior`, que **depende** desta change existir primeiro (precisa de um lugar para guardar a preferência).

## Decisions

- **Config como singleton (uma linha só), não uma tabela multi-tenant.** Confirmado com o usuário: hoje é 1 instância por cliente; multi-tenant real fica para quando o clone da aplicação virar produto — decisão explicitamente adiada, não hoje.
- **Contrato de API assumido** (a implementar no back, fora deste repositório):
  ```
  GET /api/configuracoes
    → { nome: string, corPrimaria: string, telefone: string, layoutEmail: string }

  PUT /api/configuracoes
    body: { nome, corPrimaria, telefone, layoutEmail }
    → 200 com a configuração atualizada, ou 4xx com ProblemDetail em caso de validação
  ```
  Esse contrato é um ponto de partida razoável dado o padrão já usado pelo resto da API (`ProblemDetail` em erros, ver `admin/cotacoes` spec) — mas **precisa ser confirmado/ajustado junto com quem for implementar o lado back**, já que esta change não tem visibilidade do modelo de dados do back.
- **`corPrimaria` value: string CSS-compatível (ex.: `oklch(...)` ou hex)** para bater com o formato já usado em `src/index.css`. Um `<input type="color">` HTML nativo produz hex — a conversão hex→oklch (ou simplesmente aceitar hex e deixar o CSS var em hex, já que Tailwind v4 aceita qualquer valor CSS válido em `--color-primary`) é detalhe de implementação a resolver na task 2.
- **Aplicação da cor em runtime**: `document.documentElement.style.setProperty('--primary', corConfigurada)` num ponto único de bootstrap do app (ex.: um provider que lê a config antes de renderizar as rotas), não em cada componente.
- **Nome da loja via contexto/hook compartilhado** (`useConfiguracaoLoja()` ou similar), consumido tanto por `LoginPage.tsx` quanto por `AdminLayout.tsx`, em vez de cada tela buscar a config de forma independente.

## Risks / Trade-offs

- [Risco] **Bloqueante real**: o endpoint no back não existe. Esta change não pode ser aplicada de ponta a ponta sem uma change correspondente em `simplecote-back` → Mitigação: task 0 dedicada a confirmar o contrato com o back antes de integrar a chamada real; o formulário e a tela podem ser construídos e testados com dados mockados enquanto isso.
- [Risco] `LoginPage.tsx` hoje não depende de nenhuma chamada de API antes do login (é só um form) — passar a depender de `GET /api/configuracoes` para saber o nome da loja introduz uma nova falha possível (API fora do ar antes mesmo do usuário logar) → Mitigação: cenário "Configuração ainda carregando" já coberto no delta de `shared/design-system`; definir um fallback visual (não travar a tela de login se a config falhar — mostrar um estado neutro em vez de erro bloqueante).
- [Risco] Cor de marca arbitrária escolhida pelo lojista pode quebrar contraste com `--primary-foreground` (legibilidade de texto sobre botões) → Mitigação: fora de escopo desta change validar contraste automaticamente; documentar como conhecido e deixar para uma iteração futura se virar problema real.
