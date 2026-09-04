## ADDED Requirements

### Requirement: Alternar destaque do menor preço na grade ao vivo
A tela de Configurações SHALL oferecer uma opção "Destacar menor preço na grade ao vivo" (ligado/desligado), com "ligado" como valor padrão para uma loja nova. A escolha SHALL se aplicar à Grade de Respostas (Ao Vivo) de todas as Cotações da loja, para todos os usuários, seguindo o mesmo padrão de persistência já usado pelas demais preferências desta tela (`tema`, `estiloNavegacao`).

#### Scenario: Desligar o destaque
- **WHEN** o admin desliga "Destacar menor preço na grade ao vivo" e salva
- **THEN** a preferência é persistida e a Grade ao Vivo de qualquer Cotação passa a não exibir destaque de menor preço em nenhuma célula

#### Scenario: Ligar o destaque de volta
- **WHEN** o admin liga "Destacar menor preço na grade ao vivo" e salva
- **THEN** a preferência é persistida e a Grade ao Vivo volta a destacar o menor preço unitário de cada item

#### Scenario: Loja nova nasce com o destaque ligado
- **WHEN** uma loja é criada sem essa preferência explicitamente definida
- **THEN** o valor padrão "ligado" é aplicado
