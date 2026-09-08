## ADDED Requirements

### Requirement: Banner de avisos no painel da loja

O painel da loja SHALL buscar `GET /api/avisos` ao montar e exibir um banner por aviso vigente, abaixo do banner de modo suporte. A cor e o ícone do banner SHALL variar por `nivel` (`INFO`, `ATENCAO`, `CRITICO`). Cada banner SHALL ter um botão de dispensar; o id dispensado SHALL ser guardado em `localStorage` (com try/catch e fallback em memória), de modo que o aviso não reapareça naquele navegador depois de dispensado. Sem avisos vigentes, nada é renderizado.

#### Scenario: Banner aparece e é dispensado

- **WHEN** há um aviso vigente e a loja abre o painel
- **THEN** o banner do aviso aparece; ao clicar em dispensar, ele some e continua sumido após recarregar a página

#### Scenario: Nível define a aparência

- **WHEN** um aviso tem `nivel = CRITICO`
- **THEN** o banner usa o estilo de destaque crítico (cor/ícone próprios), distinto de `INFO`
