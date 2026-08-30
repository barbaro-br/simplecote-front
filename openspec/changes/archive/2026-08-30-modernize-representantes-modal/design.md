## Context

O usuário forneceu um código gerado pelo Figma detalhando um layout complexo para a tela de convite de representantes. Precisamos modernizar o `RepresentantesModal.tsx` real baseado nesse protótipo.

## Goals / Non-Goals

**Goals:**
- Reproduzir o layout do Figma de forma fiel usando Tailwind CSS e as convenções atuais (e.g. `Dialog` do `@base-ui`).
- Migrar os ícones SVGs hardcoded para componentes equivalentes ou idênticos do pacote `lucide-react`.
- Reutilizar os hooks já existentes (`useEmpresas`, `useRepresentantes`, `useParticipantes`).

**Non-Goals:**
- Alterar o estado global de participantes fora do contexto do modal.
- Criar dados falsos (mock). Toda a lista virá da API.
- Replicar o campo `cidade` do Figma, pois a API não retorna essa informação.

## Decisions

1. **Uso de Tailwind v4**: O código do Figma utiliza CSS inline pesado (`style={{...}}`). A implementação irá traduzir todas as propriedades de estilo para Tailwind classes (e.g., `flex`, `items-center`, `gap-3`, `text-sm`, `text-muted-foreground`), garantindo aderência ao UI Kit (como cores de primary e gray).
2. **Componentes da UI**: Manter a dependência do `<Dialog>` (Shadcn/Base UI) existente em `RepresentantesModal.tsx` para o invólucro do modal, aplicando apenas as customizações internas no seu children.
3. **Gerenciamento de Estado Local**: Utilizar `useState` para `search` (string) e `filter` ('todos' | 'enviado' | 'nao_enviado'). Os cálculos de filtro e exibição serão agrupados no `useMemo` (`filtrados` e contadores do rodapé).

## Risks / Trade-offs

- **Performance do filtro no front-end**: Filtrar e buscar localmente em arrays pode pesar se houver muitas empresas. Como o modal já paginava tudo sem quebrar, o impacto local do `search` é aceitável, mas fica de aviso se a volumetria crescer.
