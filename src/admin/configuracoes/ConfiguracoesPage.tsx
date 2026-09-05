import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Check, Copy, Store, Palette, Sliders } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { aplicarMascaraTelefone } from '@/shared/utils/telefone'
import { configuracaoSchema, type Configuracao, type ConfiguracaoFormValues } from './configuracoes.schema'
import { useConfiguracaoLoja, useAtualizarConfiguracao } from './configuracoes.api'

function ConfiguracoesForm({ configuracaoInicial }: { configuracaoInicial: Configuracao }) {
  const atualizar = useAtualizarConfiguracao()

  const form = useForm<ConfiguracaoFormValues>({
    resolver: zodResolver(configuracaoSchema),
    defaultValues: {
      ...configuracaoInicial,
      telefone: aplicarMascaraTelefone(configuracaoInicial.telefone),
    },
  })

  const { errors } = form.formState
  const corPrimaria = useWatch({ control: form.control, name: 'corPrimaria' })

  async function aoEnviar(valores: ConfiguracaoFormValues) {
    try {
      await atualizar.mutateAsync(valores)
      toast.success('Configurações salvas com sucesso!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro inesperado ao salvar configurações.')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="flex flex-col h-full">
      <Tabs defaultValue="geral" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="geral" className="flex gap-2"><Store className="size-4" /> Geral</TabsTrigger>
          <TabsTrigger value="aparencia" className="flex gap-2"><Palette className="size-4" /> Aparência</TabsTrigger>
          <TabsTrigger value="avancado" className="flex gap-2"><Sliders className="size-4" /> Avançado</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-[320px]">
          {/* ABA GERAL */}
          <TabsContent value="geral" className="space-y-6 mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">Nome da loja</label>
                <Input id="nome" {...form.register('nome')} placeholder="Ex: Sara Supermercado" className={errors.nome ? 'border-destructive' : ''} />
                {errors.nome && <p className="text-[13px] text-destructive">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="telefone" className="text-sm font-medium">Telefone da loja</label>
                <Input
                  id="telefone"
                  {...form.register('telefone', {
                    onChange: (e) => form.setValue('telefone', aplicarMascaraTelefone(e.target.value), { shouldValidate: true }),
                  })}
                  placeholder="(11) 99999-9999"
                  className={errors.telefone ? 'border-destructive' : ''}
                />
                {errors.telefone && <p className="text-[13px] text-destructive">{errors.telefone.message}</p>}
              </div>
            </div>

            <div className="pt-4">
              <LinkColaboradorSection token={configuracaoInicial.linkColaboradorToken} />
            </div>
          </TabsContent>

          {/* ABA APARÊNCIA */}
          <TabsContent value="aparencia" className="space-y-6 mt-0">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <label htmlFor="corPrimaria" className="text-sm font-medium">Cor de marca</label>
                <div className="flex items-center gap-3">
                  <Input id="corPrimaria" type="color" {...form.register('corPrimaria')} className="h-9 w-16 cursor-pointer p-1" />
                  <span className="text-sm text-muted-foreground font-mono">{corPrimaria}</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-sm font-medium">Tema do Painel</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" value="CLARO" {...form.register('tema')} /> Claro</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" value="ESCURO" {...form.register('tema')} /> Escuro</label>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-sm font-medium">Estilo de navegação</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" value="LATERAL" {...form.register('estiloNavegacao')} /> Lateral</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" value="INFERIOR" {...form.register('estiloNavegacao')} /> Inferior</label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA AVANÇADO */}
          <TabsContent value="avancado" className="space-y-6 mt-0">
            <div className="space-y-3">
              <label htmlFor="layoutEmail" className="text-sm font-medium">Layout de e-mail</label>
              <textarea
                id="layoutEmail"
                {...form.register('layoutEmail')}
                rows={4}
                className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none ${errors.layoutEmail ? 'border-destructive' : ''}`}
                placeholder="Texto/template usado nos e-mails enviados aos representantes."
              />
              {errors.layoutEmail && <p className="text-[13px] text-destructive">{errors.layoutEmail.message}</p>}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* BOTÃO FIXO NO RODAPÉ DO CARD */}
      <div className="flex justify-end pt-6 mt-auto border-t">
        <Button type="submit" disabled={atualizar.isPending} className="min-w-[140px]">
          {atualizar.isPending ? 'Salvando…' : 'Salvar configurações'}
        </Button>
      </div>
    </form>
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
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div>
        <label htmlFor="link-colaborador" className="text-sm font-medium">Link do colaborador</label>
        <p className="text-xs text-muted-foreground mt-1">
          Compartilhe este link com o time para adicionarem itens à cotação.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input id="link-colaborador" value={link} readOnly className="font-mono text-xs bg-background h-9" />
        <Button type="button" variant="secondary" onClick={copiar} className="h-9 shrink-0">
          {copiado ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
          {copiado ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
    </div>
  )
}

export function ConfiguracoesPage() {
  const { data, isLoading, error } = useConfiguracaoLoja()

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando…</p>
  if (error) return <p className="p-6 text-destructive">Erro: {error.message}</p>
  if (!data) return null

  return (
    <PageContainer maxWidth="md" className="h-[calc(100vh-80px)] overflow-hidden">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie as preferências da sua loja.</p>
      </div>

      <Card className="p-6 h-[520px] flex flex-col">
        <ConfiguracoesForm configuracaoInicial={data} />
      </Card>
    </PageContainer>
  )
}