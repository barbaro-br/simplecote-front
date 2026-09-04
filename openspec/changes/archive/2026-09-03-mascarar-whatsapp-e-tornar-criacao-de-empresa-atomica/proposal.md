## Why

Dois achados verificados nesta sessão em `EmpresaForm.tsx`:

1. **Sem máscara no WhatsApp** (verificado ao vivo): o campo mostra o
   placeholder `(11) 99999-9999`, mas digitar `11987654321` fica cru na
   tela — sem parênteses, espaço nem hífen — mesmo já existindo
   `aplicarMascaraCNPJ` como padrão de máscara em tempo real no projeto
   (`src/shared/utils/cnpj.ts`), só não replicado para telefone.
2. **Criação não é atômica** (verificado por leitura de código,
   `aoEnviar()`): no fluxo de criação, `criarEmpresa.mutateAsync` roda e
   só depois `criarRepresentante.mutateAsync` — se a Empresa é criada mas
   o Representante falha (rede, validação do backend), o catch genérico
   só mostra uma mensagem de erro; o formulário continua em modo
   "criar", então reenviar chama `criarEmpresa` de novo e duplica a
   Empresa (a primeira fica órfã, sem representante, sem forma de
   completá-la por esse formulário).

## What Changes

- Adicionar `aplicarMascaraTelefone` em `src/shared/utils/telefone.ts`
  (mesmo padrão de `aplicarMascaraCNPJ`), formatando para
  `(XX) XXXXX-XXXX` (celular, 11 dígitos) ou `(XX) XXXX-XXXX` (fixo, 10
  dígitos) conforme a quantidade de dígitos digitados. Aplicar essa
  máscara em tempo real (`onChange`) no campo WhatsApp de `EmpresaForm`,
  guardando e enviando ao backend os dígitos crus (`apenasNumeros`,
  comportamento de envio já existente e mantido).
- Tornar a criação de Empresa+Representante resiliente a falha parcial:
  guardar o `id` da Empresa recém-criada em estado local assim que
  `criarEmpresa` tem sucesso. Se `criarRepresentante` falhar depois, o
  formulário passa a tratar a próxima tentativa de salvar como "criar
  representante para a empresa já criada" (chamando só
  `criarRepresentante` com o `empresaId` guardado), em vez de chamar
  `criarEmpresa` de novo — eliminando a duplicata.
- A mensagem de erro genérica exibida após a falha parcial SHALL deixar
  claro que a empresa já foi criada e que reenviar vai (só) tentar
  cadastrar o representante de novo.

## Capabilities

### Modified Capabilities

- `admin/empresas`: requirement "Cadastro de Empresa" — adiciona máscara
  de telefone em tempo real e comportamento de retomada após falha
  parcial na criação.

## Impact

- `src/admin/empresas/EmpresaForm.tsx`
- `src/shared/utils/telefone.ts` (novo)
