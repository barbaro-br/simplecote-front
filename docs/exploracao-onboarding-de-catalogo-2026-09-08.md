# Exploração — trazer o catálogo do cliente pra dentro do SimpleCote

**Data:** 2026-09-08 · **Status:** ideias, nada decidido · **Origem:** conversa com o fundador.

O atrito de onboarding hoje: o cliente precisa cadastrar produto por produto (ou usar o import de CSV cru que já existe — `ImportacaoCatalogoService` / `ArquivoCatalogoLeitor` no back). Para um supermercado com milhares de SKUs isso é inviável na mão. Três frentes discutidas, da mais simples pra mais ambiciosa.

---

## Frente A — Planilha-modelo pra download + import

**Ideia:** um botão "Baixar planilha modelo" no catálogo. A planilha vem com:
- colunas **fixas / travadas**: `Nome do produto`, `Código de barras`, `Embalagem`, `Qtd. por embalagem`;
- a coluna `Embalagem` é um **dropdown** (data validation) com `Unidade / Caixa / Fardo / Cartela` — o cliente só seleciona;
- opcionalmente `Estoque atual` e `Estoque mínimo` (ver Frente B).

O cliente preenche no Excel/Sheets no ritmo dele e sobe de volta (`.xlsx` ou `.csv`). O import faz **upsert por código de barras** (barcode é a chave; sem barcode, casa por nome normalizado e avisa duplicatas).

**Por que é o caminho de menor risco:**
- Aproveita o import que já existe — é mais UX + um `.xlsx` com validação do que back novo.
- Zero acesso a sistema de terceiro, zero credencial, zero infra.
- Funciona pra 100% dos clientes independente do ERP deles.

**A fazer (se virar change):**
- Gerar o `.xlsx` modelo no servidor (lib de xlsx) com as validações e um cabeçalho protegido; ou um `.xlsx` estático versionado em `public/`.
- Import aceitar `.xlsx` além de `.csv`; relatório de linhas OK / ignoradas / atualizadas (o `ResultadoImportacaoDTO` já tem forma disso).
- Enriquecer pelo GTIN: se a linha só tem barcode, puxar nome/marca do `ProdutoLookupProvider` que já existe.

---

## Frente B — Integração com o banco / sistema do cliente

**Ideia:** o SimpleCote conecta no sistema do cliente e puxa **nome, código de barras, estoque** dos produtos. Um botão "Gerar cotação" que:
1. testa a conexão (pré-validada), 
2. aplica um **filtro de estoque** ("traz só o que está com estoque ≤ mínimo"),
3. importa esses itens; o cliente só põe a quantidade que quer comprar.

### Análise honesta

O apelo é real — seria de longe o melhor fluxo. Mas "conectar no banco do cliente" tem três paredes:

**1. Alcance de rede.** O ERP de supermercado pequeno/médio no Brasil quase sempre roda **on-premise** (servidor na loja ou numa VM local), sem porta exposta pra internet. Opções, da pior pra melhor:
- abrir porta do banco pra internet → **não**, risco inaceitável pro cliente;
- VPN / túnel dedicado por cliente → caro de operar, não escala;
- **um agente/conector** que o cliente instala na rede dele, que ele configura e que fala com o SimpleCote de dentro pra fora (só saída HTTPS) → é o modelo certo, mas é um produto à parte;
- **exportação agendada**: o ERP gera um arquivo (produtos + estoque) num diretório/FTP/e-mail e o SimpleCote consome → 80% do valor da integração viva, com uma fração do custo.

**2. Heterogeneidade de schema.** "O banco é sempre Postgres/Oracle/SQL Server/SQLite" — verdade, mas o **schema é 100% específico do fornecedor do ERP**. No varejo BR são dezenas (Consinco, Linx, TOTVS/Protheus, Sysmo, RMS, VR, Sischef…), cada um com suas tabelas de produto, unidade e saldo. Não existe padrão. Pra puxar dado a gente precisaria de **um adaptador por ERP** ou de um **assistente de mapeamento** ("qual tabela/coluna é o produto? o barcode? o saldo?"). Isso é uma linha de produto de integração, não uma feature.

**3. Confiança e suporte.** Pedir credencial (mesmo read-only) do banco de produção do cliente é uma barreira comercial e de segurança grande. E cada atualização do ERP do cliente pode quebrar o mapeamento — vira custo de suporte recorrente.

### Tradução de unidade (caixa 12 ↔ unidade)

Esse pedaço **a gente já modela**: `Produto.unidade` + `quantidadePorEmbalagem`. Se o import trouxer "estoque em unidades" e "como é vendido/comprado", dá pra:
- guardar um `fatorConversao` por produto (unidades por embalagem de compra);
- estoque exibido/filtrado em unidades; a cotação pede **caixas** = `ceil(qtdDesejada / fator)`.
O difícil não é a conta — é **saber a unidade de medida de cada item no sistema do cliente**, o que volta pro problema de mapeamento do import.

### Recomendação

- **v1 (agora):** Frente A + import flexível com **mapeamento de colunas** e barcode como chave. Cobre a maioria.
- **v1.5:** aceitar **exportação agendada** (arquivo num FTP/drop) — atualiza catálogo **e** estoque periodicamente, sem conexão viva. O botão "gerar cotação com filtro de estoque" funciona só com esses números importados.
- **v2 / enterprise:** conector-agente instalável, com adaptadores por ERP, feito sob demanda pra cliente grande que peça e pague.

Ou seja: dá pra fazer o **efeito** que ele quer (cotação a partir do estoque, filtro "estoque baixo") sem a parte difícil (banco vivo do cliente) — basta o estoque entrar por arquivo com alguma frequência.

### Campos que isso implica no `Produto` (futuro)

- `estoqueAtual` (nullable — só preenchido pra quem sincroniza)
- `estoqueMinimo` (nullable)
- `fatorConversao` / unidade de compra vs. venda
- `atualizadoEmEstoque` (quando o número entrou)

---

## Frente C — Categorias de produto

Hoje **não existe** categoria (`Produto` tem nome, barcode, embalagem, qtd, ativo). Ideia: classificar (bebida, mercearia seca, limpeza, higiene, bomboniere, hortifruti, açougue, frios…).

**Pra que serve:**
- cliente **grande**: "quero uma cotação só de chocolates" → filtra o catálogo por categoria em vez de rolar 200 itens que ele não lembra o nome;
- "nova cotação a partir de uma categoria" pré-carrega os itens daquela categoria;
- relatórios e análises por categoria depois.
- cliente **pequeno** não vai ligar — então a categoria é **opcional**, nunca obrigatória pra cadastrar/cotar.

**Decisões em aberto:**
- **1 categoria ou N?** Recomendação: **N categorias (tags)** por produto, com uma **"categoria principal" opcional**. Ex.: "Bis" = `chocolate` + `bomboniere`. Uma-só engessa; N cobre os casos reais de varejo.
- **Árvore fixa ou livre?** Semente com uma árvore padrão de varejo (editável pelo cliente) — melhor que texto livre (senão vira "Bebida", "bebidas", "BEBIDA" tudo separado).
- **De onde vem a categoria?** (a) o cliente escolhe no cadastro; (b) coluna `Categoria(s)` na planilha-modelo; (c) sugestão automática pelo GTIN — os provedores de lookup costumam devolver a categoria GS1 (GPC/brick), dá pra pré-preencher.

**Impacto (futuro):** tabela `categoria` (por `comprador_id`, com RLS) + `produto_categoria` (N:N); `Produto` ganha `categorias`; filtro na tela de catálogo e no "adicionar item"; coluna no import.

---

## Resumo / próximos passos possíveis

| Frente | Esforço | Quando | O que destrava |
|---|---|---|---|
| A — planilha-modelo + import xlsx com mapeamento | baixo | pode ser já | onboarding de catálogo em massa |
| C — categorias (N por produto, principal opcional) | médio | quando aparecer cliente grande | cotação por categoria, menos busca por nome |
| B v1.5 — estoque por exportação agendada + filtro "estoque baixo" + botão "gerar cotação do estoque" | médio-alto | depois de A | o fluxo que ele descreveu, sem banco vivo |
| B v2 — conector-agente com adaptadores por ERP | alto | sob demanda enterprise | integração viva de verdade |

Nada disso está no roadmap de SaaS (`openspec/SAAS-ROADMAP.md`) — é trilha de produto separada, pós-lançamento.
