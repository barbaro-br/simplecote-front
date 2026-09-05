---
name: health-gate
description: Roda a checagem de saúde obrigatória do AGENTS.md (npm test, npm run build, npm run lint) e reporta o resultado no formato esperado. Use depois de qualquer alteração de código, antes de marcar uma tarefa como concluída, ou quando quiser saber rápido "está tudo verde?".
metadata:
  author: simplecote
  version: "1.0"
---

Implementa a regra 3 de "Regras de disciplina" do `AGENTS.md`: **"Checagem de Saúde OBRIGATÓRIA:
depois de cada tarefa rode `npm test`, `npm run build` e `npm run lint`. Vermelho = pare."**

## Comandos (nesta ordem — pare no primeiro vermelho, não precisa rodar os seguintes)

```
npm test          # vitest run
npm run build     # tsc -b && vite build
npm run lint      # oxlint
```

## Gotcha de ambiente conhecido nesta máquina

Se `node`/`npm`/`npx` derem erro tipo `command not found: _load_nvm` ou centenas de linhas de
erro de função em um shell não-interativo: é o lazy-load do nvm no `.zshrc` quebrando fora de
shell interativo, não um problema do projeto. Contorne rodando via um wrapper que force o PATH do
node real antes do comando, ou invoque os binários diretamente (ex: `$(which node)`/caminho
absoluto do node em `~/.nvm/versions/node/*/bin/` ou o node do Homebrew em `/usr/local/bin/node`
se instalado). Não gaste ciclos "debugando" o projeto por causa disso.

## Formato do relatório (bate com a regra 3 e com a seção "Handoff" do AGENTS.md)

```
| Check              | Resultado |
|---------------------|-----------|
| npm test            | ✅/❌ (N passando, M falhando — liste os nomes dos que falharam) |
| npm run build       | ✅/❌ (erro de tipo, se houver: arquivo:linha) |
| npm run lint        | ✅/❌ (warnings não bloqueiam; erros bloqueiam) |
```

## Se der vermelho

Regra 4 do `AGENTS.md` ("Resolução de Erros e Limite de Tentativas"): no máximo **3 tentativas**
de correção. Na 3ª tentativa falha, **não insista** — desfaça a alteração daquela tarefa
(`git restore`/`git checkout` só do que essa tarefa tocou, nunca um `--hard` geral) e chame o
humano. Nunca marque uma tarefa como `[x]` concluída com a suíte vermelha.

Antes de "consertar" um teste pré-existente pra ele passar, pare: regra 6 ("Integridade de
Testes") proíbe editar teste existente só pra passar, a menos que o comportamento tenha mudado de
propósito — e aí o motivo precisa ser dito explicitamente no relatório, não só silenciado.
