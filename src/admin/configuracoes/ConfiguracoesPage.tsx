import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import {
  Check,
  Copy,
  CreditCard,
  Gear,
  Palette,
  ShieldCheck,
  Sliders,
  Storefront,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { aplicarMascaraTelefone } from '@/shared/utils/telefone'
import { useAuth } from '@/shared/auth/useAuth'
import {
  configuracaoSchema,
  type Configuracao,
  type ConfiguracaoFormValues,
} from './configuracoes.schema'
import { useConfiguracaoLoja, useAtualizarConfiguracao } from './configuracoes.api'
import { ExportarDadosCard } from './ExportarDadosCard'
import { EncerrarContaCard } from './EncerrarContaCard'
import { CondicoesPagamentoSecao } from '../condicoes-pagamento/CondicoesPagamentoSecao'

function ConfiguracoesForm({ configuracaoInicial }: { configuracaoInicial: Configuracao }) {
  const atualizar = useAtualizarConfiguracao()
  const { papel } = useAuth()
  const mostrarDados = papel === 'OWNER' || papel === 'ADMIN'

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
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-6">
      <Tabs defaultValue="geral">
        {/* BARRA DE ABAS CONTÁBIL */}
        <div className="rounded-none border border-white/15 bg-[#0d1410] p-1.5 shadow-md">
          <TabsList
            className={`grid w-full gap-1 bg-transparent p-0 ${mostrarDados ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}
          >
            <TabsTrigger
              value="geral"
              className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-none data-[state=active]:bg-[#16211a] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
            >
              <Storefront className="size-4" weight="bold" />
              <span>Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="aparencia"
              className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-none data-[state=active]:bg-[#16211a] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
            >
              <Palette className="size-4" weight="bold" />
              <span>Aparência</span>
            </TabsTrigger>
            <TabsTrigger
              value="pagamento"
              className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-none data-[state=active]:bg-[#16211a] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
            >
              <CreditCard className="size-4" weight="bold" />
              <span>Cond. Pagamento</span>
            </TabsTrigger>
            <TabsTrigger
              value="avancado"
              className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-none data-[state=active]:bg-[#16211a] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
            >
              <Sliders className="size-4" weight="bold" />
              <span>Avançado</span>
            </TabsTrigger>
            {mostrarDados && (
              <TabsTrigger
                value="dados"
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-none data-[state=active]:bg-[#16211a] data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all col-span-2 sm:col-span-1"
              >
                <ShieldCheck className="size-4" weight="bold" />
                <span>Dados</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="mt-6">
          {/* ABA GERAL */}
          <TabsContent value="geral" className="space-y-6 mt-0">
            {/* Bloco Dados Cadastrais */}
            <div className="rounded-none border border-white/15 bg-[#0d1410] p-6 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                  INFORMAÇÕES DA EMPRESA
                </span>
                <h2 className="text-base font-bold text-on-surface mt-0.5">Identificação da loja</h2>
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  Estes dados aparecem nos convites e cabeçalhos de cotações para os representantes.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="nome"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Nome da loja
                  </label>
                  <input
                    id="nome"
                    {...form.register('nome')}
                    placeholder="Ex: Sara Supermercado"
                    className={`w-full bg-[#131b15] border rounded-none px-3.5 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium ${errors.nome ? 'border-rose-500' : 'border-white/15'}`}
                  />
                  {errors.nome && <p className="text-[11px] text-rose-400 font-medium">{errors.nome.message}</p>}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="telefone"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Telefone da loja
                  </label>
                  <input
                    id="telefone"
                    {...form.register('telefone', {
                      onChange: (e) =>
                        form.setValue('telefone', aplicarMascaraTelefone(e.target.value), {
                          shouldValidate: true,
                        }),
                    })}
                    placeholder="(11) 99999-9999"
                    className={`w-full bg-[#131b15] border rounded-none px-3.5 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium font-mono ${errors.telefone ? 'border-rose-500' : 'border-white/15'}`}
                  />
                  {errors.telefone && (
                    <p className="text-[11px] text-rose-400 font-medium">{errors.telefone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bloco Link do Colaborador */}
            <LinkColaboradorSection token={configuracaoInicial.linkColaboradorToken} />

            {/* Botão Salvar */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={atualizar.isPending}
                className="px-6 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {atualizar.isPending ? 'Salvando…' : 'Salvar configurações'}
              </button>
            </div>
          </TabsContent>

          {/* ABA APARÊNCIA */}
          <TabsContent value="aparencia" className="space-y-6 mt-0">
            <div className="rounded-none border border-white/15 bg-[#0d1410] p-6 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                  CUSTOMIZAÇÃO VISUAL
                </span>
                <h2 className="text-base font-bold text-on-surface mt-0.5">Identidade e navegação</h2>
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  Defina as cores e o layout preferido para os operadores do painel.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Cor de Marca */}
                <div className="rounded-none border border-white/10 bg-[#131b15] p-4 space-y-3">
                  <label
                    htmlFor="corPrimaria"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Cor de marca
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="corPrimaria"
                      type="color"
                      {...form.register('corPrimaria')}
                      className="h-9 w-16 cursor-pointer bg-transparent border border-white/20 rounded-none p-1"
                    />
                    <span className="text-xs font-mono font-bold text-on-surface uppercase">
                      {corPrimaria}
                    </span>
                  </div>
                </div>

                {/* Tema do Painel */}
                <div className="rounded-none border border-white/10 bg-[#131b15] p-4 space-y-3">
                  <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    Tema do Painel
                  </span>
                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer text-on-surface hover:text-primary transition-colors">
                      <input
                        type="radio"
                        value="CLARO"
                        {...form.register('tema')}
                        className="accent-primary"
                      />
                      Claro
                    </label>
                    <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer text-on-surface hover:text-primary transition-colors">
                      <input
                        type="radio"
                        value="ESCURO"
                        {...form.register('tema')}
                        className="accent-primary"
                      />
                      Escuro
                    </label>
                  </div>
                </div>

                {/* Estilo de Navegação */}
                <div className="rounded-none border border-white/10 bg-[#131b15] p-4 space-y-3">
                  <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    Estilo de navegação
                  </span>
                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer text-on-surface hover:text-primary transition-colors">
                      <input
                        type="radio"
                        value="LATERAL"
                        {...form.register('estiloNavegacao')}
                        className="accent-primary"
                      />
                      Lateral
                    </label>
                    <label className="flex items-center gap-2 text-xs font-mono uppercase cursor-pointer text-on-surface hover:text-primary transition-colors">
                      <input
                        type="radio"
                        value="INFERIOR"
                        {...form.register('estiloNavegacao')}
                        className="accent-primary"
                      />
                      Inferior
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={atualizar.isPending}
                className="px-6 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {atualizar.isPending ? 'Salvando…' : 'Salvar configurações'}
              </button>
            </div>
          </TabsContent>

          {/* ABA CONDIÇÕES DE PAGAMENTO */}
          <TabsContent value="pagamento" className="mt-0">
            <div className="rounded-none border border-white/15 bg-[#0d1410] p-6 shadow-xl">
              <CondicoesPagamentoSecao />
            </div>
          </TabsContent>

          {/* ABA AVANÇADO */}
          <TabsContent value="avancado" className="space-y-6 mt-0">
            <div className="rounded-none border border-white/15 bg-[#0d1410] p-6 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                  PARÂMETROS AVANÇADOS
                </span>
                <h2 className="text-base font-bold text-on-surface mt-0.5">Apuração e Comunicação</h2>
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  Ajustes finos no cálculo de margem e templates de notificação aos fornecedores.
                </p>
              </div>

              {/* Margem de Lucro */}
              <div className="rounded-none border border-white/10 bg-[#131b15] p-5 space-y-2">
                <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider cursor-pointer text-on-surface hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    {...form.register('mostrarMargemLucro')}
                    className="size-4 rounded-none accent-primary cursor-pointer"
                  />
                  <span>Mostrar margem de lucro na apuração</span>
                </label>
                <p className="text-xs text-on-surface-variant/70 pl-7">
                  Adiciona um campo de margem (%) e a coluna "Preço de venda" na tela de Resultado da
                  apuração. Desativado por padrão.
                </p>
              </div>

              {/* Layout de E-mail */}
              <div className="space-y-2">
                <label
                  htmlFor="layoutEmail"
                  className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                >
                  Layout de e-mail
                </label>
                <textarea
                  id="layoutEmail"
                  {...form.register('layoutEmail')}
                  rows={5}
                  className={`w-full rounded-none border bg-[#131b15] px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${errors.layoutEmail ? 'border-rose-500' : 'border-white/15'}`}
                  placeholder="Texto/template usado nos e-mails enviados aos representantes."
                />
                {errors.layoutEmail && (
                  <p className="text-[11px] text-rose-400 font-medium">{errors.layoutEmail.message}</p>
                )}
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={atualizar.isPending}
                className="px-6 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                {atualizar.isPending ? 'Salvando…' : 'Salvar configurações'}
              </button>
            </div>
          </TabsContent>

          {/* ABA DADOS & PRIVACIDADE */}
          {mostrarDados && (
            <TabsContent value="dados" className="space-y-6 mt-0">
              <div className="rounded-none border border-white/15 bg-[#0d1410] p-6 shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                    SEGURANÇA & PRIVACIDADE
                  </span>
                  <h2 className="text-base font-bold text-on-surface mt-0.5">
                    Dados da organização
                  </h2>
                  <p className="text-xs text-on-surface-variant/70 mt-1">
                    Exportações de relatórios e encerramento de conta da loja.
                  </p>
                </div>

                <div className="space-y-6">
                  <ExportarDadosCard />
                  <EncerrarContaCard />
                </div>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
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
    <div className="rounded-none border border-white/15 bg-[#0d1410] p-6 shadow-xl space-y-4">
      <div className="border-b border-white/10 pb-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
          ACESSO DIRETO
        </span>
        <label
          htmlFor="link-colaborador"
          className="block text-base font-bold text-on-surface mt-0.5"
        >
          Link do colaborador
        </label>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Compartilhe este link com seu time de estoque e compras para sugerirem e adicionarem itens
          à cotação.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          id="link-colaborador"
          value={link}
          readOnly
          className="w-full bg-[#131b15] border border-white/15 rounded-none px-3.5 py-2.5 text-xs text-on-surface font-mono select-all focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={copiar}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-white/10 hover:bg-white/15 text-on-surface font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
        >
          {copiado ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

export function ConfiguracoesPage() {
  const { data, isLoading, error } = useConfiguracaoLoja()

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-white/15 bg-[#0d1410] p-8 text-center text-on-surface-variant">
          <p className="text-sm">Carregando configurações…</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          <p className="text-sm font-semibold">Erro: {error.message}</p>
        </div>
      </PageContainer>
    )
  }

  if (!data) return null

  return (
    <PageContainer maxWidth="5xl" className="space-y-6 pb-10 text-on-surface">
      {/* CABEÇALHO PLANILHA CONTÁBIL */}
      <div className="rounded-none border border-white/15 bg-[#0d1410] p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(78,222,163,0.25)]">
              <Gear className="text-2xl" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                  Configurações do sistema
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                  {data.nome}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">
                Gerencie as preferências da loja, canais de comunicação e identidade visual.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfiguracoesForm configuracaoInicial={data} />
    </PageContainer>
  )
}
