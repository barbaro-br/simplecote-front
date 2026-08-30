## 1. Refatoração de Estado e Filtros

- [x] 1.1 Em `RepresentantesModal.tsx`, adicionar os estados `search` (string) e `filter` ('todos' | 'enviado' | 'nao_enviado').
- [x] 1.2 Atualizar o `useMemo` de `filtrados` para aplicar a lógica de busca (por nome de empresa ou de representante, case-insensitive) e de filtro (verificando se o convite foi enviado ou não quando `!isAberta` não é verdadeiro).
- [x] 1.3 Criar variáveis derivadas (ex: contadores `enviadoCount`, `naoEnviadoCount`) utilizando o número de participantes para popular os valores das "chips" e rodapé.

## 2. Refatoração Visual (Header, Filtros e Busca)

- [x] 2.1 Refatorar o `header` do modal para exibir o formato do Figma: Título à esquerda, texto abaixo informando quantos estão selecionados (ex: `X marcados para convite`) e usar botões/ícones para fechar se o Dialog não fizer isso por padrão.
- [x] 2.2 Abaixo do header, renderizar as chips de filtro ('Todos', 'Enviado', 'Não enviado') com seus respectivos contadores redondos (visíveis apenas quando `isAberta === true`). Usar estilos do Tailwind CSS.
- [x] 2.3 Renderizar o campo de `Busca` com o ícone de lupa do `lucide-react`.

## 3. Refatoração Visual (Listagem e Rodapé)

- [x] 3.1 Na renderização do `filtrados.map`, aplicar os estilos de item inspirados pelo Figma: container mais limpo, cores de highlight (`bg-green-50`) quando selecionado, avatar com cor dinâmica, badge de status (Enviado/Não enviado) alinhada à direita quando `isAberta`.
- [x] 3.2 Atualizar as ações à direita do item: Se selecionado e enviado, mostrar ícone para Reenviar. (Preservar os ícones de contato já adicionados anteriormente).
- [x] 3.3 Substituir os botões do footer pela lógica condicional do Figma: exibir "Os convites serão disparados..." se rascunho, ou o botão "Enviar para todos" (caso haja não enviados), ou uma mensagem de sucesso "Todos os convites foram enviados."
