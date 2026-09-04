## Context

`SENHA_MIN = 8` é a única regra de senha do domínio (`usuarios.schema.ts`).
Não há regra de maiúscula, número ou símbolo — então o "checklist" pedido
pela auditoria original (que citava múltiplos critérios, ao estilo de
outros produtos) não se aplica aqui: o indicador certo para este projeto
é de um critério só (tamanho mínimo), mais a coincidência das senhas na
tela de troca.

## Decision

**Revelar/ocultar**: `useState<boolean>` local por campo (`mostrarSenha`),
alternando `type={mostrarSenha ? 'text' : 'password'}` e um botão
`<button type="button">` com ícone (`Eye`/`EyeOff` do `lucide-react`, já
usado no projeto) posicionado dentro do input (`absolute`, mesmo padrão
visual de outros campos com ícone à direita, se houver; senão, um botão
simples ao lado). `aria-label` dinâmico ("Mostrar senha"/"Ocultar
senha").

**Indicador de tamanho mínimo**: `const senha = form.watch('senha')` (ou
o nome do campo equivalente); `const valida = (senha ?? '').length >=
SENHA_MIN`; renderizar um texto pequeno abaixo do campo (ex.:
`text-success`/`text-muted-foreground` conforme `valida`) com um
ícone de check quando satisfeito. Reaproveitar `SENHA_MIN` já exportado
de `usuarios.schema.ts` — nunca hardcodar o número de novo.

**Indicador de coincidência** (só em `RedefinirSenhaForm`): `const
confirmar = form.watch('confirmar')`; comparar com `senha` a cada
render, mostrando "As senhas coincidem"/"As senhas ainda não coincidem"
(neutro enquanto `confirmar` está vazio, para não assustar o admin antes
de ele terminar de digitar).

Esses indicadores são **feedback ao vivo**, não substituem a validação
de submit existente (`zodResolver`/`form.setError`) — continuam
coexistindo; o indicador é só uma pista visual antecipada.

## Alternatives Considered

- **Medidor de força de senha (fraca/média/forte)**: rejeitado — não há
  política de complexidade no backend para embasar "força"; um medidor
  assim mentiria uma robustez que o sistema não exige nem verifica.
- **Revelar todas as senhas do formulário com um único toggle global**:
  rejeitado — em `RedefinirSenhaForm` os dois campos (nova senha,
  confirmar) podem ter erros de digitação diferentes; revelar um sem o
  outro ajuda a comparar visualmente os dois lados por vez, então o
  toggle é por campo.
