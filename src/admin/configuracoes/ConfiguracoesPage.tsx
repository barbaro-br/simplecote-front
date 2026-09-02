import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { configuracaoSchema, type Configuracao, type ConfiguracaoFormValues } from './configuracoes.schema'
import { useConfiguracaoLoja, useAtualizarConfiguracao } from './configuracoes.api'

function ConfiguracoesForm({ configuracaoInicial }: { configuracaoInicial: Configuracao }) {
  const atualizar = useAtualizarConfiguracao()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<ConfiguracaoFormValues>({
    resolver: zodResolver(configuracaoSchema),
    defaultValues: configuracaoInicial,
  })

  async function aoEnviar(valores: ConfiguracaoFormValues) {
    setErro(null)
    try {
      await atualizar.mutateAsync(valores)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome da loja
        </label>
        <Input
          id="nome"
          {...form.register('nome')}
          placeholder="Ex: Sara Supermercado"
          className={form.formState.errors.nome ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {form.formState.errors.nome && (
          <p className="text-[13px] text-destructive font-medium">{form.formState.errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="corPrimaria" className="text-sm font-medium">
          Cor de marca
        </label>
        <div className="flex items-center gap-3">
          <Input
            id="corPrimaria"
            type="color"
            {...form.register('corPrimaria')}
            className="h-9 w-16 cursor-pointer p-1"
          />
          <span className="text-sm text-muted-foreground font-mono">{form.watch('corPrimaria')}</span>
        </div>
        <p className="text-xs text-muted-foreground">Usada como cor primária (botões, foco e destaques).</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="telefone" className="text-sm font-medium">
          Telefone da loja
        </label>
        <Input
          id="telefone"
          {...form.register('telefone')}
          placeholder="(11) 99999-9999"
          className={form.formState.errors.telefone ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {form.formState.errors.telefone && (
          <p className="text-[13px] text-destructive font-medium">{form.formState.errors.telefone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="layoutEmail" className="text-sm font-medium">
          Layout de e-mail
        </label>
        <textarea
          id="layoutEmail"
          {...form.register('layoutEmail')}
          rows={6}
          className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground/70 ${
            form.formState.errors.layoutEmail ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
          placeholder="Texto/template usado nos e-mails enviados aos representantes."
        />
        {form.formState.errors.layoutEmail && (
          <p className="text-[13px] text-destructive font-medium">{form.formState.errors.layoutEmail.message}</p>
        )}
      </div>

      {erro && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
        >
          <AlertTriangle className="size-4 shrink-0" />
          {erro}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t">
        <Button type="submit" disabled={atualizar.isPending}>
          {atualizar.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

export function ConfiguracoesPage() {
  const { data, isLoading, error } = useConfiguracaoLoja()

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando configurações…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar configurações: {error.message}</p>
  if (!data) return null

  return (
    <PageContainer maxWidth="lg" className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Nome, cor de marca, telefone e layout de e-mail da loja.
        </p>
      </div>

      <Card className="p-8">
        <ConfiguracoesForm configuracaoInicial={data} />
      </Card>
    </PageContainer>
  )
}
