## 1. UsuarioForm — senha inicial (cadastro)

- [x] 1.1 Adicionar `useState<boolean>` (`mostrarSenha`) e alternar `type` do input de senha (`user-senha`) entre `password`/`text`; adicionar botão com ícone `Eye`/`EyeOff` (lucide-react) e `aria-label` dinâmico.
- [x] 1.2 Adicionar `const senha = form.watch('senha')` e renderizar abaixo do campo um indicador (texto + ícone) de "8+ caracteres" que muda de estilo (neutro → positivo) quando `(senha ?? '').length >= SENHA_MIN` (importar `SENHA_MIN` de `usuarios.schema.ts`, nunca hardcodar 8 de novo).
- [x] 1.3 Não alterar a validação de submit existente (`form.setError('senha', ...)` em `!isEdit`) — o indicador é adicional, não substitui.

## 2. RedefinirSenhaForm — nova senha e confirmação

- [x] 2.1 Repetir 1.1 para os dois campos (`nova-senha` e `confirmar-senha`), com estado de revelar independente por campo.
- [x] 2.2 Repetir 1.2 para o campo `senha` (nova senha) deste formulário.
- [x] 2.3 Adicionar indicador de coincidência: `const confirmar = form.watch('confirmar')`; comparar com `senha` e mostrar "As senhas coincidem" (positivo) quando iguais e `confirmar` não vazio, "As senhas ainda não coincidem" (neutro/atenção) quando diferentes e `confirmar` não vazio, e nada (ou estado neutro) enquanto `confirmar` está vazio.

## 3. Testes

- [x] 3.1 Teste: clicar no botão de revelar em cada campo alterna `type` entre `password`/`text` e o `aria-label` do botão muda de acordo.
- [x] 3.2 Teste: digitar menos de 8 caracteres no campo de senha mostra o indicador em estado "não atingido"; digitar 8+ muda para "atingido".
- [x] 3.3 Teste (RedefinirSenhaForm): digitar senhas diferentes nos dois campos mostra o indicador de "não coincidem"; igualar os dois campos muda para "coincidem".
- [x] 3.4 Confirmar que a validação de submit (bloqueio de envio com senha curta ou senhas diferentes) continua funcionando como antes — os indicadores não substituem essa validação.
- [x] 3.5 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [ ] 4.1 Testar manualmente (dev): abrir "Novo Usuário", digitar uma senha curta e depois completar para 8+ caracteres, observando o indicador mudar; clicar em revelar e confirmar que o texto aparece.
- [ ] 4.2 Testar manualmente (dev): abrir "Trocar senha" de um usuário existente, digitar senhas diferentes e depois iguais nos dois campos, observando o indicador de coincidência mudar.
