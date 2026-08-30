## Why

Para otimizar o espaço visual do Modal de Representantes (quando a Cotação está Aberta) e melhorar a eficiência do fluxo de compartilhamento. Ícones em vez de textos deixam a lista mais limpa, e a remoção da barra de busca simplifica a interface para casos onde a lista de convidados é pequena. Além disso, a adição de uma ação em lote para "Disparar Todos por E-mail" prepara o terreno para a futura integração com o provedor de e-mails (Brevo).

## What Changes

- Excluir completamente a barra de busca e seu gerenciamento de estado de todo o modal (não é necessária em nenhum estado).
- Adicionar e formatar os botões de compartilhamento (WhatsApp, E-mail e Copiar Link) como ícones diretamente na listagem de cada representante.
- Adicionar um botão de ação global "Disparar para Todos (E-mail)" no rodapé ou cabeçalho do Modal, que inicialmente fará apenas um mock/toast enquanto a infraestrutura do Brevo é definida.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `admin/cotacoes`: Modifica o requisito de "Convidar Empresas e Gerenciar Links" para incluir a ação em lote de e-mail e os atalhos iconográficos, removendo a necessidade de filtro/busca.

## Impact

- `src/admin/cotacoes/RepresentantesModal.tsx` sofrerá refatoração estrutural (troca de botões, remoção de estado da busca).
