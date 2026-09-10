# Exploração — o representante cota por embalagem ou por unidade?

**Data:** 2026-09-10 · **Status:** ideia, nada decidido · **Origem:** conversa com o fundador.

## Contexto

Hoje o representante digita **um preço por item: o da embalagem inteira** (a caixa,
o fardo…). O back guarda esse valor em `lance.preco` e deriva
`precoUnitario = preco ÷ quantidadePorEmbalagemSnapshot` (4 casas) — usado na grade
ao vivo e na apuração pra comparação humana e contra o histórico de compra. A
disputa dentro de um item é a mesma ordenando por embalagem ou por unidade, porque
a `quantidadePorEmbalagem` é fixa por item.

Já foi feito (change/tela do representante): **um campo só** de preço, rótulo pela
embalagem ("Preço da caixa"), e o valor por unidade virou dica discreta abaixo do
campo, só quando a embalagem tem >1 unidade.

## A ideia

Alguns fornecedores pensam em "R$ por unidade / por kg", não em "R$ pela caixa".
Se o catálogo do comprador diz "Caixa com 12" e o vendedor só sabe "R$ 3,00 a
unidade", obrigá-lo a calcular 12 × 3,00 = 36,00 é fonte de erro. Uma
**configuração por loja** deixaria o comprador escolher em que unidade os
representantes dele cotam:

- `EMBALAGEM` (padrão, comportamento de hoje) — digita o preço da caixa;
- `UNITARIO` — digita o preço por unidade, o resto o sistema faz.

## O que precisa mudar

- **Setting por loja** no back (`Configuracao`): `modoPrecoCotacao: EMBALAGEM | UNITARIO`.
  Tela nova em Configurações pra ligar/desligar.
- **Tela do representante**: rótulo, placeholder, dica e a validação seguem o modo.
  No modo `UNITARIO` a dica inverte ("≈ R$ 36,00 na caixa").
- **Conversão no front** (mantém o back intacto): no modo `UNITARIO`, envia
  `preco = unitario × quantidadePorEmbalagemSnapshot`. Grade e apuração continuam
  lendo `lance.preco` como preço de embalagem.
- **Precisão decimal** — o ponto sensível. Preço de embalagem em 2 casas é exato;
  preço unitário muitas vezes precisa de 3–4 casas (R$ 0,833/un numa caixa/12 a
  R$ 10,00). No modo `UNITARIO` o input teria que aceitar mais casas, e a
  conversão pra embalagem precisa de uma regra de arredondamento clara pra grade
  e apuração baterem com o que o representante vê.
- **Corrigir lance** (admin, `ParticipanteService.corrigirLance`) — o preço que
  entra e o que aparece na trilha `correcao_lance` também seguem o modo.
- **Tutorial** (`TutorialOnboarding`) — copy por modo.

## Análise

O caso de uso é legítimo (setores que cotam por unidade/kg). O risco está todo na
**precisão** e na **consistência** entre o que o representante digita, o que a
grade mostra e o que a apuração calcula — três lugares que hoje só falam "preço de
embalagem". Não é grande, mas merece ser especificado antes de codar, não
improvisado.

Não bloqueia ninguém: com **um campo só** (já feito) a confusão de "qual preço eu
preencho" acabou, e pra itens cadastrados como "Unidade" (qtd 1) o preço da
embalagem **já é** o unitário.

## Se virar change

1. `modoPrecoCotacao` no `Configuracao` + endpoint + tela em Configurações.
2. `ItemLanceCard` parametrizado pelo modo (rótulo/dica/precisão/conversão).
3. Regra de arredondamento documentada e testada ponta a ponta (input → `lance.preco`
   → `precoUnitario` da grade → apuração).
4. `corrigirLance` e a trilha `correcao_lance` no mesmo modo.
5. Copy do tutorial por modo.
