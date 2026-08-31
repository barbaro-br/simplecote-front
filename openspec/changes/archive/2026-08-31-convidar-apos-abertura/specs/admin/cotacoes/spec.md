# Spec Delta: Convites Adicionais (Late Invites)

## Convidar após abertura
- O administrador deve poder selecionar novas empresas e enviar convites para uma cotação que já está com status `ABERTA`.
- Ao convidar uma empresa tardiamente, a grade de cotação desta empresa deve ser gerada imediatamente (lances vazios) para que ela possa participar e aparecer no Grid Ao Vivo.

## Remoção de Convidados (Opinião Arquitetural)
- Não deve ser possível "deletar" um representante de uma cotação aberta, visando preservar a integridade referencial dos lances. Para impedir acesso futuro, seria ideal uma opção de "revogar link/anular", mas a deleção não é um caminho seguro para auditoria de preços.
