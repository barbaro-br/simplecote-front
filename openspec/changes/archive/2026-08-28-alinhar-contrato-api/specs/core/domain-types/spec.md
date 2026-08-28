## ADDED Requirements

### Requirement: Union types de status espelham os enums do backend
Os `status` de Cotação, Participante, Lance e Pedido chegam da API como string. O front SHALL definir, para cada um, um union type de string literal que corresponde **exatamente** ao conjunto de valores do enum equivalente do backend (`simplecote-back/spec.md` §9 e os enums Java correspondentes) — mesmos nomes, mesma cardinalidade, sem valor a mais nem a menos. Nenhum desses campos SHALL ser tipado como `string` solto. Em particular:

- `StatusCotacao` cobre `RASCUNHO`, `ABERTA`, `ENCERRADA`, `PEDIDOS_GERADOS`, `CANCELADA`;
- o status de Pedido cobre `GERADO`, `ENVIADO`, `CONFIRMADO`.

#### Scenario: StatusCotacao completo e sem valor inexistente
- **WHEN** uma tela ramifica o comportamento pelo status de uma Cotação
- **THEN** os cinco estados do backend (`RASCUNHO`, `ABERTA`, `ENCERRADA`, `PEDIDOS_GERADOS`, `CANCELADA`) são reconhecidos, e um valor fora desse conjunto (ex.: `APURADA`) é rejeitado em tempo de compilação

#### Scenario: Status recebido da API é atribuível ao union type
- **WHEN** a API devolve um objeto com `status: "PEDIDOS_GERADOS"`
- **THEN** o valor é atribuível ao tipo `StatusCotacao` sem cast, e o compilador cobre um `switch`/`if` exaustivo sobre ele
