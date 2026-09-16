## Context

Ver `proposal.md` - Why. Duas restrições já resolvidas na exploração que originou esta change (ver histórico da conversa): o schema vem de uma URL do back em execução (não de um artefato estático publicado pelo back), e o uso é manual/opcional nesta primeira etapa (sem checagem no CI).

O `VITE_API_BASE_URL` do front frequentemente fica vazio em dev (`.env.development`) porque as chamadas passam pelo proxy do Vite — não dá para reaproveitar essa variável diretamente num script Node que roda fora do Vite, ela não resolve para uma URL absoluta.

## Goals / Non-Goals

**Goals:**
- Um comando único (`npm run gen:api-types`) que qualquer desenvolvedor roda localmente, apontando para um back acessível, e recebe um arquivo `.ts` com os tipos do schema OpenAPI atual.
- Saída isolada, gerada, versionada em git (commitada) — para ficar disponível a quem não rodou o comando, e para o diff do PR mostrar exatamente o que mudou no schema quando alguém decide regenerar.

**Non-Goals:**
- Não integra com o runtime da aplicação (nenhum hook ou componente passa a importar o arquivo gerado nesta change).
- Não valida ou força atualização em CI.
- Não migra nenhum tipo manual existente.
- Não gera client de requisições (só tipos) — o `api-client.ts` e os hooks `*.api.ts` continuam como estão.

## Decisions

### Ferramenta: `openapi-typescript`
Gera tipos TS puros (interfaces/types) a partir de um schema OpenAPI 3, sem gerar client de runtime. Alternativas consideradas:
- **orval / openapi-fetch**: geram client tipado completo. Rejeitado — o `api-client.ts` atual já resolve refresh de token, distinção 401/403 de bloqueio, `lookup` de 404, download de arquivo binário; um client gerado entraria em conflito com essa lógica de negócio ou exigiria reescrevê-la, o que é maior risco do que o problema (drift de tipos) justifica.
- **Escrever um script próprio de parsing do OpenAPI**: mais controle, mas reinventa uma ferramenta madura e amplamente usada só para economizar uma dependência de dev.

### Fonte do schema: variável de ambiente própria, não `VITE_API_BASE_URL`
Nova variável, ex. `API_TYPES_SOURCE_URL`, lida apenas pelo script Node (não pelo Vite/app), com default `http://localhost:8080` (mesma porta padrão documentada em `.env.example` para o back local). Evita o problema de `VITE_API_BASE_URL` vazio (proxy do Vite) e deixa explícito que é uma URL absoluta, só para geração.

### Caminho e formato do arquivo gerado
`src/shared/api/generated/openapi-types.ts`, dentro de `shared/api` (mesma pasta do `api-client.ts`, mantendo a camada de API concentrada), num subdiretório `generated/` para deixar o isolamento óbvio no filesystem e permitir, no futuro, excluir a pasta inteira de regras de lint que não fazem sentido para código gerado. Cabeçalho no topo do arquivo (comentário) identificando geração automática, comando para regenerar e data/URL de origem.

### Commitado em git, não gitignored
Fica disponível para qualquer dev ou CI que só rode `npm run build`/`test`, sem precisar ter o back no ar. O trade-off é um arquivo grande no diff quando alguém regenera — aceitável dado que é gerado (revisão de PR foca no que mudou no schema, não no arquivo linha a linha).

## Risks / Trade-offs

- **[Risco] Arquivo gerado fica desatualizado silenciosamente** (ninguém lembra de rodar o comando) → Mitigação: aceito nesta primeira etapa (ver proposal.md - Impact, CI fora de escopo). Fica registrado como candidato natural de change futura, uma vez que o uso do arquivo gerado pegue tração.
- **[Risco] Schema do back expõe DTOs internos não pensados para consumo externo** (ex.: campos administrativos) → Mitigação: geração é só de tipos (compile-time), não expõe nada em runtime; revisão de PR de quem primeiro consumir um tipo gerado numa tela específica é o ponto natural para notar isso.
- **[Trade-off] Depender do back local rodando para regenerar** → aceito conforme decisão já tomada (fonte via URL, não artefato estático); documentado no `README` do comando.

## Open Questions

(nenhuma — as duas decisões que dependiam de alinhamento com o usuário já foram resolvidas acima.)
