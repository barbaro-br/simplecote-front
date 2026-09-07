# admin/onboarding Specification

## Purpose
Experiência de primeiro acesso do painel para um `Comprador` recém-criado e sem dados: um checklist de primeiros passos, um wizard guiado opcional de três passos e a opção de popular dados de exemplo, para levar o dono do supermercado ao primeiro uso real (uma cotação com representantes) sem ficar perdido num painel vazio.

## Requirements

### Requirement: Checklist de primeiros passos

Quando o `Comprador` da sessão não tem produtos, nem representantes, nem cotações, o painel SHALL exibir um checklist de primeiros passos com três itens — cadastrar produtos, cadastrar um representante, abrir uma cotação de teste. Cada item SHALL levar à tela existente correspondente e SHALL passar a "cumprido" automaticamente quando a condição for satisfeita. O checklist SHALL ser dispensável pelo usuário e SHALL poder ser reexibido depois. Quando os três itens estiverem cumpridos, o checklist SHALL deixar de aparecer.

#### Scenario: Painel vazio mostra o checklist

- **WHEN** o dono acessa o painel de um `Comprador` sem produtos, representantes ou cotações
- **THEN** o checklist de primeiros passos aparece com os três itens pendentes

#### Scenario: Passo se marca ao ser cumprido

- **WHEN** o dono cadastra o primeiro produto
- **THEN** o item "cadastrar produtos" do checklist aparece como cumprido, sem ação manual

#### Scenario: Dispensar e reexibir

- **WHEN** o dono dispensa o checklist e depois aciona "mostrar primeiros passos"
- **THEN** o checklist volta a aparecer com o estado atual dos passos

#### Scenario: Checklist some quando tudo está pronto

- **WHEN** o `Comprador` já tem ao menos um produto, um representante e uma cotação
- **THEN** o checklist não é mais exibido

### Requirement: Wizard guiado opcional de 3 passos

O painel SHALL oferecer um wizard opcional que encadeia os três primeiros passos — adicionar produtos, cadastrar/selecionar um representante e abrir uma cotação de teste — reusando as telas já existentes. O wizard SHALL poder ser fechado a qualquer momento, deixando o usuário no painel com o checklist disponível. Concluir o wizard SHALL deixar o `Comprador` com uma cotação aberta.

#### Scenario: Percorrer o wizard até o fim

- **WHEN** o dono aciona "configurar em 3 passos" e percorre produtos → representante → cotação
- **THEN** ao final existe uma cotação aberta e o checklist aparece com os três passos cumpridos

#### Scenario: Fechar o wizard no meio

- **WHEN** o dono fecha o wizard no segundo passo
- **THEN** ele fica no painel, o que já foi feito permanece, e o checklist reflete os passos cumpridos até ali

### Requirement: Dados de exemplo

O painel SHALL oferecer a um `Comprador` em modo de teste a opção de popular dados de exemplo (catálogo e representantes fictícios) para experimentar o produto sem digitar os próprios dados. Esses dados SHALL ser identificáveis como exemplo e SHALL poder ser removidos de uma vez por uma ação explícita.

#### Scenario: Popular e depois limpar

- **WHEN** o dono aciona "preencher com dados de exemplo" e mais tarde "limpar dados de exemplo"
- **THEN** primeiro o painel passa a ter produtos e representantes de exemplo, e depois eles são removidos, sem afetar dados que o dono tenha criado à mão

#### Scenario: Opção restrita ao modo de teste

- **WHEN** o `Comprador` não está mais em modo de teste (assinatura ativa)
- **THEN** a opção de popular dados de exemplo não é oferecida
