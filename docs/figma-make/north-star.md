# Figma Make — prompt "north-star"

Prompt para colar **inteiro** no Figma Make. O objetivo é gerar um *design system
visual* aplicado a telas de referência — **não** um app funcional. O código que o
Make devolver é insumo de design: a gente extrai os tokens/padrões pro nosso
Tailwind + tema shadcn (um PR focado) e depois segue tela a tela.

## Como usar

1. Cola o bloco abaixo no Figma Make. Opcional: anexa junto o print do plano do Figma.
2. Deixa ele gerar as 5 telas (A–E).
3. Traz de volta: (1) o código gerado e (2) uma linha do que agradou / do que não.
4. Adaptação aqui: remapear primitivos, dados mock e tokens de cor dele → nossos
   componentes `@/components/ui/*`, tema e hooks de API reais; preservar o
   comportamento que já é nosso (autosave/fila do representante, sticky bars,
   tema claro forçado — ver specs em `openspec/specs/`).

## Restrições que o prompt embute (não relaxar sem motivo)

- **Admin**: desktop, sidebar recolhível, tema claro + escuro.
- **Representante**: mobile-first (~420px), **tema claro forçado**, sem navegação,
  header sticky + barra de ação sticky, toque ≥ 48px, estados de sync por campo.
- pt-BR em tudo; R$ (pt-BR); datas `dd/mm/aaaa hh:mm` (America/Sao_Paulo).
- Front não recalcula nada — preço unitário, vencedor e menor preço vêm da API.
- Stack alvo: React + TS, Tailwind v4, shadcn/ui, lucide-react, fonte Geist.

---

## Prompt

```
CONTEXTO
SimpleCote — sistema web de cotação de preços (RFQ) de um comprador de supermercado.
O comprador monta uma cotação com itens do catálogo, convida empresas fornecedoras,
cada empresa responde os preços pelo celular via link mágico (sem login), e o comprador
apura e gera pedidos.

Eu quero um DESIGN SYSTEM VISUAL aplicado a telas de referência — NÃO um app funcional.
Sem roteamento, sem backend, sem autenticação, sem biblioteca de estado. Um único
arquivo React + Tailwind autossuficiente, com dados fixos (mock) inline. Não invente
funcionalidades além das descritas abaixo.

STACK ALVO (pra o código sair fácil de adaptar aqui)
- React + TypeScript, Tailwind CSS v4, componentes no estilo shadcn/ui
- Ícones: lucide-react
- Fonte: Geist Variable (sans) para título e corpo
- Tudo em português do Brasil. Moeda R$ (pt-BR). Datas dd/mm/aaaa hh:mm.

TOKENS DE COR — use exatamente estes, não crie outros (oklch, tema claro)
- background / card: oklch(0.98 0.004 90)
- foreground: oklch(0.145 0 0)
- primary: oklch(0.42 0.09 155)  [verde]   primary-foreground: oklch(0.985 0 0)
- secondary / muted / accent: oklch(0.97 0 0)   muted-foreground: oklch(0.556 0 0)
- border / input: oklch(0.922 0 0)
- destructive: oklch(0.577 0.245 27.325)
- success: oklch(0.65 0.15 150)
- warning: oklch(0.75 0.15 70)
- raio base: 0.625rem
Entregue também a variante ESCURA equivalente, só para o painel admin
(a tela do representante é sempre clara).

DUAS SUPERFÍCIES, PROPOSITALMENTE DIFERENTES
1. PAINEL ADMIN — desktop, sidebar lateral recolhível à esquerda, densidade alta,
   tabelas, suporta tema claro e escuro.
2. REPRESENTANTE — mobile-first (largura máx. ~420px), TEMA CLARO FORÇADO, sem
   navegação, cabeçalho fixo no topo e barra de ação fixa embaixo, alvos de toque
   grandes (mín. 48px de altura em inputs e botões), pensado pra rede ruim
   (estados por campo: "salvando…", "✓ salvo", "sem conexão").

VOCABULÁRIO DE DOMÍNIO (use nos rótulos e badges)
- Cotação: RASCUNHO, ABERTA, ENCERRADA, PEDIDOS_GERADOS, CANCELADA
- Participante (empresa convidada): CONVIDADO, VISUALIZOU, RESPONDIDO
- Lance (preço de um item): PENDENTE, COTADO, NÃO COTADO
- Pedido: GERADO, ENVIADO, CONFIRMADO
- Campos de item: nome, unidade de medida, quantidade solicitada, quantidade por
  embalagem, código de barras, preço da embalagem, preço unitário (derivado)

TELAS DE REFERÊNCIA (mostre todas, no MESMO sistema visual)

A. LOGIN DO ADMIN
Centralizado, card único. Nome do produto, campo e-mail, campo senha, botão "Entrar"
de largura total, área de erro. Mostre o estado de erro ("E-mail ou senha inválidos").

B. LISTA DE COTAÇÕES (admin)
Cabeçalho "Cotações" + botão "Nova cotação". Filtro por status. Tabela: Título,
Status (badge), Prazo. Inclua os estados carregando, vazio e erro.

C. DETALHE DA COTAÇÃO (admin)
Cabeçalho: título + badge de status + prazo. Linha de botões que varia por status
(Abrir, Encerrar, Reabrir, Apurar, Cancelar, Acompanhar ao vivo, Ver resultado).
Seções empilhadas:
- Itens: lista com produto, unidade, quantidade; ações adicionar/remover quando RASCUNHO.
- Participantes: empresas com badge de status do convite; por linha, ações primárias
  "Enviar por WhatsApp" e "Enviar por e-mail", e um menu "Mais ações" com
  "Copiar link" e "Reenviar convite".
- Respostas: prévia da grade de respostas.

D. GRADE AO VIVO (admin) — a tela mais densa
Tabela: linhas = itens, colunas = empresas convidadas. Cada célula: status do lance
(COTADO / NÃO COTADO / PENDENTE), preço da embalagem e preço unitário. DESTAQUE o
menor preço unitário de cada linha. Cabeçalho da tela com contador "respondidos / total".
Ao passar o mouse num item, um popover de "última compra" (preço unitário, empresa
vencedora, data) — mostre um popover aberto.

E. RESPOSTA DA COTAÇÃO PELO REPRESENTANTE (mobile)
- Cabeçalho fixo: "Olá, {primeiro nome}!", linha "empresa · comprador", título da
  cotação, linha de Prazo (realce vermelho quando falta pouco).
- Lista de cards de item: nome, chip da unidade, quantidade, código de barras;
  toggle de duas opções "Vou cotar" / "Não cotado"; campo de preço grande com
  prefixo "R$"; rodapé do card com "unit. R$ x,xx" e o estado de sincronização.
- Barra fixa embaixo: progresso "Respondidos: N/T" + barra proporcional, e botão
  "Finalizar resposta" de largura total (desabilitado com "Sincronizando N preço(s)…"
  enquanto há pendência).
- Mostre também o estado somente-leitura (resposta já enviada) e o "Link inválido".

O QUE EU QUERO DE VOLTA
- As telas acima num só sistema visual coeso: uso de cor, escala de espaçamento,
  rampa tipográfica, estilo de card, estilo de tabela, estilo de badge/status,
  hierarquia de botão (primário / secundário / destrutivo / fantasma), estados de
  vazio / carregando / erro, e um vocabulário de movimento discreto (hover, entrada
  de popover/menu).
- Código React + Tailwind, um arquivo, dados mock inline, nomes de componente genéricos.
- Nada de react-router, fetch, auth ou libs de estado.
```
