## System Architecture

N/A - Não há mudanças na arquitetura do sistema, são apenas refinamentos pontuais de UI.

## Data Model

N/A - O modelo de dados permanece o mesmo. A formatação de unidades afeta apenas a camada de apresentação.

## API Contracts

N/A - Os contratos de API estão inalterados.

## Component Design

- `ItemLanceCard.tsx`: Receberá um dicionário local `UNIT_ABBR = { Fardo: 'fd', Caixa: 'cx', Cartela: 'crt', Unidade: 'un' }`. O método de renderização da string `unitario` (ou na linha compacta) verificará se a unidade é "Unidade" para omitir a repetição de `com X un`.
- `TutorialOnboarding.tsx`: O objeto `STEPS`, na etapa final (onde `conteudo === 'fim'`), terá a string `desc` alterada para incluir "...e toque em Finalizar para enviar sua resposta oficialmente ao sistema."

## Security & Privacy

N/A - Sem impacto em segurança ou privacidade.
