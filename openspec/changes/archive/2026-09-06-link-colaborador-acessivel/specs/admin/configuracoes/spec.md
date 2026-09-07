## ADDED Requirements

### Requirement: Acesso ao link do colaborador fora de Configurações

O link permanente do colaborador SHALL ter um ponto de acesso visível fora da tela de Configurações — um card no Dashboard — mostrando o link como URL absoluta (`origin + /colaborador/{token}`), com: um botão de **copiar** (`navigator.clipboard`) que confirma por toast; um campo de e-mail e um botão de **enviar por e-mail** que chama `POST /api/configuracoes/colaborador/enviar-link` e confirma/erra por toast (erro via `ApiError.message`); e uma frase curta explicando que qualquer pessoa com o link pode adicionar itens às cotações abertas. O botão de enviar SHALL ficar desabilitado com e-mail vazio ou inválido. O link SHALL continuar acessível de algum lugar (o card substitui ou complementa o que existia em Configurações).

#### Scenario: Copiar o link

- **WHEN** o usuário clica em "Copiar" no card do link do colaborador
- **THEN** a URL absoluta do link vai para a área de transferência e um toast confirma

#### Scenario: Enviar o link por e-mail

- **WHEN** o usuário informa um e-mail válido e clica em "Enviar por e-mail"
- **THEN** o front chama `POST /api/configuracoes/colaborador/enviar-link` com esse e-mail e confirma por toast

#### Scenario: E-mail inválido não envia

- **WHEN** o campo de e-mail está vazio ou com formato inválido
- **THEN** o botão de enviar fica desabilitado e nenhuma chamada é feita

#### Scenario: Falha no envio

- **WHEN** a API retorna erro ao enviar o link
- **THEN** o front mostra `ApiError.message` e o card continua utilizável
