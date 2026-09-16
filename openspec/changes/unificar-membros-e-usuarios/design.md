## Context

Ver `proposal.md` - Why. Estado atual do código (lido em `src/admin/organizacao/` e `src/admin/usuarios/`):

- `MembrosPage.tsx` já é a tela mais completa: lista com filtros (Todos/Ativos/Pendentes/Inativos), busca, convite por e-mail (`ConvidarMembroDialog`), reenviar/revogar convite, inativar. Usa `Membro` (`organizacao.schema.ts`): `{ id, nome: string | null, email, papel, status }`, onde `status` é `ATIVO | INATIVO | CONVITE_PENDENTE`.
- `UsuariosPage.tsx` tem criar-com-senha (`UsuarioForm.tsx`, reaproveitado também pra editar), redefinir senha (`RedefinirSenhaForm.tsx`) e inativar. Usa `Usuario` (`usuarios.schema.ts`): `{ id, nome: string, email, papel, ativo: boolean }`.
- Ponto crítico: `Membro.id` **não é uniformemente um id de `Usuario`**. Para `status: 'CONVITE_PENDENTE'`, `id` é o id do `ConviteMembro` (back: `OrganizacaoService` monta a lista concatenando `usuarioRepository.findByCompradorId(...)` com convites pendentes). `PUT /api/usuarios/{id}` e `POST /api/usuarios/{id}/senha` só existem para `Usuario` — chamá-los com o id de um convite pendente falharia (404) ou, pior, poderia acertar por acaso outro `Usuario`. As novas ações (editar, trocar senha) SHALL só aparecer para `status !== 'CONVITE_PENDENTE'` (já expresso nas specs).

## Goals / Non-Goals

**Goals:**
- Uma tela só em `/admin/membros`, com paridade total de ações das duas telas atuais.
- Zero mudança de contrato com o back — reuso de `usuarios.api.ts` e `organizacao.api.ts` como estão.
- Preservar o visual/padrão de tabela já usado em `MembrosPage.tsx` (dark navy, filtros como chips, mesma estrutura de colunas).

**Non-Goals:**
- Não muda o fluxo de convite em si, nem adiciona reativação de usuário inativo (o back não expõe essa operação — mantém a restrição herdada de `admin/usuarios`).
- Não introduz um terceiro modo de criação além de "convidar" e "criar com senha".
- Não resolve outras áreas sensíveis por papel (`cobrança`) — fora de escopo.

## Decisions

### Página base: `MembrosPage.tsx` absorve as ações de `UsuariosPage.tsx`
`MembrosPage.tsx` já tem a superfície de dados certa (`Membro`, com status incluindo convite). Migrar `UsuarioForm.tsx` e `RedefinirSenhaForm.tsx` de `src/admin/usuarios/` para `src/admin/organizacao/`, adaptando as props que hoje recebem `Usuario` para aceitar o subconjunto relevante de `Membro` (`{ id, nome, email, papel }`, sempre com `status !== 'CONVITE_PENDENTE'` garantido por quem abre o modal). `usuarios.api.ts` (mutations de criar/editar/senha) migra para `organizacao.api.ts` ou para um arquivo `usuarios-membro.api.ts` dentro de `src/admin/organizacao/` — mantendo as chamadas HTTP exatamente como estão (`/api/usuarios/**`), só mudando onde o hook mora no front.

Alternativa considerada: manter os arquivos em `src/admin/usuarios/` e só importar de `organizacao`. Rejeitada — deixaria a pasta "usuarios" viva sem uma tela própria, confuso para quem navega o código depois.

### Modal único de "Adicionar membro" com duas abas/modos
O botão hoje chamado "Convidar membro" abre um modal com **duas opções apresentadas juntas** (ex.: abas "Convidar por e-mail" / "Criar com senha"), em vez de dois botões separados no cabeçalho — evita poluir a barra de ações com um segundo botão de mesmo peso visual para uma ação que é, do ponto de vista do usuário, "adicionar alguém". `ConvidarMembroDialog.tsx` vira a primeira aba; o conteúdo adaptado de `UsuarioForm.tsx` (modo criar) vira a segunda.

### Ações de linha condicionadas por status
Coluna "Ações" da tabela ganha, para `status === 'ATIVO'` ou `'INATIVO'`: editar (lápis) e redefinir senha (chave) — os mesmos ícones/posições já usados em `UsuariosPage.tsx` — ao lado do botão de inativar já existente (só pra `ATIVO`, como hoje). Para `CONVITE_PENDENTE`, seguem só reenviar/revogar, como hoje.

### Rota legada: redirect declarativo no router
`/admin/usuarios` vira um `<Navigate to="/admin/membros" replace />` (ou equivalente) na configuração de rotas do admin, dentro da área autenticada — sem tela própria, sem round-trip a mais.

## Risks / Trade-offs

- **[Risco] Confundir editar/senha de um `Usuario` com o id de um convite** (ver Context) → Mitigação: os botões de editar/senha SHALL só renderizar para linhas com `status !== 'CONVITE_PENDENTE'`; coberto por scenario dedicado na spec.
- **[Trade-off] Modal de "adicionar" fica mais denso** (duas abas em vez de um formulário único) → aceito: é o preço de duas formas de criação legítimas coexistindo; nomear as abas com clareza ("Convidar por e-mail" como padrão/primeira aba) reduz a fricção.
- **[Risco] Alguém com `/admin/usuarios` salvo em favoritos ou em um link compartilhado antigo** → Mitigação: redirect cobre isso (Requirement "Redirecionamento da rota legada").
