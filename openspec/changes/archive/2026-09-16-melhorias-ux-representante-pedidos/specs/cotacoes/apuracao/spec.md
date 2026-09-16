# Apuração

## Requirements

### Sanfona de Itens por Fornecedor (MODIFIED)
- **Scenario:** Na aba de pedidos gerados, ao visualizar as empresas que participaram e ganharam itens na cotação.
- **Description:** A lista de itens ganhos de um fornecedor dentro da sanfona deve possuir uma altura máxima restrita (suficiente para cerca de 10 a 15 itens, por exemplo `max-h-[300px]`), utilizando `overflow-y-auto` com uma barra de rolagem limpa, evitando que pedidos enormes deformem a tela e percam a navegação.

### Ação de Envio (MODIFIED)
- **Scenario:** Na lista de empresas vencedoras, as ações operacionais por fornecedor.
- **Description:** O botão secundário, que antes indicava "Marcar como enviado", deve passar a exibir "Enviar por e-mail", refletindo com exatidão que essa ação dispara um e-mail com PDF/Link ao Representante e já atualiza o status de envio no sistema.
