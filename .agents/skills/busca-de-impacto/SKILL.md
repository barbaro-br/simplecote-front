---
name: busca-de-impacto
description: Antes de mudar a assinatura de uma função, componente, hook ou tipo exportado, faz uma busca ativa (grep) de todos os usos no repo e lista os arquivos consumidores que precisam ser atualizados junto. Use antes de qualquer refactor que mexe em algo exportado — nome de prop, tipo de retorno, campo de um type/interface, assinatura de hook.
metadata:
  author: simplecote
  version: "1.0"
---

Implementa a regra 5 de "Regras de disciplina" do `AGENTS.md`: **"Busca de Impacto (Discovery
Obrigatório): antes de alterar a assinatura de uma função, componente, hook ou tipo exportado,
busque ativamente (grep) onde é usado no repo e atualize os consumidores. Se o impacto for grande
(20+ arquivos), avise antes."**

## Passo a passo

1. Identifique o símbolo exportado que vai mudar (nome do componente/hook/tipo/campo) e o arquivo
   onde é declarado.
2. Grep pelo nome em `src/` — cubra tanto import nomeado quanto uso via `import type`:
   ```
   grep -rln "\b<Simbolo>\b" src --include="*.ts" --include="*.tsx" | grep -v "\.test\."
   ```
   Para um campo de `type`/`interface` (ex: renomear uma prop), grep pelo nome do campo dentro dos
   arquivos que já importam o tipo — cuidado com falso-positivo (nome de campo comum reaproveitado
   em outro tipo não relacionado).
3. Liste os arquivos consumidores encontrados (caminho + como usam — prop, destructuring, tipo de
   retorno).
4. **Se forem 20+ arquivos**: pare e avise o humano antes de prosseguir — não é bloqueio automático,
   é o gatilho pra confirmar escopo, exatamente como a regra pede.
5. Se forem poucos: atualize TODOS os consumidores como parte da mesma change. Não deixe um
   consumidor quebrado "pra depois" — isso viola a regra 1 (faça só o que a tarefa pede, mas o que
   a tarefa pede inclui deixar o repo compilando).
6. Rode a skill `health-gate` (ou pelo menos `npm run build`, que é `tsc -b` — pega quebra de tipo
   em consumidor esquecido) depois de atualizar todos os pontos.

## O que reportar

Lista simples: símbolo alterado, arquivo de origem, N consumidores encontrados, se algum ficou de
fora do escopo e por quê (regra 1 do `AGENTS.md`: arquivo fora do que a change nomeia não entra no
diff sem dizer qual e por quê).
