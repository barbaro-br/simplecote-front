## Why

Levantado ao vivo e confirmado no código: uma linha de participante já
engajado no modal "Representantes Convidados" acumula avatar, nome da
empresa, nome do representante, até 1 badge de status, e até 5 ações
(WhatsApp, Copiar link, Reenviar e-mail, Finalizar-ou-Reabrir) — tudo numa
única linha de um modal de 448px de largura (`max-w-md`). Como a coluna de
nome usa `flex-1 min-w-0` sem largura mínima garantida, ela é quem cede
espaço primeiro: nomes como "Comercial Boa Praça" e "Distribuidora Sul"
aparecem truncados para uma única letra ("C..", "D..") assim que a linha
tem 3+ ações visíveis ao mesmo tempo.

Pesquisa de padrões de UI para esse tipo de linha (lista de convite/membro
com badge de status + ações por linha — ver referências abaixo) aponta duas
regras direto aplicáveis aqui:
- Ações secundárias (2 ou mais) devem ficar agrupadas num menu overflow, não
  expostas como ícones soltos na linha — "se toda linha é um painel de
  ícones minúsculos, o usuário não sabe pra onde olhar".
- A coluna de identidade (nome + metadado secundário) deve ter espaço
  garantido, não ser a primeira a ceder quando a linha aperta.

O produto já tem exatamente o componente certo para isso —
`MenuAcoes` (`@/shared/components/ui/menu-acoes.tsx`), já usado em
`CotacoesPage`/`CotacaoDetalhePage` para agrupar ações secundárias num
"⋯" — só não está sendo reaproveitado nesta tela.

**Nota à parte, achada ao revisar o requirement atual**: o texto de
"Convidar Empresas" já descreve "Copiar link" como ação secundária "dentro
de um menu suspenso ('Mais ações')" e menciona uma ação "Remover empresa"
— nenhuma das duas coisas existe na implementação atual (todas as ações
são ícones soltos, sem menu, e não há nenhum "Remover empresa" no código
front nem back). É uma divergência de documentação pré-existente, não
introduzida por este change; a menção a "Remover empresa" será removida do
texto do requirement por ser inexistente, e o texto sobre agrupamento em
menu passa a refletir de fato o que este change implementa.

## What Changes

- Todas as ações por participante já convidado (Enviar por WhatsApp, Copiar
  link, Reenviar e-mail, Finalizar/Reabrir resposta) passam a ficar dentro
  de um único menu "⋯" (`MenuAcoes`), substituindo os ícones soltos atuais.
  Deixa de existir a distinção "ação primária" (WhatsApp/E-mail) vs.
  "ação secundária" (Copiar/Reenviar) — todas ficam no mesmo menu.
- "Convidar" continua como botão visível de primeiro nível para empresas
  ainda não convidadas (é a única ação possível naquela linha, não compete
  por espaço com badges).
- A coluna de nome da empresa + nome do representante ganha largura mínima
  garantida, deixando de ser a primeira a ceder espaço quando a linha
  aperta.
- Remove a menção a "Remover empresa" do texto do requirement "Convidar
  Empresas" (ação inexistente na implementação).

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirements "Convidar Empresas" e "Correção de lance e
  reabertura de resposta pelo admin" — reorganiza as ações por participante
  num menu "⋯" único e garante largura mínima para o nome.

## Impact

- `src/admin/cotacoes/RepresentantesModal.tsx`

## References

- List UI design best practices (2026) — https://www.uxpin.com/studio/blog/list-design/
- Best Practices for Providing Actions in Data Tables — https://uxdworld.com/best-practices-for-providing-actions-in-data-tables/
- Designing Effective Contextual Menus (NN/G) — https://www.nngroup.com/articles/contextual-menus-guidelines/
- PatternFly Overflow Menu design guidelines — https://www.patternfly.org/components/overflow-menu/design-guidelines/
