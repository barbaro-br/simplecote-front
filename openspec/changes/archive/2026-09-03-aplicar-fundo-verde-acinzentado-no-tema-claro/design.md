## Context

`src/index.css` declara os tokens de tema claro em dois blocos que hoje têm
os mesmos valores para `--background`/`--card`/`--border`/`--input`:
`:root` (tema claro padrão do painel admin) e `.tema-claro` (classe aplicada
na tela pública do representante para forçar tema claro independente do
sistema/`.dark` de um ancestral — comentário no próprio CSS diz
"Redeclara os tokens claros (iguais aos de `:root`) na própria subárvore").
`--primary` é `oklch(0.42 0.09 155)` (verde-teal) em ambos os blocos e no
`.dark` — não muda.

## Goals / Non-Goals

**Goals:**
- Fundo do tema claro deixa de ser acromático, ganhando a mesma família de
  matiz do `--primary`, igual à Opção C aprovada na comparação visual.
- `:root` e `.tema-claro` continuam com os mesmos valores entre si (mantém
  a garantia já documentada no CSS).

**Non-Goals:**
- Não muda `--muted`, `--secondary`, `--accent`, `--sidebar*` nem nenhum
  token do tema escuro — só o que foi efetivamente comparado e aprovado.
- Não introduz um novo mecanismo de theming — só troca valores dentro da
  estrutura de tokens já existente.

## Decisions

- **Valores exatos** (mesmos da Opção C na comparação visual):
  - `--background: oklch(0.965 0.008 165)`
  - `--card: oklch(0.995 0.004 165)` (levemente mais claro que o fundo da
    página, para os cartões continuarem se destacando sutilmente contra o
    fundo — mesmo princípio que já existe hoje, só que agora os dois têm a
    mesma temperatura de cor em vez de serem idênticos)
  - `--border: oklch(0.90 0.01 165)`
  - `--input: oklch(0.90 0.01 165)` (mantém paridade com `--border`, como
    já é hoje)
- **Replicar em `:root` e `.tema-claro`**, não só um dos dois — evita os
  dois temas claros do produto (painel admin e tela pública do
  representante) divergirem visualmente sem necessidade.

## Risks / Trade-offs

- [Risco] Qualquer lugar do código que usa uma cor **fixa** (não-token) que
  dependia visualmente de casar com o branco antigo pode destoar levemente
  — mitigado por já não dever existir cor fixa desse tipo (requirement
  "Cores de estado sempre por token semântico" do `shared/design-system` já
  proíbe cor de paleta fixa); qualquer ocorrência encontrada durante a
  verificação visual deve ser corrigida à parte, não silenciosamente
  ignorada.
