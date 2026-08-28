## Context

Conforme detalhado no `proposal.md`, precisamos ajustar o frontend para orquestrar o fluxo de cadastro da Empresa e do seu Representante, que na API do backend são entidades separadas. Além disso, precisamos reusar os formulários para edição (Produtos e Empresas) e implementar a integração de GTIN nos produtos.

## Goals / Non-Goals

**Goals:**
- Prover uma experiência única de submissão no form de Empresas, blindando o usuário do fato de que são 2 recursos REST distintos.
- Evoluir os formulários atuais para suportarem criação e edição sem duplicação de código.
- Implementar o preenchimento automático do nome do produto pelo GTIN.

**Non-Goals:**
- Mudar a API do backend para unificar Empresa e Representante (já está definido como entidades separadas no backend).
- Lidar com múltiplos representantes (apenas o principal primário será cadastrado no fluxo).

## Decisions

### 1. Orquestração no Frontend (Empresa + Representante)
**Rationale:** O backend requer `POST /api/empresas` e `POST /api/representantes`.
**Abordagem:** Criar um hook customizado ou orquestrar no evento `onSubmit` do `EmpresaForm`. A mutação de Empresa será feita e, com sucesso, o `id` retornado será usado no payload para criar o Representante.
**Alternatives:** Se a segunda etapa (Representante) falhar, a Empresa ficará "órfã" temporariamente. Como o usuário pode inativá-la ou editá-la depois, vamos exibir um erro ("Empresa criada, mas erro ao salvar o representante") para o usuário poder tentar novamente.

### 2. Formulários Multiuso (Criar/Editar)
**Rationale:** `ProdutoForm` e `EmpresaForm` precisarão suportar Edição.
**Abordagem:** Adicionar props opcionais `produtoParaEditar?: Produto` e `empresaParaEditar?: Empresa` (junto com dados do representante atual, se possível, embora o endpoint de listar empresas não retorne representante). Wait, o backend não retorna os dados do Representante na rota `/api/empresas`! Para edição, o backend apenas permite editar o Nome da Empresa (`PUT /api/empresas/{id}`). Portanto, a edição da Empresa *só afetará o Nome*. O Representante não poderá ser editado nesta tela (a menos que criemos uma rota para buscar representantes da empresa, mas isso foge do escopo atual do backend que só tem `PUT /api/representantes/{id}`).
**Decisão revisada:** A edição de Empresa será restrita ao `nome` (exatamente como o backend permite). Os dados de Representante só serão exigidos na criação.

### 3. Busca de Produto por GTIN
**Abordagem:** O `ProdutoForm` terá um hook `useLookupProduto(gtin)` acionado manualmente por um botão, igual tentamos no CNPJ. Se encontrar, atualiza o `nome` no React Hook Form usando `setValue`.

## Risks / Trade-offs

- [Risk] Falha na criação do Representante (ex: erro de rede) após a Empresa já ter sido criada no backend.
  → **Mitigation**: Exibir uma notificação clara, permitindo inativar a empresa órfã ou tentar de novo caso o backend suporte idempotência no nome (spoiler: não suporta duplicidade de nomes dependendo do BD, mas podemos instruir o usuário).
- [Risk] O endpoint `/api/empresas` não traz os dados do Representante.
  → **Mitigation**: Limitar a edição de Empresa no grid de Empresas apenas ao Nome da Empresa, conforme a API `PUT /api/empresas/{id}` permite. A edição de Representante será feita futuramente em uma aba ou tela própria, se a API evoluir para suportar.
