## Context

O card já respeita uma regra explícita de paridade visual entre as
caixas de P.CX e P.UN (spec atual, requirement "Visualização da Cotação
por token"): a caixa do P.UN não deve destoar da largura da caixa do
P.CX, em qualquer estado do P.UN ("—", "calculando…", valor formatado).
Essa regra continua valendo — só o valor absoluto das duas larguras
cresce.

## Decision

Trocar `w-14` do `<input>` de P.CX por uma largura maior (ex.: `w-20`
ou `flex-1 max-w-[88px]` — o implementador ajusta empiricamente,
testando no navegador com um valor de 8 caracteres como "9.999,99" para
confirmar que cabe sem rolagem interna) e ajustar `min-w-[72px]` do P.UN
para o valor correspondente que mantém as duas caixas visualmente do
mesmo tamanho (a caixa do P.UN é só o container de texto; a do P.CX
soma "R$" + gap + input + padding — a paridade é sobre a largura final
renderizada das duas caixas, não sobre o input isoladamente).

Para as legendas, trocar só os dois `text-[9px]` de "P.CX"/"P.UN" para
`text-[10px]`, e o `text-[11px]` da linha de embalagem/quantidade
(`unitText`, `<p className="mt-0.5 text-[11px] ...">`) para `text-xs`.
Não tocar nos demais `text-[9px]`/`text-[10px]`/`text-[11px]` do
arquivo (badge "Novo", índice, código de barras, mensagem de
erro/status) — ficam fora de escopo por serem elementos compactos numa
única linha, onde crescer o texto arrisca quebrar para duas linhas em
375px.

## Alternatives Considered

- **Input com largura automática (`width: ch`-based, cresce com o
  conteúdo)**: mais elegante, mas introduz complexidade
  desproporcional para o ganho (o valor máximo realista já é conhecido
  — preços de embalagem não passam de 5 dígitos antes da vírgula em
  qualquer caso de uso do domínio); uma largura fixa maior resolve o
  problema real com menos risco.
- **Aumentar todos os textos pequenos do card de uma vez**: rejeitado
  nesta change — description acima já justifica escopo restrito às
  legendas P.CX/P.UN e à linha de embalagem/quantidade, que são os
  elementos com folga de espaço; os demais ficam registrados no
  backlog (`docs/backlog-ux-2026-09-03.md`) caso o time queira revisitar.
