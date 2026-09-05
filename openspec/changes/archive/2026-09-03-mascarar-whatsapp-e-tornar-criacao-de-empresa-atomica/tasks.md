## 1. Máscara de telefone

- [x] 1.1 Criar `src/shared/utils/telefone.ts` com `aplicarMascaraTelefone(valor: string): string`, mesmo padrão de `aplicarMascaraCNPJ` (`src/shared/utils/cnpj.ts`): extrai dígitos com `apenasNumeros`, formata como `(XX) XXXXX-XXXX` quando há 11 dígitos (celular) ou `(XX) XXXX-XXXX` quando há 10 (fixo), formatando progressivamente enquanto o usuário digita menos dígitos.
- [x] 1.2 Em `EmpresaForm.tsx`, aplicar `aplicarMascaraTelefone` no `onChange` do campo `whatsappRepresentante` (via `form.setValue` ou handler equivalente do react-hook-form), sem alterar o que já é enviado ao backend (`apenasNumeros(valores.whatsappRepresentante)` no `aoEnviar`).
- [x] 1.3 Aplicar a mesma máscara também no formulário de edição (`representanteParaEditar`), já que reusa o mesmo componente/campo.

## 2. Criação resiliente a falha parcial

- [x] 2.1 Em `EmpresaForm.tsx`, adicionar `const [empresaIdCriada, setEmpresaIdCriada] = useState<string | null>(null)`.
- [x] 2.2 No branch de criação (`!isEdit`) de `aoEnviar`: se `empresaIdCriada` já está setado, pular `criarEmpresa.mutateAsync` e chamar só `criarRepresentante.mutateAsync({ empresaId: empresaIdCriada, ... })`. Senão, chamar `criarEmpresa.mutateAsync`, guardar o `id` retornado em `empresaIdCriada` (via `setEmpresaIdCriada`) antes de chamar `criarRepresentante.mutateAsync` — para que, se este último lançar, o estado já reflita a Empresa criada.
- [x] 2.3 Ajustar a mensagem de erro (`genericError`) exibida quando `criarRepresentante` falha após `empresaIdCriada` estar setado, deixando claro que a empresa já foi criada e que salvar de novo tenta só o representante (ex.: "Empresa criada, mas houve falha ao cadastrar o representante. Tente salvar novamente.").
- [x] 2.4 Resetar `empresaIdCriada` para `null` só no sucesso final (junto do `form.reset()`/`aoSalvar()` existentes) ou se o usuário cancelar o formulário — nunca implicitamente no meio do fluxo.

## 3. Testes

- [x] 3.1 Teste: digitar um WhatsApp de 11 dígitos formata como `(XX) XXXXX-XXXX` no campo, e o valor enviado à API de criação/atualização do representante é só os dígitos.
- [x] 3.2 Teste: `criarEmpresa` resolve, `criarRepresentante` rejeita — confirmar que uma nova tentativa de salvar chama `criarRepresentante` de novo com o mesmo `empresaId`, e `criarEmpresa` NÃO é chamado uma segunda vez (mock/spy contando invocações).
- [x] 3.3 Teste: fluxo de criação bem-sucedido de ponta a ponta (sem falha) continua funcionando como antes — `criarEmpresa` uma vez, `criarRepresentante` uma vez, formulário fecha.
- [x] 3.4 Rodar a suíte completa (`npm test`) e confirmar 0 regressões.

## 4. Verificação visual

- [x] 4.1 Testar manualmente (dev): abrir "Nova Empresa", digitar um WhatsApp e confirmar a máscara aparecendo em tempo real. **(verificado visualmente pelo dono do produto em 05/09/2026)**
- [x] 4.2 Testar manualmente (dev, se der pra simular falha — ex.: desconectar a rede entre os dois submits ou usar um representante com e-mail inválido que o backend rejeite): confirmar que reenviar depois de uma falha parcial não duplica a Empresa na listagem. **(verificado visualmente pelo dono do produto em 05/09/2026)**
