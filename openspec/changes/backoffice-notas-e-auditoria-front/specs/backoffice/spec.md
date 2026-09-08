## ADDED Requirements

### Requirement: Notas e histórico no detalhe da loja

O detalhe de uma loja no backoffice SHALL ter uma seção "Notas e histórico". A parte de notas SHALL permitir escrever uma nota nova (`POST /api/admin/compradores/{id}/notas`), listar as notas existentes (autor, data, texto) e remover uma nota com uma confirmação inline (`DELETE .../notas/{notaId}`) — sem usar `window.confirm`. A parte de histórico SHALL mostrar a linha do tempo de `GET /api/admin/compradores/{id}/timeline` como uma lista vertical, cada item com rótulo/ícone do tipo, data relativa, ator e descrição, do mais recente para o mais antigo.

#### Scenario: Adicionar uma nota

- **WHEN** o operador escreve um texto e clica em "Adicionar nota"
- **THEN** o front chama `POST /api/admin/compradores/{id}/notas` e a nota passa a aparecer na lista

#### Scenario: Remover uma nota

- **WHEN** o operador confirma a remoção de uma nota
- **THEN** o front chama `DELETE /api/admin/compradores/{id}/notas/{notaId}` e a nota some da lista

#### Scenario: Linha do tempo

- **WHEN** o detalhe carrega a timeline
- **THEN** os itens aparecem em ordem cronológica decrescente, cada um com o tipo (cadastro, verificação, suporte, suspensão, reativação, prazo, exclusão, nota), a data, o ator e a descrição
