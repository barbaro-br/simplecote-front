# Exploração completa do sistema — 2026-09-03

Sessão de teste manual (via browser automation) cobrindo o painel admin e o
fluxo público do representante, em ambiente dev (front `localhost:5173` +
back `localhost:8080`, dados do `SeedDadosDev`). Objetivo: mapear tudo que dá
pra melhorar — layout, lógica, usabilidade — para depois formalizar em
changes do OpenSpec. Nada foi corrigido nesta rodada, só investigado e
documentado.

Cada achado abaixo tem: o que eu vi, como reproduzi, e o trecho de código que
explica a causa (quando encontrei). Numerados por área para facilitar
transformar em changes depois.

---

## 1. Painel Admin — Cotações

### 1.1. [MÉDIO] Nomenclatura de status inconsistente entre Dashboard e lista de Cotações
O Dashboard mostra o resumo "Cotações por status" com as categorias
**Rascunho / Aberta / Encerrada / Apurada / Cancelada**. A lista de Cotações
(`/admin/cotacoes`) filtra pelas categorias **Rascunho / Aberta / Encerrada /
Pedidos gerados / Cancelada**. É o **mesmo status** (`PEDIDOS_GERADOS` no
enum `StatusCotacao`), só que rotulado "Apurada" num lugar e "Pedidos
gerados" no outro.

- Confirmado em `AnaliseRepository.java` (comentário: `"apurada" = ... PEDIDOS_GERADOS`)
  e `ContagemPorStatus.java`.
- Um usuário que vê "2 apuradas sem pedido enviado" no Dashboard não vai achar
  um filtro "Apurada" na lista — precisa saber que é a mesma coisa que
  "Pedidos gerados".
- **Sugestão**: escolher um único rótulo e usar nos dois lugares.

### 1.2. [ALTO] Modal "Representantes Convidados" permite ações sem efeito real em cotação já encerrada/apurada
Os botões **"Finalizar"** (força VISUALIZOU→RESPONDIDO) e **"Reabrir
resposta"** (RESPONDIDO→VISUALIZOU) em `RepresentantesModal.tsx` não
verificam o status da Cotação — só o status do Participante.

- Confirmado em `ParticipanteService.reabrirResposta()` /
  `finalizarPeloAdmin()`: nenhum dos dois consulta `cotacao.getStatus()`.
- O `podeEditar` (que realmente bloqueia edição pelo representante) exige
  `StatusCotacao.ABERTA` (`ParticipanteService.java:252`) — então na prática
  o representante continua sem poder editar nada.
- Resultado: um admin pode clicar "Reabrir resposta" numa cotação já
  `PEDIDOS_GERADOS`/`ENCERRADA`/`CANCELADA`. O participante volta a aparecer
  como "Visualizou" ao invés de "Respondido" (afeta contadores/dashboards),
  sem nenhum efeito útil e sem nenhum aviso na UI de que a cotação não está
  mais aberta.
- **Sugestão**: esconder ou desabilitar esses botões quando
  `cotacao.status !== 'ABERTA'`, com uma dica do motivo.

### 1.3. [ALTO] "Não enviado" esconde falha real de envio de e-mail
`RepresentantesModal.tsx:214` faz `enviado = conviteStatus === 'ENVIADO'` e
mostra "Não enviado" para qualquer outro valor. O enum `ConviteStatus` só tem
`ENVIADO` e `FALHOU` (`ConviteStatus.java`) — ou seja, quando o envio
**tentou e falhou de verdade** (SMTP fora do ar, endereço inválido etc.), o
admin vê exatamente o mesmo rótulo "Não enviado" que veria se o sistema
simplesmente ainda não tivesse tentado.

- Reproduzido ao abrir uma cotação nova no ambiente dev: os 3 participantes
  vieram com `conviteStatus: "FALHOU"` (sem SMTP local) e a modal mostrou
  "Não enviado" pra todos, sem qualquer sinal de erro.
- **Sugestão**: distinguir visualmente "nunca tentamos" de "tentamos e
  falhou" (ex.: rótulo/cor diferente para `FALHOU`, com tooltip do motivo se
  disponível).

### 1.4. [MÉDIO] Preset "Hoje às 18h" no diálogo "Lançar Cotação" continua selecionável depois das 18h
Em `AbrirCotacaoDialog.tsx`, `tipoPrazo` começa sempre em `'hoje_18'`
(linha 43), independente da hora atual. Só há uma validação tardia em
`confirmarFinal()` (`new Date(prazo).getTime() < Date.now()` → erro "O prazo
precisa ser no futuro."), acionada **depois** do clique em "Abrir Cotação".

- Depois das 18h, o preset padrão fica pré-selecionado e clicável mesmo
  garantidamente inválido — o admin só descobre ao tentar confirmar e receber
  um erro genérico.
- **Sugestão**: desabilitar/ocultar presets já vencidos, ou escolher um
  preset padrão sensível à hora atual.

### 1.5. [BAIXO] Modal "Adicionar Produtos" não reflete a seleção em andamento no cabeçalho
Em `AdicionarItemModal.tsx:155`, `qtdSelecionados = itens.length` usa a prop
`itens` (itens **já salvos** na cotação), não o estado local `drafts` (o que
o usuário está marcando/desmarcando agora). Resultado: numa cotação nova,
marcar 2 produtos com checkbox mantém o subtítulo em "Nenhum produto
adicionado" até clicar "Concluído" — nenhum feedback ao vivo da seleção.
- **Sugestão**: calcular o subtítulo a partir de `itensMap` + `drafts`
  combinados (contagem líquida do que vai ficar salvo), não só de `itens`.

### 1.6. [BAIXO] "Encerrar" não pede confirmação (mas "Apurar" pede)
Clicar "Encerrar" na Cotação muda o status imediatamente, sem diálogo — já
"Apurar" tem confirmação clara ("Apurar não pode ser desfeito..."). Encerrar
é reversível via "Reabrir", então não é grave, mas é uma assimetria que vale
alinhar (ou as duas pedem confirmação, ou nenhuma).

### 1.7. [BAIXO] Nome da loja truncado na sidebar mesmo com espaço sobrando
A sidebar mostra "Sara Super..." em vez de "Sara Supermercado" mesmo em
telas largas (1568px+), porque o botão de recolher menu ao lado força uma
largura de texto pequena demais. Testado em 3 larguras diferentes
(1054px, 1568px), sempre truncado.

---

## 2. Fluxo do Representante (`/cotacao/:token`)

### 2.1. [CRÍTICO] Badge "Novo" dispara falso positivo em qualquer cotação com 2+ itens
A lógica em `cotacao-token.derivados.ts`:
```ts
export function itemEhNovo(item, todosItens) {
  if (item.statusLance !== 'PENDENTE') return false
  return todosItens.some(i => i.itemCotacaoId !== item.itemCotacaoId && i.statusLance !== 'PENDENTE')
}
```
marca um item como "Novo" sempre que ele **ainda está PENDENTE** enquanto
**qualquer outro item da mesma cotação** já foi tocado (COTADO ou
NAO_COTADO) — não só quando o item foi genuinely adicionado depois pelo
admin.

- **Reproduzido ao vivo**: criei uma cotação com 2 itens desde o início (nenhum
  "adicionado depois"), abri o link do representante, precifiquei o item 1 —
  o item 2 imediatamente ganhou o badge "Novo", mesmo nunca tendo sido
  adicionado tardiamente.
- O badge só se destina a sinalizar itens que o comprador incluiu **depois**
  que o representante já estava respondendo (change
  `permitir-adicionar-item-cotacao-aberta`), mas na prática vai aparecer em
  **qualquer** sessão onde o representante preenche os itens um de cada vez
  (comportamento normal, quase universal) — o que torna o badge
  essencialmente sem sentido na maioria das cotações reais com mais de um
  item.
- **Sugestão**: a heurística precisa de um sinal real de "adicionado depois",
  por exemplo comparar `criadoEm` do item com o primeiro carregamento da
  página pelo representante (já existe `criadoEm` em `ItemCotacao`, exposto
  em `ItemCotacaoResponse`/`ItemGrid` desde a change anterior) — em vez de
  inferir a partir do status de preço dos outros itens.

### 2.2. [ALTO] Diálogo de confirmação "Enviar cotação?" mostra contagem de itens sem preço desatualizada
Precifiquei os 2 itens de uma cotação (confirmado via
`GET /public/cotacoes/:token` → ambos `COTADO` com preço correto), mas ao
clicar "Finalizar" o diálogo `ConfirmarEnvioDialog` alertou **"1 item sem
preço será enviado em branco"** — contagem errada, reproduzida de forma
consistente (o aviso ficou visível e estático mesmo bem depois do
`✓ salvo` aparecer nas duas linhas).

- Causa provável: `temPrecoLocal` (`CotacaoPorTokenPage.tsx:52-58`) é
  **re-semeado a partir de `cotacao.data`** toda vez que a referência desse
  objeto muda (`if (cotacao.data !== fonteSemeada) setTemPrecoLocal(...)`).
  Como `useCotacaoPorToken` (`cotacao-token.api.ts`) não define
  `staleTime`/`refetchOnWindowFocus: false`, o React Query pode refazer o
  fetch a qualquer momento (ex.: o tab reganha foco) e trazer de volta um
  snapshot do servidor **anterior** ao autosave do item ainda em voo — esse
  refetch reseta `temPrecoLocal` para o estado antigo, e como nenhum novo
  keystroke acontece naquele item depois disso, o valor errado nunca é
  corrigido.
- Isso é sério porque é a **última tela antes de enviar a resposta
  definitiva** ao comprador — um aviso errado pode fazer o representante
  achar que esqueceu algo (ou, na direção oposta, dar falsa confiança).
- **Sugestão**: não re-semear `temPrecoLocal` a partir de um refetch em
  background enquanto o usuário está editando; ou trocar por
  `staleTime: Infinity` + invalidação explícita só depois de mutações
  próprias.

### 2.3. [BAIXO] Toast "Preço removido / Desfazer" não expira no tempo esperado
Depois de limpar o preço de um item, o toast de undo ficou visível por bem
mais tempo que o padrão do `sonner` (~4s) — sobreviveu a várias interações
seguintes e ainda estava na tela na "Cotação enviada!" (tela de sucesso,
depois de finalizar). Vale checar se cada novo toast está resetando a
duração do anterior ao invés de empilhar/substituir corretamente.

### 2.4. [MÉDIO] Layout não se adapta a telas largas (desktop)
A tela `/cotacao/:token` (e a `/pedido/:token`) são "mobile-first" por
design, mas em viewport largo (testado 1568px) o conteúdo fica colado no
canto superior esquerdo numa coluna estreita, com a maior parte da tela
vazia — e a barra de ação fixa no rodapé estica 100% da largura, destoando
visualmente da coluna estreita de cards acima. Representantes que abrem o
link num notebook/desktop (bem comum — muita gente responde e-mail no PC do
trabalho) têm uma experiência capenga.
- **Sugestão**: limitar e centralizar a largura do conteúdo (`max-w-md
  mx-auto` ou similar) a partir de um breakpoint, mantendo mobile-first como
  comportamento abaixo dele.

---

## 3. Fluxo do Pedido (`/pedido/:token`)

### 3.1. [ALTO] Botão "Confirmar" fica habilitado antes do pedido estar "Enviado", e o erro é cru
Antes do admin clicar "Enviar" no Resultado, o pedido fica com status
`GERADO`. A tela pública `/pedido/:token`, porém, mostra o botão
"Confirmar" já habilitado. Ao clicar, o back rejeita com
`IllegalStateException("Só pode confirmar pedido ENVIADO.")`, e essa string
crua (com o nome do enum em inglês/técnico) aparece direto pro fornecedor,
sem tradução nem contexto.
- **Sugestão**: a tela deveria já indicar visualmente ("Aguardando envio
  pelo comprador") e desabilitar "Confirmar" quando `status !== 'ENVIADO'`,
  em vez de deixar o usuário descobrir isso só depois de clicar.

---

## 4. Áreas testadas e sem problemas encontrados
Para não perder o que já foi validado nesta rodada:
- Login/logout, "Esqueci minha senha" — telas padrão, sem problemas.
- Cadastro/edição de Produto, busca por GTIN (fallback correto quando não
  encontra: "Não encontrado — preencha o nome manualmente").
- Cadastro/edição de Empresa (modela 1 representante principal por empresa —
  não é bug, é decisão de escopo; vale só ficar de olho se algum fornecedor
  real precisar de múltiplos contatos no futuro).
- Fluxo completo Rascunho → Abrir → Grade ao vivo → Encerrar → Apurar →
  Resultado → PDF: matemática correta em todos os passos (testado com 2
  itens e 3 participantes convidados).
- "Convidar Empresas" (multi-seleção funciona corretamente).
- Autosave por item, cálculo de preço unitário, ✓/✗ automático (não são
  controles clicáveis — confirmado via accessibility tree, respeita a regra
  de não ter toggle explícito de "não cotar").
- Limpar preço via teclado (backspace) funciona como alternativa ao gesto de
  swipe em telas sem touch.
- Alternância "Estilo de navegação: Lateral/Inferior" em Configurações
  funciona corretamente nas duas opções.
- Análises (gasto por período, por empresa, últimos preços) — números batem.
- Segurança de "Usuários": existe `Inativar` sem proteção contra inativar a
  própria conta ou o último admin ativo do Comprador — ver 5.1 abaixo
  (colocado à parte por ser mais "operacional" que "UX").

---

## 5. Achados operacionais/segurança (fora do escopo estrito de UX, mas relevantes)

### 5.1. [ALTO] Nenhuma proteção contra inativar o único/próprio usuário admin
`UsuarioService.inativar()` não verifica se é o usuário logado, nem se é o
último usuário ativo do Comprador. Um clique acidental em "Inativar" no
único admin cadastrado pode travar o acesso ao painel inteiro sem caminho de
recuperação pela própria UI.
- **Sugestão**: bloquear (ou pedir confirmação redobrada) ao tentar inativar
  a própria conta logada, e nunca permitir zerar o total de admins ativos do
  Comprador.

---

## Resumo por severidade

| # | Área | Achado | Severidade |
|---|------|--------|------------|
| 2.1 | Representante | Badge "Novo" com falso positivo generalizado | Crítico |
| 1.2 | Admin/Cotações | Finalizar/Reabrir sem checar status da cotação | Alto |
| 1.3 | Admin/Cotações | "Não enviado" esconde falha real de e-mail | Alto |
| 2.2 | Representante | Contagem de "sem preço" desatualizada no confirmar | Alto |
| 3.1 | Pedido | Confirmar habilitado antes de "Enviado", erro cru | Alto |
| 5.1 | Usuários | Sem proteção contra inativar o único admin | Alto |
| 1.1 | Admin/Cotações | "Apurada" vs "Pedidos gerados" | Médio |
| 1.4 | Admin/Cotações | Preset "Hoje às 18h" fica selecionável já vencido | Médio |
| 2.4 | Representante | Layout não adapta a desktop | Médio |
| 1.5 | Admin/Cotações | Subtítulo do modal não reflete seleção em andamento | Baixo |
| 1.6 | Admin/Cotações | Encerrar sem confirmação (Apurar pede) | Baixo |
| 1.7 | Admin (geral) | Nome da loja truncado na sidebar | Baixo |
| 2.3 | Representante | Toast de undo não expira | Baixo |

**Próximo passo sugerido**: formalizar os itens Crítico/Alto primeiro como
changes do OpenSpec (2.1, 1.2, 1.3, 2.2, 3.1, 5.1), e agrupar os
Médio/Baixo num change de "polish" à parte.
