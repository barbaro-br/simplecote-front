## Context

O working tree contém trabalho parcial do outro agente sobre alguns desses pontos (renomeação dos campos do insight sem consertar os tipos; UI de Configurações migrada para abas com testes quebrados; `RedefinirSenhaForm` já com as duas mensagens exclusivas; remoção do `onClose()` ao editar produto). Esta change **completa e fecha** esses pontos — nunca começa do zero: a decisão aqui é o que fica e o que muda em cima do que já existe. O backend está rodando localmente (`:8080`, `admin@dev.local`/`admin123`) e foi usado para confirmar o contrato real dos dois endpoints afetados (`GET /api/analises/produtos/insight` e `GET/PUT /api/configuracoes`).

## Goals / Non-Goals

**Goals:**
- Insight de produto renderizando dados reais (nunca mais cair no fallback "Sem compra anterior" por erro de validação do Zod).
- Configurações persistindo de verdade (GET/PUT reais) e link do colaborador real.
- Shell admin utilizável em 375px sem rolagem horizontal da página.
- Testes verdes refletindo a UI atual (abas, toast, radios) e a grade de volta ao contêiner canônico.

**Non-Goals:**
- Não adicionar o campo `destacarMenorPrecoNaGrade` ao backend — decisão do dono: o toggle sai do form e o destaque fica sempre ligado (comportamento default atual da grade). O campo volta em outra change quando o back o suportar.
- Não mudar o comportamento "editar produto sem fechar o modal" (código e teste já concordam no working tree) nem a `BottomNavBar` do estilo INFERIOR.
- Não tocar no contrato do back (nenhuma mudança em `simplecote-back` nesta change).

## Decisions

- **Insight: contrato espelhado no schema, não "coerção tolerante"**: o schema passa a ter exatamente os nomes e tipos do back (`menorPrecoUnitario`, `precoMedioUnitario90d`, `compras`, `fornecedoresDistintos`, dinheiro como `z.number()`, `serie: array de {data, precoUnitario}`). Alternativa rejeitada — manter strings e converter no card com `parseNum` — porque reproduz a classe de bug (validação cega a divergência) e mantém dois formatos no código. O `UltimaCompraPopover` (insight derivado da grade) passa a construir o objeto no mesmo formato, então `InsightProdutoCard` e `Sparkline` consomem número direto (`moeda(number)`, série mapeada por `precoUnitario`).
- **Configurações: troca do mock por API real + remoção do campo órfão**: `configuracoes.api.ts` deixa de existir como fonte de dados em memória; `useConfiguracaoLoja` vira `useQuery` de `GET /api/configuracoes` e `useAtualizarConfiguracao` um `useMutation` de `PUT`. Os helpers de teste (`resetarMock`, `definirConfiguracaoMock`, `definirFalhaAoSalvar`) saem junto com o mock — os testes passam a usar MSW com handlers de `GET/PUT /api/configuracoes` (padrão do repo). `destacarMenorPrecoNaGrade` sai do schema e do form; `GradeAoVivoTabela` passa a usar `true` constante (destaque sempre ligado) e o teste da preferência desligada vira teste do comportamento default.
- **Mobile: topbar + drawer, não "sidebar em modo ícone"**: abaixo de 768px (`matchMedia` já existente no `AdminLayout`) a sidebar não renderiza inline; uma topbar com hamburger abre a sidebar como drawer sobreposto (`fixed`, overlay escuro, fecha em navegação/X/fora). Acima de 768px o comportamento atual é intocado. A rolagem horizontal da página some porque o `main` já tem `min-w-0` (ajuste recente) e as tabelas/grade têm rolagem própria; conferir e fechar gaps (ex.: `Cotações` e `Produtos` em 375px).
- **Grade: reverter o contêiner ao canônico** `overflow-x-auto overflow-y-auto max-h-[65vh]` (removendo o `overflow-auto max-h-[70vh] relative` do flash) e realinhar o teste. O cenário novo no delta spec fixa 65vh para isso não regredir de novo sem tocar a spec.
- **Testes de Configurações**: realinhar ao layout de abas (ativar a aba antes de assertar radios), ao toast de erro (em vez de `role=alert`), e ao link do colaborador agora vindo da API (MSW devolve token; o botão copiar continua como está).
- **Validação pt-BR de quantidade**: mensagens customizadas no Zod para `number`/`int` (ex.: "Informe a quantidade por embalagem" / "A quantidade deve ser um número inteiro"), além do `.min(1)` que já é pt-BR.

## Risks / Trade-offs

- [Remover o toggle de destaque é uma regressão de feature aceita pelo dono] → registrado no delta spec (`admin/configuracoes`) com cenário "não existe a opção"; quando o back ganhar o campo, a mudança é pequena e o spec já documenta o caminho.
- [Dois formatos de insight coexistem até o fim da implementação (grade derivada vs API)] → a tarefa de `UltimaCompraPopover` faz parte da mesma sequência do schema, fechada antes dos testes; enquanto isso `tsc` acusa qualquer formato errado (tipos são a rede de segurança).
- [Drawer mobile pode colidir com o `BotaoAjudaFlutuante`/BottomNavBar em 375px] → o drawer usa `z-50` acima do conteúdo e o botão de ajuda permanece `z` menor; checagem visual no e2e da change.
- [Muitos testes do repo dependem dos helpers de mock de configurações] → a troca por MSW mexe em `GradeAoVivoTabela.test.tsx`, `ConfiguracoesPage.test.tsx` e `AdminLayout`; as tasks listam cada arquivo e a checagem de saúde completa é obrigatória ao final (381 testes hoje).
