## Why

O visual das "telas" recriadas no deck da landing (`src/site/tech/telas/*` —
Grade ao vivo, Representantes, Empresas, Resultado) agradou muito: superfície
navy escura, acento verde-menta, linhas de lista limpas, selos de status,
tabela com o vencedor destacado. O fundador quer **o sistema inteiro nessa
pegada** — não só repintar, mas repensar telas e fluxos onde ficar mais
simples, mantendo o que o produto precisa fazer.

Hoje o app (`/admin`, `/representante`, `/colaborador`, `/backoffice`) usa o
tema claro padrão (shadcn-like). São ~29 páginas / ~197 componentes. Uma
reescrita de uma vez seria arriscada e deixaria o app quebrado por semanas.

## What Changes

- **Design system escuro** (`src/shared/ui/`): tokens de cor/tipografia/raio
  num escopo `data-painel="dark"` + primitivos extraídos das telas do deck —
  `Superficie`, `SecaoCabecalho`, `LinhaLista`, `Selo` (status), `GradeDados`
  (tabela), `CampoEstat`, `RodapeAcao`, `ChipsFiltro`. É a fonte única do
  visual novo; `src/shared/components/ui/*` continua existindo até a migração
  terminar.
- **Casca do app** repaginada: rail lateral fino (ícone + rótulo) no desktop,
  barra inferior no mobile, ambas em `brand-navy-deep`; cabeçalho de página =
  título + ação primária. Sem cursor custom / smooth-scroll / 3D do site (isso
  fica só em `/`).
- **Migração por fases**, tela por tela, mantendo o app navegável e os testes
  verdes a cada fase (ver `tasks.md`). Ordem: flows por token (representante,
  colaborador) → casca + cotações → catálogo (produtos, empresas,
  representantes, usuários) → conta (organização, configurações, análise,
  onboarding, ajuda) → backoffice → telas de auth.
- **Simplificações de fluxo** (detalhe em `design.md`), sem mudar o back:
  - **Cotação vira uma superfície só**, igual em todo estado. Monta-se inline
    (campo de busca de item dentro da própria grade; convite de fornecedor por
    chip-input) e um único botão primário que troca de rótulo por estado
    (Abrir → Encerrar → Apurar → Gerar pedidos). Fim do wizard e dos modais de
    montagem.
  - **Tela do representante** = a mesma `GradeDados` com uma coluna editável e
    um rodapé fixo "Enviar respostas".
  - **Resultado / pedidos** = a `GradeDados` no modo leitura + `RodapeAcao`.

## Non-goals

- Nenhuma mudança de back-end, endpoint, entidade, tabela ou contrato de API.
  Os endpoints do fluxo simplificado (`/abrir`, `/encerrar`, `/apurar`,
  `/itens`, `/participantes`) já existem.
- Sem mudança de autenticação, roteamento de alto nível ou i18n.
- Não migrar o site institucional (`/`, `/precos`, `/ajuda`) — ele já tem a
  identidade e um design próprio (deck stories).
- Não é um rebrand: as cores da marca (`--brand-*`) continuam as mesmas.

## Impact

- **Novo**: `src/shared/ui/` (tokens + ~10 primitivos + testes), `src/shared/ui/tema-painel.css` (ou bloco em `index.css`).
- **Reescrito por fase**: `src/admin/layout/*`, `src/representante/*`, `src/colaborador/*`, `src/admin/cotacoes/*`, `src/admin/produtos/*`, `src/admin/empresas/*`, `src/admin/representantes/*`, `src/admin/usuarios/*`, `src/admin/organizacao/*`, `src/admin/configuracoes/*`, `src/admin/analise/*`, `src/admin/onboarding/*`, `src/admin/ajuda/*`, `src/backoffice/*`, telas de auth em `src/admin/*` (login, cadastro, recuperar-senha).
- **Testes**: RTL revisado tela a tela conforme a marcação muda (roles/labels que importam preservados). Novo: testes dos primitivos de `src/shared/ui/` e um teste de contraste/reduced-motion do tema.
- **`index.css`**: escopo `[data-painel="dark"]` com a escala de cores sobre navy; nada removido do tema claro até a última fase.
- **`package.json`**: sem dependência nova esperada (usa o que já tem — phosphor icons, motion opcional).
- **Riscos**: superfície gigante; disciplina de contraste (corpo de texto ≥ `white/70` sobre navy — `white/45` só em rótulos curtos); manter o app shippável a cada merge de fase; não deixar motion/efeito do site vazar pro app.
