import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { empresaSchema, type EmpresaFormValues, type Empresa } from './empresas.schema'
import { useCriarEmpresa, useAtualizarEmpresa } from './empresas.api'
import { useCriarRepresentante, useAtualizarRepresentante } from '../representantes/representantes.api'
import type { Representante } from '../representantes/representantes.schema'
import { apenasNumeros } from '@/shared/utils/cnpj'

export function EmpresaForm({
  aoSalvar,
  empresaParaEditar,
  representanteParaEditar,
}: {
  aoSalvar: () => void
  empresaParaEditar?: Empresa
  representanteParaEditar?: Representante
}) {
  const isEdit = !!empresaParaEditar
  const criarEmpresa = useCriarEmpresa()
  const atualizarEmpresa = useAtualizarEmpresa()
  const criarRepresentante = useCriarRepresentante()
  const atualizarRepresentante = useAtualizarRepresentante()
  const [genericError, setGenericError] = useState<string | null>(null)

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: empresaParaEditar?.nome ?? '',
      nomeRepresentante: representanteParaEditar?.nome ?? '',
      emailRepresentante: representanteParaEditar?.email ?? '',
      whatsappRepresentante: representanteParaEditar?.whatsapp ?? '',
    },
  })

  const isPending =
    criarEmpresa.isPending ||
    atualizarEmpresa.isPending ||
    criarRepresentante.isPending ||
    atualizarRepresentante.isPending

  async function aoEnviar(valores: EmpresaFormValues) {
    setGenericError(null)
    const whatsapp = valores.whatsappRepresentante
      ? apenasNumeros(valores.whatsappRepresentante)
      : undefined
    try {
      if (isEdit) {
        await atualizarEmpresa.mutateAsync({ id: empresaParaEditar.id, valores: { nome: valores.nome } })
        if (representanteParaEditar) {
          await atualizarRepresentante.mutateAsync({
            id: representanteParaEditar.id,
            body: {
              nome: valores.nomeRepresentante,
              email: valores.emailRepresentante,
              whatsapp,
            },
          })
        } else {
          await criarRepresentante.mutateAsync({
            empresaId: empresaParaEditar.id,
            nome: valores.nomeRepresentante,
            email: valores.emailRepresentante,
            whatsapp,
          })
        }
      } else {
        const empresaCriada = await criarEmpresa.mutateAsync({ nome: valores.nome })
        await criarRepresentante.mutateAsync({
          empresaId: empresaCriada.id,
          nome: valores.nomeRepresentante,
          email: valores.emailRepresentante,
          whatsapp,
        })
      }
      form.reset()
      aoSalvar()
    } catch (e: unknown) {
      setGenericError(e instanceof Error ? e.message : 'Erro inesperado')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? 'Atualize as informações da empresa e do representante.'
            : 'Cadastre uma nova empresa e seu representante.'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome da empresa
          </label>
          <Input
            id="nome"
            {...form.register('nome')}
            placeholder="Ex: Atacadão S/A"
            className={form.formState.errors.nome ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {form.formState.errors.nome && (
            <p className="text-[13px] text-destructive font-medium">{form.formState.errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-4 rounded-md border p-4 bg-muted/10">
          <div>
            <h3 className="font-medium">Representante Principal</h3>
            <p className="text-xs text-muted-foreground">Quem responderá pelas cotações desta empresa.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="nomeRepresentante" className="text-sm font-medium">
              Nome do representante
            </label>
            <Input
              id="nomeRepresentante"
              {...form.register('nomeRepresentante')}
              placeholder="Ex: João Silva"
              className={form.formState.errors.nomeRepresentante ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {form.formState.errors.nomeRepresentante && (
              <p className="text-[13px] text-destructive font-medium">{form.formState.errors.nomeRepresentante.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="emailRepresentante" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="emailRepresentante"
                type="email"
                {...form.register('emailRepresentante')}
                placeholder="joao@atacadao.com"
                className={form.formState.errors.emailRepresentante ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {form.formState.errors.emailRepresentante && (
                <p className="text-[13px] text-destructive font-medium">{form.formState.errors.emailRepresentante.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="whatsappRepresentante" className="text-sm font-medium">
                WhatsApp <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <Input
                id="whatsappRepresentante"
                {...form.register('whatsappRepresentante')}
                placeholder="(11) 99999-9999"
                className={form.formState.errors.whatsappRepresentante ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {form.formState.errors.whatsappRepresentante && (
                <p className="text-[13px] text-destructive font-medium">{form.formState.errors.whatsappRepresentante.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {genericError && (
        <div role="alert" className="text-[13px] text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {genericError}
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2 border-t">
        <Button type="button" variant="ghost" onClick={aoSalvar} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
