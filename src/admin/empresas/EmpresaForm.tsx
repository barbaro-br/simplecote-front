import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { empresaSchema, type EmpresaFormValues, type Empresa } from './empresas.schema'
import { useCriarEmpresa, useAtualizarEmpresa, useCriarRepresentante } from './empresas.api'
import { apenasNumeros } from '@/shared/utils/cnpj'

export function EmpresaForm({ 
  aoSalvar, 
  empresaParaEditar 
}: { 
  aoSalvar: () => void, 
  empresaParaEditar?: Empresa 
}) {
  const isEdit = !!empresaParaEditar
  const criarEmpresa = useCriarEmpresa()
  const atualizarEmpresa = useAtualizarEmpresa()
  const criarRepresentante = useCriarRepresentante()
  const [genericError, setGenericError] = useState<string | null>(null)
  
  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: { 
      nome: empresaParaEditar?.nome ?? '',
      nomeRepresentante: '',
      emailRepresentante: '',
      whatsappRepresentante: ''
    },
  })

  const isPending = criarEmpresa.isPending || atualizarEmpresa.isPending || criarRepresentante.isPending

  async function aoEnviar(valores: EmpresaFormValues) {
    setGenericError(null)
    try {
      if (isEdit) {
        await atualizarEmpresa.mutateAsync({ id: empresaParaEditar.id, valores: { nome: valores.nome } })
      } else {
        // Validation for create
        if (!valores.nomeRepresentante || !valores.emailRepresentante) {
          if (!valores.nomeRepresentante) form.setError('nomeRepresentante', { message: 'Obrigatório na criação' })
          if (!valores.emailRepresentante) form.setError('emailRepresentante', { message: 'Obrigatório na criação' })
          return
        }

        const empresaCriada = await criarEmpresa.mutateAsync({ nome: valores.nome })
        
        try {
          await criarRepresentante.mutateAsync({
            empresaId: empresaCriada.id,
            nome: valores.nomeRepresentante,
            email: valores.emailRepresentante,
            whatsapp: valores.whatsappRepresentante ? apenasNumeros(valores.whatsappRepresentante) : undefined
          })
        } catch (repError: any) {
          setGenericError(`Empresa criada, mas erro ao salvar o representante: ${repError.message}`)
          return // do not call aoSalvar so user can see the error
        }
      }
      form.reset()
      aoSalvar()
    } catch (e: any) {
      setGenericError(e.message || 'Erro inesperado')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-4 rounded-md border p-4 bg-muted/20">
      <h2 className="text-lg font-medium">{isEdit ? 'Editar Empresa' : 'Novo Fornecedor'}</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Dados da Empresa</h3>
          <Input {...form.register('nome')} placeholder="Nome da empresa (ex: Atacadão)" />
          {form.formState.errors.nome && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.nome.message}</p>
          )}
        </div>

        {!isEdit && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Representante Principal</h3>
            
            <div>
              <Input {...form.register('nomeRepresentante')} placeholder="Nome do representante" />
              {form.formState.errors.nomeRepresentante && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.nomeRepresentante.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input type="email" {...form.register('emailRepresentante')} placeholder="E-mail" />
                {form.formState.errors.emailRepresentante && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.emailRepresentante.message}</p>
                )}
              </div>
              <div>
                <Input {...form.register('whatsappRepresentante')} placeholder="WhatsApp (opcional)" />
                {form.formState.errors.whatsappRepresentante && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.whatsappRepresentante.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {genericError && <p className="text-sm text-destructive">{genericError}</p>}

      <div className="flex gap-2 justify-end mt-6">
        <Button type="button" variant="outline" onClick={aoSalvar} disabled={isPending}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
