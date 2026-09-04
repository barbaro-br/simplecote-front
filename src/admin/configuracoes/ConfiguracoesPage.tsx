import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { AlertTriangle, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
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
        <span className="text-sm font-medium">Estilo de navegação</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="LATERAL" {...form.register('estiloNavegacao')} />
            Lateral
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="INFERIOR" {...form.register('estiloNavegacao')} />
            Inferior
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Como a navegação do painel é exibida (sidebar lateral ou barra inferior).</p>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Tema</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="CLARO" {...form.register('tema')} />
            Claro
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="ESCURO" {...form.register('tema')} />
            Escuro
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Aparência do painel (claro ou escuro) para todos os usuários da loja.</p>
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

      <Card className="p-8">
        <LinkColaboradorSection token={data.linkColaboradorToken} />
      </Card>
    </PageContainer>
  )
}

function LinkColaboradorSection({ token }: { token: string }) {
  const [copiado, setCopiado] = useState(false)
  const link = `${window.location.origin}/colaborador/${token}`

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="linkColaborador" className="text-sm font-medium">
        Link do colaborador
      </label>
      <p className="text-xs text-muted-foreground">
        Compartilhe este link com o time da loja para adicionarem itens à cotação em rascunho.
      </p>
      <div className="flex items-center gap-2">
        <Input id="linkColaborador" value={link} readOnly className="font-mono text-xs" />
        <Button type="button" variant="outline" onClick={copiar} className="shrink-0">
          {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copiado ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
    </div>
  )
}
