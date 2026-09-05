## 1. Atualização do Componente RepresentantesModal

- [x] 1.1 Remover o avatar circular com iniciais e implementar o checkbox de participação acessível (`size-5`) à esquerda de cada item
- [x] 1.2 Atualizar a hierarquia tipográfica: exibir o nome da empresa em destaque caixa alta (uppercase/bold) e o nome do representante em linha dedicada logo abaixo
- [x] 1.3 Implementar a linha com badge de status em 3 estados (`Pendente`, `Enviado`, `Finalizado`) acompanhado do botão explícito `[ Fechar cotação ]` para participantes não finalizados (e ação de reabertura para finalizados)
- [x] 1.4 Reorganizar a coluna de ações da direita na ordem estrita do wireframe: E-mail (E), WhatsApp (W) e Copiar link (C)
- [x] 1.5 Permitir desmarcar o checkbox de qualquer participante em cotação aberta (inclusive com status `RESPONDIDO`), disparando o diálogo de confirmação que alerta sobre a invalidação dos preços cotados e executando `DELETE /api/participantes/:id`

## 2. Testes e Validação

- [x] 2.1 Atualizar os testes de unidade e integração em `RepresentantesModal.test.tsx` para cobrir o desconvite de participantes `RESPONDIDO`, novos rótulos de status, botão "Fechar cotação" e reordenação de ações
- [x] 2.2 Executar a checagem obrigatória de saúde (`npm test`, `npm run lint` e `npm run build`) garantindo 100% de aprovação e zero regressões
