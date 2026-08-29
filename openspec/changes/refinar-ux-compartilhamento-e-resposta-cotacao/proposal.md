## Why

O compartilhamento do link mágico com o representante hoje é só "Copiar link" — o Comprador ainda precisa abrir o WhatsApp, colar e escrever a mensagem à mão. E a tela pública de resposta (`/cotacao/:token`), apesar de mobile-first, obriga o representante a rolar 50 itens para achar o botão de finalizar, não deixa o prazo visível durante a rolagem e tem um card de item com hierarquia visual fraca (unidade e campo de preço pouco destacados, "não cotado" num checkbox pequeno). A lógica já existe; falta o acabamento de UX.

## What Changes

- **Admin — `ParticipantesSection.tsx`**: cada participante ganha ações rápidas de compartilhamento:
  - "Enviar por WhatsApp": abre `wa.me` com uma mensagem amigável já codificada (`Olá {representante}, aqui está o link da cotação {título} da {empresa}. O prazo é até {prazo}. Acesse: {link}`). Usa `wa.me/{numero}` quando o telefone do representante estiver disponível; senão abre `wa.me/?text=` para o Comprador escolher o contato.
  - "Enviar por e-mail": abre o cliente de e-mail via `mailto:` com assunto e corpo pré-preenchidos (mesma mensagem). Usa o e-mail do representante como destinatário quando disponível.
  - "Copiar link" deixa de ser botão primário e passa a ser ação secundária dentro de um menu suspenso ("⋯ / Mais"), junto com "Reenviar convite".
- **Representante — `CotacaoPorTokenPage.tsx`**:
  - Cabeçalho (saudação, empresa/comprador, título) e a linha de **Prazo** ficam fixos no topo (`sticky top`) durante a rolagem.
  - O texto do prazo fica **vermelho / em alerta** quando faltam menos de 2 horas para o vencimento, e num tom neutro quando já vencido/sem prazo.
  - Uma barra de ação fixa na base da tela (`sticky bottom`) contém o botão "Finalizar resposta" (flutuante, sempre acessível) e um indicador de progresso ("Respondidos: 15/50" + barra visual).
  - O indicador de progresso conta itens com lance definido (preço informado **ou** marcado como não cotado) sobre o total de itens.
- **Representante — `ItemLanceCard.tsx`**:
  - Unidade de medida e o campo de preço ganham destaque visual (rótulo maior, input maior e com prefixo "R$", área de toque ampliada).
  - O checkbox "não cotado" vira um **toggle button** de duas opções ("Vou cotar" / "Não cotado"), com área de toque grande.
- Sem novos endpoints. Se o backend passar a expor telefone/e-mail do representante em `GET /api/cotacoes/{id}/participantes`, o front mapeia esses campos opcionais; enquanto não expõe, os botões funcionam sem destinatário.

## Capabilities

### New Capabilities
<!-- Nenhuma capability nova; ambas as telas já têm spec. -->

### Modified Capabilities
- `admin/cotacoes`: o requisito **Convidar Empresas** passa a exigir ações rápidas de compartilhamento por WhatsApp e e-mail com mensagem pré-montada, com "copiar link" rebaixado a ação secundária num menu.
- `representante/cotacao`: o requisito **Visualização da Cotação por token** passa a exigir cabeçalho e prazo fixos (`sticky top`) com realce de prazo próximo do vencimento (< 2h) e card de item com unidade/preço em destaque e toggle de "não cotado"; o requisito **Finalização com trava e limpeza da fila** passa a exigir o botão de finalizar numa barra fixa na base (`sticky bottom`) com indicador de progresso "respondidos/total".

## Impact

- **Código do front (somente):**
  - `src/admin/cotacoes/ParticipantesSection.tsx` — ações de compartilhamento + menu suspenso.
  - `src/admin/cotacoes/cotacoes.schema.ts` — campos opcionais `whatsappRepresentante?` / `emailRepresentante?` em `ParticipanteDaCotacao`.
  - `src/representante/cotacao/CotacaoPorTokenPage.tsx` — layout sticky top/bottom, cálculo de progresso e de "prazo expirando".
  - `src/representante/cotacao/ItemLanceCard.tsx` — hierarquia visual do card e toggle de não cotado.
  - Possível novo helper de UI (`DropdownMenu` / `ToggleGroup`) em `src/shared/components/ui/` se ainda não existir.
- **Testes:** unit tests de `ParticipantesSection` (monta a URL `wa.me`/`mailto` correta) e de `CotacaoPorTokenPage` (contagem de progresso, classe de alerta de prazo).
- **Sem impacto** em contrato de API, backend, rotas ou dependências de runtime novas.
