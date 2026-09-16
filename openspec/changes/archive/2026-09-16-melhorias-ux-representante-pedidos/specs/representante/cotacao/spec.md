# Cotação (Representante)

## Requirements

### Identidade Visual do Workspace do Representante (MODIFIED)
- **Scenario:** Em todo o ecossistema do representante (cotação avulsa ou por pedido, cards, modais e resumos).
- **Description:** O layout deve descartar bordas arredondadas e adotar a identidade brutalista/contábil (`rounded-none`, `font-mono` para campos técnicos, `border-neutral-200` etc), alinhando a percepção visual do Representante com a mesma seriedade da tela do Comprador. Mantém-se estritamente o `TemaClaro` forçado e a abordagem `mobile-first`.

### Comprovante em PDF (ADD)
- **Scenario:** Quando o Representante finaliza a cotação e a mesma entra em status bloqueado/enviado.
- **Description:** O representante deve visualizar claramente uma opção/botão de "Baixar Recibo (PDF)" que efetuará o download do espelho dos lances cadastrados (comprovante jurídico dos dados preenchidos).
