## Why

Na tela pública do representante (`/cotacao/:token`), quando o representante preenche o preço de dois ou mais itens em sequência rápida (um logo após o outro), o preço unitário (P.UN) do primeiro item às vezes fica travado exibindo "—" mesmo depois do item ser salvo com sucesso — o valor certo só aparece depois de um F5. O dado já está correto no backend; é só a UI que não aplica a resposta da requisição em `enviando`/`sincronizado` quando duas sincronizações de itens diferentes terminam próximas uma da outra. Isso pode fazer o representante achar que o preço não foi calculado/salvo.

## What Changes

- Corrigir a aplicação do `precoUnitario` (e demais campos derivados da resposta de sincronização) ao estado local de cada item, garantindo que a resposta de uma requisição de autosave sempre atualize a célula correspondente àquele item, independentemente de outra sincronização de um item diferente ter terminado em paralelo.
- Não há mudança de contrato de API nem de comportamento de negócio — é uma correção de como o estado local já existente (máquina de estados de sincronização por item) processa respostas concorrentes.

## Capabilities

### Modified Capabilities
- `representante/cotacao`: reforça que a atualização do preço unitário após sincronizar continua correta quando há sincronizações concorrentes de itens diferentes.

## Impact

- Componente(s) de estado/sincronização da tela `/cotacao/:token` no front (fila de sincronização por item, aplicação da resposta ao estado local).
- Nenhuma mudança de API/backend.
