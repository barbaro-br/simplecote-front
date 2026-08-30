## 1. Atualização do Mapeamento de Dados

- [x] 1.1 Em `src/admin/cotacoes/RepresentantesModal.tsx`, no `useMemo` de `lista`, extrair `email` e `whatsapp` da variável `rep` para o objeto retornado e verificar se o build continua passando sem erros de TypeScript.

## 2. Atualização da Interface Visual

- [x] 2.1 Em `RepresentantesModal.tsx`, importar os ícones `Mail` e `Phone` (ou `MessageCircle`) do `lucide-react`.
- [x] 2.2 Na renderização de cada item da lista (dentro do `filtrados.map`), adicionar a exibição dos ícones (ex: em uma nova `div` alinhada à direita usando flexbox/gap) condicionalmente, com base nos campos `email` e `whatsapp` recém-mapeados.
- [x] 2.3 Verificar se os ícones aparecem (com tamanho/cor adequados) quando a cotação está em rascunho (`!isAberta`) e se a seleção visual não é prejudicada.
