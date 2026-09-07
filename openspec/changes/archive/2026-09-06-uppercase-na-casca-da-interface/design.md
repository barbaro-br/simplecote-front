## Context

Pedido: interface em caixa alta. Aplicar em tudo prejudica leitura (e-mail, mensagem digitada) e acessibilidade. Precisa de uma fronteira clara entre "casca" (chrome) e "conteúdo".

## Goals / Non-Goals

**Goals**
- Caixa alta consistente na casca e nos nomes de catálogo, via CSS (sem tocar strings).
- Regra explícita do que fica de fora.

**Non-Goals**
- Reescrever labels no código.
- Caixa alta em dado pessoal, texto livre ou entrada em edição.

## Decisions

### Via `text-transform`, nas classes dos componentes `ui/`
Nada de seletor global (`body *`). Aplicar na classe de cada componente de casca (`button`, `badge`, `breadcrumb`, cabeçalho de `table`, `tabs`, `menu-acoes`) e nos itens de navegação do `admin/layout`. Assim o DOM mantém o texto original (testes por `getByText` seguem valendo) e a transformação é puramente visual.

### O que é "casca" (recebe caixa alta)
Rótulo de campo (`<label>`), botão, título de página (`h1`) e de seção (`h2`/`h3` de chrome), cabeçalho de coluna de tabela, `StatusBadge` e chips, navegação (bottom nav / menu lateral), breadcrumb, título de diálogo, rótulos de abas.

### O que é "nome de catálogo" (recebe caixa alta)
O nome exibido de **Produto** e de **Empresa** nas telas de listagem/seleção/grade/resultado. É dado do sistema, comparável a um SKU — o usuário pediu explicitamente.

### O que NÃO recebe
- E-mail, WhatsApp, token, link mágico.
- Mensagem que o representante digita; observação do pedido.
- O texto dentro de `input`/`textarea`/`Combobox` enquanto o usuário digita (aplicar caixa alta aí engana sobre o que foi salvo).
- Crédito "Desenvolvido por Francisco Montalvão".
- **Título da cotação digitado pelo admin**: decisão — **não** transformar (é texto livre do usuário; se ele digitar "Cotação semana 35" quer ver assim). Cabeçalhos/labels ao redor dele ficam em caixa alta; o valor não.

### Acento
`text-transform: uppercase` nos navegadores atuais é locale-aware para pt-BR — `ç`→`Ç`, `ã`→`Ã`, `é`→`É`. Sem necessidade de `text-transform: uppercase` + `lang` explícito, mas `<html lang="pt-BR">` já ajuda (confirmar que está no `index.html`).

## Risks

- Algum teste que assere `expect(el).toHaveTextContent('PRODUTOS')` (esperando o transformado) quebraria — mas o padrão do repo é comparar o texto real; buscar (`grep`) por asserts em caixa alta antes.
- Um nome de produto que já venha todo em maiúsculas no cadastro fica igual (idempotente). Um que venha "Arroz 5kg" vira "ARROZ 5KG" só na tela; o dado no banco não muda.

## Migration / Rollout

Sem migration. É CSS. Reversível removendo as classes.
