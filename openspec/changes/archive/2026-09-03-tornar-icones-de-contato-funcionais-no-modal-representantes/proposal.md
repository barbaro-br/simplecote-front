## Why

Achado verificado no código (confirmado pelo usuário ao vivo): no
`RepresentantesModal`, cada linha mostra pequenos ícones de e-mail/telefone
quando o representante tem esses dados (`e.repEmail`/`e.repWhatsapp`), mas
são só indicadores decorativos —`<span title="Possui E-mail">` sem
`onClick`, sem mostrar o valor real. O usuário não consegue ver nem o
e-mail nem o telefone do representante a partir daí, e clicar não faz nada.

Esta change é **escopo restrito** aos dois ícones indicadores — não mexe na
estrutura do menu "⋯" (WhatsApp/Copiar link/Reenviar convite/Finalizar-
Reabrir), que foi uma decisão já tomada e implementada nesta mesma sessão
(`redesenhar-linha-do-modal-representantes`). Uma eventual repaginação
maior do layout do modal (usar melhor o espaço, repensar o que fica exposto
vs. no menu) fica como um item separado, em aberto, pra decidir depois.

## What Changes

- O ícone de e-mail passa a ser um link `mailto:` clicável (reaproveitando
  `urlMailto()` de `compartilhar-link.ts`, já existente mas sem uso),
  levando o assunto/corpo já preenchidos com a mesma mensagem de convite
  usada no WhatsApp.
- O ícone de telefone/WhatsApp passa a copiar o número (formatado) para a
  área de transferência ao clicar, com retorno visual temporário
  ("Copiado!"), mesmo padrão já usado em "Copiar link".
- Os dois ícones passam a ter `title` com o **valor real** (o e-mail ou o
  telefone formatado), não mais um texto genérico ("Possui E-mail"), de
  modo que passar o mouse já revela o dado sem precisar clicar em nada.

## Capabilities

### Modified Capabilities

- `admin/cotacoes`: requirement "Convidar Empresas" — os indicadores de
  e-mail/telefone da linha do participante passam a ser funcionais
  (mailto/copiar) e a exibir o valor real no hover.

## Impact

- `src/admin/cotacoes/RepresentantesModal.tsx`
