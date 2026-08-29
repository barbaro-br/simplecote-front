## Context

Ver `proposal.md`. Estado:

- `EmpresasPage`/`ProdutosPage`: tabela simples, coluna de ação com `<Button>Inativar</Button>` só quando `ativo`. `useEmpresas`/`useProdutos` chamam `GET` sem params (só ativos).
- `empresas.api.ts`/`produtos.api.ts`: `useInativar*` (`POST /{id}/inativar`). Sem `useAtivar*`.
- Back (`reativar-empresa-e-produto`): `POST /{id}/ativar` e `GET ...?incluirInativos=true` passam a existir.
- `lucide-react` é dependência. Não há primitivo de tooltip.

## Goals / Non-Goals

**Goals:**
- Ver inativos, reativá-los, e uma coluna de ação que reflete o estado.
- Ações compactas (ícone) com significado no hover (tooltip) e clareza de qual linha.

**Non-Goals:**
- Filtro "só ativos / só inativos / todos" — a lista mostra todos, inativos apagados. (Um filtro pode vir com `shell-e-tema`/badges depois.)
- Confirmação modal pra inativar/ativar — é reversível, um clique basta (diferente de apurar/cancelar cotação).
- Tooltip com biblioteca — ver Decisão 3.

## Decisions

### 1. `incluirInativos=true` sempre nessas duas telas
`useEmpresas`/`useProdutos` passam `{ lookup: false }`… não — passam o param: `api.get('/api/empresas?incluirInativos=true')`. A `queryKey` ganha o flag pra não colidir com outros consumidores (ex.: o seletor de Empresa no convite da cotação, que quer só ativas). Linha inativa: `className={ativo ? '' : 'opacity-50'}` + texto `text-muted-foreground`.

### 2. Coluna de ação única, por estado
```
{empresa.ativo
  ? <IconButton icon={EyeOff} label="Inativar" onClick={() => inativar.mutate(id)} />
  : <IconButton icon={Eye}    label="Ativar"   onClick={() => ativar.mutate(id)} />}
{<IconButton icon={Pencil} label="Editar" onClick={...} />}
```
`useAtivarEmpresa`/`useAtivarProduto`: `useMutation` `POST /{id}/ativar`, `onSuccess` invalida a mesma `queryKey`.

### 3. Tooltip: `title` nativo + hover na linha via CSS — sem lib
`IconButton` = `<button title={label} aria-label={label}>`. O `title` nativo já dá a dica no hover pausado (o comportamento que o usuário pediu: "se ficar mais um pouco em cima aparece o nome"). Hover da linha: `group` no `<tr>` + `group-hover:bg-muted/40` (paleta de `shell-e-tema`). Se depois quiser tooltip estilizado, um `src/shared/components/ui/tooltip.tsx` mínimo entra sem mexer nos call-sites.

- Alternativa (Radix/base-ui Tooltip agora): dependência e complexidade pra um `title` que já resolve. Adiar.

### 4. `IconButton` reutilizável
`src/shared/components/ui/icon-button.tsx` — `<button>` quadrado, ícone lucide, `title`+`aria-label`, `disabled` durante a mutation, hover/focus visíveis. Usado nas duas telas.

## Risks / Trade-offs

- **`queryKey` compartilhada** — se algo mais usa `['empresas']`/`['produtos']` esperando só ativos, mudar a key aqui pra `['empresas', { incluirInativos: true }]` e deixar a antiga pros outros. Mapear os consumidores no apply (`grep useEmpresas`/`useProdutos`).
- **`title` nativo é lento/discreto** — atende o pedido literal ("fica um pouco em cima e aparece"); se o cliente achar pouco, troca por tooltip estilizado depois (não-bloqueante).
- **Depende do back** — sem `reativar-empresa-e-produto` aplicada, `POST /{id}/ativar` dá 404 e `?incluirInativos` é ignorado. Não aplicar esta antes daquela.
- **Ícone `EyeOff`/`Eye` pra inativar/ativar** — o usuário sugeriu "olho". Alternativa semântica: `Archive`/`ArchiveRestore`. Decidir no apply; o `label` é o que importa pra clareza.
