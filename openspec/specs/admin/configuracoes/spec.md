# admin/configuracoes Specification

## Purpose
Tela onde o dono/administrador da loja configura a identidade e os dados básicos da loja (nome, cor de marca, telefone, layout de e-mail) usados em toda a aplicação, em vez de valores fixos no código.

## Requirements

### Requirement: Acesso às Configurações

O sistema SHALL exibir um item de menu identificado por um ícone de engrenagem na sidebar administrativa, levando à rota `/admin/configuracoes`.

#### Scenario: Acessar Configurações pela sidebar

- **WHEN** o admin clica no item de engrenagem na sidebar
- **THEN** o sistema navega para `/admin/configuracoes` e exibe o formulário de configuração da loja

### Requirement: Editar dados da loja

A tela de Configurações SHALL permitir editar nome da loja, cor de marca, telefone da loja, o layout de e-mail usado nas comunicações aos representantes e o tema do painel (`Claro`/`Escuro`), e SHALL persistir essas alterações via `PUT /api/configuracoes` (contrato real do backend; `linkColaboradorToken` NÃO é enviado no corpo — é somente leitura). A tela SHALL carregar os valores atuais de `GET /api/configuracoes`, indicar o estado de salvamento em andamento, e exibir a mensagem de erro do backend quando a gravação falhar. A tela SHALL também exibir, em modo somente leitura, a URL completa do link do colaborador, montada a partir do `linkColaboradorToken` retornado pelo `GET` (nunca um placeholder fixo), com um botão para copiá-la à área de transferência.

#### Scenario: Salvar alteração com sucesso

- **WHEN** o admin altera o nome da loja e confirma o salvamento
- **THEN** a alteração é persistida no backend e a tela reflete o novo valor (e sobrevive a um recarregamento)

#### Scenario: Falha ao salvar

- **WHEN** a API rejeita a alteração
- **THEN** a tela exibe a mensagem de erro do backend e mantém os valores anteriores visíveis

#### Scenario: Trocar o tema do painel

- **WHEN** o admin seleciona "Escuro" nas Configurações e salva
- **THEN** a alteração é persistida via API e o painel passa a exibir o tema escuro para todos os usuários dessa loja

#### Scenario: Copiar o link do colaborador

- **WHEN** o admin clica no botão de copiar ao lado do link do colaborador
- **THEN** a URL completa (`{origin}/colaborador/{linkColaboradorToken}`) é escrita na área de transferência, com retorno visual temporário de confirmação

#### Scenario: Link do colaborador vem da API

- **WHEN** o admin abre a tela de Configurações de uma loja com token real no backend
- **THEN** o link exibido usa o `linkColaboradorToken` retornado pelo `GET /api/configuracoes` — não um valor de exemplo embutido no front

#### Scenario: Sem preferência de destaque de menor preço no formulário

- **WHEN** o admin abre a tela de Configurações
- **THEN** não existe a opção "Destacar menor preço na grade ao vivo" no formulário (a grade mantém o destaque ligado por padrão, conforme o requirement da grade em `admin/cotacoes`)

### Requirement: Nome e cor da loja aplicados em toda a interface

O nome da loja configurado SHALL substituir qualquer identidade de marca fixa hoje embutida no código (tela de login, cabeçalho da sidebar). A cor de marca configurada SHALL ser aplicada como a cor primária (`--primary`) de toda a aplicação.

#### Scenario: Nome refletido no login e na sidebar

- **WHEN** o nome da loja está configurado como "Sara Supermercado"
- **THEN** a tela de login e o cabeçalho da sidebar exibem "Sara Supermercado" em vez de um nome fixo no código

#### Scenario: Cor refletida em toda a aplicação

- **WHEN** a cor de marca é alterada nas Configurações
- **THEN** botões, estados de foco e destaques em toda a aplicação passam a usar a nova cor

### Requirement: Escolher estilo de navegação

A tela de Configurações SHALL permitir escolher o estilo de navegação do painel entre `Lateral` (sidebar, padrão atual) e `Inferior` (barra fixa na parte de baixo da tela), persistindo a escolha via API. O estilo escolhido SHALL se aplicar em todas as rotas `/admin/**` para todos os usuários dessa loja (não é uma preferência por usuário).

#### Scenario: Trocar para estilo inferior

- **WHEN** o admin seleciona "Inferior" nas Configurações e salva
- **THEN** o painel passa a exibir a navegação como barra fixa na parte inferior da tela em todas as rotas

#### Scenario: Trocar de volta para lateral

- **WHEN** o admin seleciona "Lateral" nas Configurações e salva
- **THEN** o painel volta a exibir a sidebar lateral, com o comportamento de expandir/recolher já existente

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

### Requirement: Exportar dados da organização

A tela de Configurações SHALL oferecer, para `OWNER` e `ADMIN`, uma ação que baixa um arquivo com os dados do `Comprador` (cotações, produtos, empresas, representantes e resultados) em formato portável, chamando `GET /api/organizacao/exportacao`. A ação SHALL indicar o progresso, SHALL exibir a mensagem de erro do backend em caso de falha, e SHALL usar o mesmo mecanismo de download autenticado já usado nos relatórios.

#### Scenario: Baixar a exportação

- **WHEN** um `ADMIN` aciona "exportar dados da organização"
- **THEN** o navegador baixa o arquivo com os dados do `Comprador`, com indicação de progresso enquanto gera

#### Scenario: Falha na exportação

- **WHEN** o backend responde com erro
- **THEN** a tela mostra a mensagem do backend e nenhum arquivo é baixado

#### Scenario: OPERADOR não vê a exportação

- **WHEN** um `OPERADOR` abre a tela de Configurações
- **THEN** a ação de exportar dados da organização não é exibida

### Requirement: Encerrar a organização

A tela de Configurações SHALL oferecer, apenas para o `OWNER`, uma ação de encerrar a conta do `Comprador`. A ação SHALL exigir uma confirmação forte — digitar o nome do supermercado — e SHALL nomear a consequência (perda de acesso aos dados, purga posterior). Ao confirmar, SHALL chamar `DELETE /api/organizacao`; em sucesso, SHALL encerrar a sessão e levar a uma tela de "conta encerrada". SHALL exibir a mensagem de erro do backend em caso de recusa.

#### Scenario: Encerrar com confirmação forte

- **WHEN** o `OWNER` aciona "encerrar organização", digita o nome do supermercado corretamente e confirma
- **THEN** o front chama `DELETE /api/organizacao`, encerra a sessão e mostra a tela de "conta encerrada"

#### Scenario: Confirmação não confere

- **WHEN** o `OWNER` digita um nome que não corresponde ao do supermercado
- **THEN** o botão de encerrar permanece desabilitado e nada é enviado

#### Scenario: Ação restrita ao OWNER

- **WHEN** um `ADMIN` (não `OWNER`) abre a tela de Configurações
- **THEN** a ação de encerrar a organização não é exibida
