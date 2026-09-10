# Exploração — pedido avulso + prazo preferencial de pagamento

**Data:** 2026-09-10 · **Status:** ideias, nada decidido · **Origem:** conversa com o fundador.

Hoje o SimpleCote só sabe **cotar** (leilão reverso dos produtos que o comprador cadastrou). Surgiram duas frentes novas na conversa, independentes entre si. Nenhuma entra no branch do redesign — viram change própria depois, com backend.

---

## Frente 1 — Pedido avulso ("pedido direto", sem disputa)

**O caso de uso:** o dono do supermercado quer **fazer um pedido e deixar registrado no sistema**, só pra ter a cópia. Não é cotação: não tem leilão, não tem prazo de resposta, pode nem ter representante do outro lado. Cenário típico: o comprador está **no telefone com o representante**, vai batendo os itens ("me passa os quatro últimos dígitos do código de barras"), fecha, e guarda o pedido no sistema. Se quiser, exporta em PDF e manda pro representante; se não, fica só pra conferência dele.

### O que um pedido avulso tem

- **Quem compra** — o comprador logado / a loja (Supermercado Sara).
- **Quem vende** — uma empresa/fornecedor escolhida do cadastro (ou digitada na hora?).
- **Itens** — produto + quantidade + preço unitário (digitado pelo comprador, não cotado).
- **Prazo** — o prazo de pagamento acordado (texto livre tipo "28 dias" ou "14/21/28"; ver Frente 2 pro conceito).
- **Observação** — livre.
- **Total** — soma dos subtotais.
- Data, status (rascunho → fechado), e um PDF.

### Por que NÃO reaproveitar a máquina de cotação

Cogitamos tratar como "cotação de 1 fornecedor sem disputa". O fundador descartou:
- pode não ter representante nenhum envolvido — é o comprador digitando tudo;
- não precisa do fluxo de convite/token/resposta;
- o valor está em ser **rápido e local** (conferência por telefone), não num ciclo.

Ou seja: **entidade própria**, mais enxuta. Reaproveita:
- o **seletor de produtos** do catálogo (o mesmo `AdicionarItemModal` / lista de produtos);
- a **geração de PDF** de pedido que já existe (`baixarPedidoPdf` / o template do back);
- possivelmente a **tela de conferência por token** (`/pedido/:token`) — mas como *opcional*: o comprador decide se gera um link pro representante ver, ou se só baixa o PDF e pronto.

### Fluxo esboçado

1. "Novo pedido" → escolhe o fornecedor.
2. Abre a lista de produtos, vai adicionando (com quantidade e preço unitário). Busca por nome **ou pelos últimos 4 dígitos do código de barras** (ver melhoria abaixo).
3. Preenche prazo + observação.
4. "Fechar pedido" → PDF disponível.
5. Opcional: "Enviar cópia ao representante" (e-mail / WhatsApp / link).

### A fazer (se virar change)

- **Back:** entidade `PedidoAvulso` (comprador, empresa, itens[], prazoTexto, observacao, total, status, criadoEm); `POST/GET/PATCH /api/pedidos-avulsos`; endpoint de PDF; opcional endpoint de "compartilhar" gerando token read-only.
- **Front:** rota `/admin/pedidos` (lista) + `/admin/pedidos/novo` e `/admin/pedidos/:id`; reusar o seletor de produtos e o `GradeDados` de itens; botão "Baixar PDF" e "Enviar cópia".
- **Decidir:** fornecedor só do cadastro, ou permite avulso digitado? O preço unitário é obrigatório ou pode ficar em branco (só pra listar o que comprou)?
- **Nome no menu:** "Pedidos" convive com o "Pedidos" que sai da apuração de cotação — precisa desambiguar (ex.: "Pedidos diretos" vs a aba de resultado).

---

## Frente 2 — Prazo preferencial de pagamento (pequeno, pode vir antes)

**O que É:** o **comprador** (a loja que está cotando) define um **prazo preferencial de pagamento** — ex.: `14/21/28` ou `21/28/35` dias. Esse texto aparece como **informação na tela do representante** (o link `/cotacao/:token` onde ele digita os preços), pra ele precificar já considerando aquele prazo.

**O que NÃO é:**
- não é o prazo que cada fornecedor oferece (não é "Martins dá 14/21/28, Época dá 21/28/35");
- não tem cálculo nenhum — nada de valor presente, nada de comparar preço+prazo;
- é só um campo de texto que a loja preenche e o representante lê.

### A fazer (se virar change)

- **Back:** campo `prazoPreferencialPagamento` (string, opcional) na cotação; incluir no payload do `GET /public/cotacoes/{token}`.
- **Front admin:** input "Prazo preferencial de pagamento" ao montar/abrir a cotação (no `AbrirCotacaoDialog` ou na faixa de contexto da tela de detalhe).
- **Front representante:** exibir "Prazo preferencial: 14/21/28" no cabeçalho da `CotacaoPorTokenPage`, junto do "Olá, Fulano · Empresa · cotação de …".
- **Escopo:** ~1 campo, 3 telas tocadas. Bem menor que a Frente 1 — dá pra fazer sozinho depois do redesign sem depender da Frente 1.

---

## Melhoria solta — buscar pelos últimos 4 dígitos do código de barras

Apareceu no meio da conversa da Frente 1, mas vale pra **qualquer busca de produto**: quando o comprador está no telefone, o representante dita "os quatro últimos: 3412".

Estado atual:
- **Catálogo (`ProdutosPage`)** — já busca no `codigoBarras` com `includes`, então "3412" **já casa** com um barcode terminado em …3412. OK.
- **Seletor de item da cotação (`AdicionarItemModal`)** — filtra **só por nome**, ignora o código de barras. É o buraco real.

- **Front-only**, pequeno: fazer o `AdicionarItemModal` também testar `p.codigoBarras` (`includes`, que já cobre "termina com"). Dá pra encaixar no redesign, ou deixar pra change do pedido avulso.
