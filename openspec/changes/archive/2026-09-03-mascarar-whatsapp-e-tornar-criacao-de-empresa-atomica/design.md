## Context

`EmpresaForm.tsx` já segue o padrão "envia cru para o backend" usado no
CNPJ do projeto: `apenasNumeros()` extrai os dígitos para o envio
(já usado hoje no `whatsapp` enviado ao backend), mas falta o passo
inverso — formatar visualmente o que o usuário vê no input conforme digita.

O fluxo de criação hoje é dois `mutateAsync` sequenciais sem nenhum estado
de retomada: se o segundo falhar, não há como saber (do estado do
formulário) que o primeiro já rodou.

## Decision

**Máscara**: replicar o padrão de `aplicarMascaraCNPJ` para telefone, numa
função pura `aplicarMascaraTelefone(valor: string): string` em
`src/shared/utils/telefone.ts`, chamada no `onChange` do campo (via
`form.setValue('whatsappRepresentante', aplicarMascaraTelefone(e.target.value), { shouldValidate: true })`
ou padrão equivalente do react-hook-form), sem mudar o que é enviado ao
backend (`apenasNumeros` no submit continua igual).

**Retomada da criação**: `useState<string | null>(empresaIdCriada)`.
Quando `criarEmpresa` resolve, guarda o `id` ali antes de chamar
`criarRepresentante`. No catch, se `empresaIdCriada` já estava setado
(ou acabou de ser setado antes do throw), a mensagem de erro reflete que
a empresa foi criada. Na condição de `aoEnviar`, o branch de criação
passa a ser: `if (empresaIdCriada) { chama só criarRepresentante para
esse id } else { fluxo atual completo }`. `form.reset()`/`aoSalvar()` só
zeram/fecham no sucesso final (representante criado), como já é hoje.

## Alternatives Considered

- **Endpoint atômico no backend** (`POST /empresas-com-representante`
  criando os dois numa transação): resolveria de raiz, mas é mudança de
  contrato de API — maior escopo, backend + front, fora do que foi
  pedido agora. Fica registrado aqui como a solução "ideal" para uma
  change futura, se o time achar que vale o investimento; a solução
  desta change é a mitigação no front, sem tocar o backend.
- **Reverter a Empresa criada automaticamente se o Representante
  falhar** (compensação/rollback no front): rejeitado — a Empresa órfã
  pode legitimamente já ter outros dados/vínculos por outro caminho
  entre a criação e a falha (concorrência), e um DELETE automático
  silencioso é mais arriscado que deixá-la para o usuário completar.
