## 1. Fundação e Infraestrutura UI

- [x] 1.1 Injetar os tokens de cor e configurações globais de estilo exportados pelo Stitch (encontrados em `/new-front/index.html` e `tailwind-config`) no projeto `simplecote-front` de forma a garantir a paridade visual (ex: arquivos CSS raiz, configuração de tema). Validar que o painel existente (`/admin`) não quebra visualmente.
- [x] 1.2 Criar um hook genérico `useFeatureFlag` que salve e leia do `localStorage` (ex: `ui_cotacao_v2`). Validar seu funcionamento escrevendo e recuperando o valor via console.
- [x] 1.3 Adicionar um componente de *Toggle* (botão de ligar/desligar) na UI do cabeçalho ou menu de configurações do Comprador com o rótulo "Experimentar Novo Visual". Validar que o clique altera o estado do `useFeatureFlag` e força o re-render da casca da aplicação.

## 2. A Nova Cotação (V2)

- [x] 2.1 Criar a estrutura vazia de diretórios e arquivos para a nova Cotação (ex: `<CotacaoFormV2 />`) ao lado dos arquivos da V1.
- [x] 2.2 Importar a marcação (HTML/Tailwind JSX) da nova cotação oriunda da prova de conceito (`new-front`) ou export direto do Stitch, convertendo classes para os padrões React do projeto e limpando dependências faltantes. Validar via renderização em tela.
- [x] 2.3 Substituir os campos estáticos do JSX importado pelos inputs controlados (Zod/React Hook Form) usando as mesmas funções e regras (`useForm`, `zodResolver`) do componente `<CotacaoFormV1 />`. Validar enviando uma cotação nova (salvamento no banco com sucesso e tratamento de erro de API).
- [x] 2.4 Implementar o *Router/Switch* lógico nas páginas-mãe de Cotação: se `useFeatureFlag('ui_cotacao_v2')` for verdadeiro, renderizar a V2; caso contrário, a V1 (o passo a passo). Validar o desvio usando a chave criada na Tarefa 1.3.

## 3. A Nova Aba de Pedidos (V2)

- [x] 3.1 Criar o componente base `<PedidosV2 />` recebendo a mesma `prop` de dados ou chamando os mesmos hooks da query da API que a tela de pedidos atual utiliza.
- [x] 3.2 Escrever uma função utilitária `agruparPedidosPorEmpresa(itens)` que varra os dados e retorne um objeto agrupado (com valor total consolidado e a lista de itens daquela empresa). Validar usando testes unitários.
- [x] 3.3 Trazer a estrutura HTML/Tailwind da sanfona (accordion / sticky-header) do export do Stitch e conectá-la ao objeto agrupado gerado na tarefa 3.2.
- [x] 3.4 Amarrar o controle de clique (abrir/fechar a sanfona de cada empresa) ao estado local do componente de pedido, exibindo a tabela limpa de itens quando expandida. Validar testando o comportamento visual de clique.
- [x] 3.5 Implementar o desvio lógico na página-mãe de Pedidos, usando a *feature flag*, idêntico à tarefa 2.4. Validar navegando para a aba de pedidos com e sem o toggle ativado.
