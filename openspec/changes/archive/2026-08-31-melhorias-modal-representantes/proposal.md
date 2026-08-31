## Proposal: Melhorias no Modal de Representantes

**Problema:**
A listagem de representantes convidados (dentro do modal de uma cotação em andamento) apresenta problemas de usabilidade:
1. O botão de "Copiar link" não tem ação implementada, então não copia.
2. O link gerado para os botões "Copiar" e "WhatsApp" está *hardcoded* para `app.simplecote.com/responder/{id}`, enquanto o back-end retorna corretamente o `linkMagico` da API apontando para o domínio real.
3. Não há uma forma de disparar um e-mail individual para apenas *um* representante específico, caso ele afirme que não recebeu.

**Solução Proposta:**
1. Implementar a função de cópia usando `navigator.clipboard.writeText(...)` com feedback visual (um _toast_ de sucesso).
2. Substituir o link *hardcoded* por `participante.linkMagico`, garantindo que os botões do Front-end gerem a URL idêntica à do e-mail.
3. Adicionar um ícone de e-mail ao lado das opções "WhatsApp" e "Copiar", que chama a mutação de re-envio individual (`useReenviarConvite`).

**Escopo:**
Restrito ao arquivo `RepresentantesModal.tsx` no Front-end.
