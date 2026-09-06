## ADDED Requirements

### Requirement: Wizard opcional para criar uma Cotação

Depois de criar uma Cotação (título), o sistema SHALL oferecer um wizard de 3 passos — **Itens**, **Representantes**, **Prazo & revisar** — que guia o admin até "Abrir". Cada passo SHALL permitir voltar sem perder o que já foi feito. O passo 3 SHALL mostrar um resumo (quantidade de itens, de empresas e o prazo formatado) antes da confirmação. "Abrir" SHALL ficar habilitado apenas com ao menos um item e ao menos uma empresa selecionada. O sistema SHALL oferecer um atalho para pular o wizard e montar a Cotação direto na tela de detalhe (fluxo atual). O wizard SHALL usar os endpoints já existentes (criar, adicionar item, convidar empresas, abrir), sem contrato novo.

#### Scenario: Percorrer o wizard até abrir

- **WHEN** o admin cria uma Cotação e percorre os 3 passos adicionando itens, selecionando empresas e escolhendo o prazo, e confirma "Abrir"
- **THEN** os itens são adicionados, as empresas convidadas e a Cotação é aberta, e o admin vai para a tela de detalhe

#### Scenario: "Abrir" exige item e empresa

- **WHEN** o admin chega ao passo 3 sem nenhum item, ou sem nenhuma empresa selecionada
- **THEN** o botão "Abrir" fica desabilitado

#### Scenario: Voltar preserva o progresso

- **WHEN** o admin volta do passo 3 para o passo 1 e avança de novo
- **THEN** os itens, as empresas e o prazo escolhidos continuam lá

#### Scenario: Pular o wizard

- **WHEN** o admin aciona "montar direto na tela de detalhe"
- **THEN** vai para a tela de detalhe da Cotação recém-criada, sem passar pelos passos do wizard
