## Context

`compartilhar-link.ts` já tem `urlMailto(msg, assunto, email)` pronta e sem
uso em nenhum lugar do código — é exatamente o que falta pro ícone de
e-mail. O ícone de WhatsApp já dentro do menu "⋯" monta a mensagem inline
(`Olá ${nome}, aqui está o link da cotação. Acesse: ${link}`); o ícone de
e-mail deve montar uma mensagem equivalente pro `body` do `mailto:`, com
`assunto` simples (ex.: "Cotação — link de acesso").

`aplicarMascaraTelefone` (`src/shared/utils/telefone.ts`, criada nesta
mesma sessão) já formata um telefone cru pro padrão `(XX) XXXXX-XXXX` —
reaproveitar pra exibir o telefone formatado no `title` e no texto copiado,
em vez do número cru salvo no banco.

## Decision

Nos dois `<span>` de indicador (linhas ~269-270 de
`RepresentantesModal.tsx`), trocar por `<button type="button">`:

- **E-mail**: `<a href={urlMailto(msg, 'Cotação — link de acesso', e.repEmail)} title={e.repEmail}>` — como é um link (`mailto:`), não precisa de handler de clique custom, só abre o cliente de e-mail padrão do sistema operacional numa nova janela/app.
- **Telefone**: `<button onClick={() => { navigator.clipboard.writeText(aplicarMascaraTelefone(e.repWhatsapp)); toast.success('Telefone copiado!') }} title={aplicarMascaraTelefone(e.repWhatsapp)}>` — mesmo padrão de feedback (`toast.success`) já usado em "Copiar link" dentro do menu "⋯".

Os ícones em si (`Mail`/`Phone`, `lucide-react`) continuam os mesmos, só
ganham interatividade e o `title` correto. Manter `size-3.5` e o
posicionamento atual na linha — essa change não mexe em layout, só em
comportamento.

## Alternatives Considered

- **Ícone de telefone abrir `tel:`**: rejeitado — o painel admin é
  desktop-first (AGENTS.md), `tel:` só é útil em dispositivos com discador
  (celular); copiar o número é mais útil pra quem vai ligar por outro
  aparelho ou colar numa mensagem.
- **Mexer no menu "⋯" nesta mesma change** (ex.: promover "Copiar link" pra
  fora do menu): rejeitado — foge do escopo desta change e reabriria uma
  decisão de design já tomada e confirmada explicitamente pelo usuário
  nesta sessão (`redesenhar-linha-do-modal-representantes`). Fica pra uma
  conversa separada, se o usuário confirmar que quer revisitar.
