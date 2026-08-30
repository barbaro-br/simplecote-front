# AGENTS.md

Lido por qualquer agente de código que trabalhe neste repo (Antigravity, Claude Code, …).
Regras curtas e duras. Se uma bater de frente com o que você "acha melhor": as regras ganham.

## Regras inquebráveis

1. **Faça só o que a tarefa pede.** Nada de melhoria em código adjacente, arquivo novo,
   dependência ou abstração que a tarefa não exige. Tentado a mexer em algo fora do
   escopo → **liste, pergunte, espere**. Não infira desejo não dito do usuário.
2. **Edite o código ANTES de marcar `[x]`.** Nunca marque tarefa concluída sem um diff
   correspondente. Se a tarefa não precisa de mudança, **diga isso explicitamente** — não
   marque calado.
3. **Depois de cada tarefa:** `npm test` (vitest) + `npm run build` (tsc) + `npm run lint`
   (oxlint). **Vermelho = pare.** Não avance pra próxima tarefa com a suíte quebrada.
4. **Nunca edite um teste pra ele passar** a menos que o comportamento tenha mudado de
   propósito — e aí diga qual comportamento e por quê, no mesmo diff. Não afrouxe asserção
   (`{name:'X'}` → `/X/i`; `getByPlaceholderText` → `getByLabelText` sem adicionar o
   `<label>` de verdade) só pra ficar verde.
5. **`git diff package.json` fica vazio.** Zero dependência nova sem aprovação explícita.
   Nada de `npx shadcn add/init` (puxa `@radix-ui/*`; este repo usa `@base-ui/react`).
6. **Não commite nem pushe.** Deixe as mudanças no working tree pra revisão humana.
7. **Menor mudança possível.** Restyle mexe em classe/markup — não transforma um arquivo
   de 120 linhas em 280. Se o diff de um arquivo passar de ~2× o que a tarefa implica,
   **pare e explique**.

## Loop de trabalho

Uma tarefa por vez. O "spec" é `openspec/changes/<change>/{proposal,design,tasks}.md`.
Implemente **exatamente** o que ele descreve. Ao terminar, confira cada requisito do
spec contra o que você fez. Volte a iterar só dentro do escopo. **Pare e chame o humano**
quando uma correção mudaria o spec, adicionaria escopo, ou exigiria operação arriscada
(deploy, migração, credencial, apagar coisa).

## Trabalho de UI

Antes de mexer numa tela, saiba: o propósito dela, quem usa, e **todos os estados**
(carregando / vazio / erro / desabilitado / somente-leitura / link inválido).

- Reuse `src/shared/components/ui/*` e os tokens de cor em `src/index.css`.
- **Estenda** um primitivo (adicione uma `variant`), **não** forke nem crie `Button2` local.
- Copy em **pt-BR**. Não renomeie texto de UI ("Confirmar pedido" → "Confirmar") sem a
  tarefa pedir.
- Telas do **representante** (`src/representante/**`): mobile-first, **tema claro forçado**
  (`.tema-claro`), header/rodapé sticky, alvo de toque ≥ 48px.
- Depois: renderize e cheque quebra visual / acessibilidade / estados / responsivo.

## Fatos do projeto

- **Stack:** Vite + React 19 + TypeScript + Tailwind v4 + `@base-ui/react` + componentes
  hand-rolled estilo shadcn em `src/shared/components/ui/`. Fonte Geist. `import.meta.env`
  pra env (`VITE_API_BASE_URL` = base absoluta da API).
- **Comandos:** `npm run dev` · `npm run build` (`tsc -b && vite build`) · `npm test`
  (`vitest run`) · `npm run lint` (`oxlint`). OpenSpec: `openspec` (no PATH).
- **Não toque** em `.github/workflows/**`, `vercel.json`, `openspec/specs/**` a menos que
  a tarefa seja explicitamente sobre eles.
- Testes usam MSW (mockam a API) — passar nos testes **não** garante que a integração real
  funciona.

---

_Regras destiladas dos skills `ai-loop`, `moyu` e `anti-ui-slop` (agentic-awesome-skills),
mais o que a gente aprendeu apanhando neste repo._
