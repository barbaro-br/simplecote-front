## Why

Ao selecionar representantes para uma cotação (na tela "Convidar Representantes"), os usuários não conseguem ver facilmente quais métodos de contato estão disponíveis para cada um. Adicionar ícones de e-mail e WhatsApp nesta tela permitirá que o usuário identifique rapidamente se o representante possui esses dados cadastrados, melhorando a previsibilidade da comunicação antes mesmo de abrir a cotação.

## What Changes

- Mapear as informações de `email` e `whatsapp` dos representantes na listagem do modal de convite.
- Exibir um ícone de E-mail (ex: do pacote `lucide-react`) ao lado do nome/empresa do representante caso ele possua um e-mail cadastrado.
- Exibir um ícone de WhatsApp ao lado do nome/empresa do representante caso ele possua um número de WhatsApp cadastrado.
- Os ícones servirão como indicadores visuais (apresentados com cores sutis ou em tamanho reduzido) para não poluir a interface, indicando a disponibilidade do canal de contato.

## Capabilities

### New Capabilities
- `cotacoes/representative-contact-indicators`: Indicadores visuais de canais de contato (e-mail e WhatsApp) na seleção de representantes para uma cotação.

### Modified Capabilities


## Impact

- **UI/Componentes**: O componente `RepresentantesModal` (`src/admin/cotacoes/RepresentantesModal.tsx`) será atualizado para exibir os novos ícones.
- Não há impacto em APIs do backend, pois os dados de `email` e `whatsapp` já são retornados no endpoint de listagem de representantes.
