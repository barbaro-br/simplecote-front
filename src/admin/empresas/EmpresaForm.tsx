import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import {
  Buildings,
  CurrencyDollar,
  User,
  Envelope,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { empresaSchema, type EmpresaFormValues, type Empresa } from './empresas.schema'
import { useCriarEmpresa, useAtualizarEmpresa } from './empresas.api'
import { useCriarRepresentante, useAtualizarRepresentante } from '../representantes/representantes.api'
import type { Representante } from '../representantes/representantes.schema'
import { apenasNumeros } from '@/shared/utils/cnpj'
import { aplicarMascaraTelefone } from '@/shared/utils/telefone'

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
  const [empresaIdCriada, setEmpresaIdCriada] = useState<string | null>(null)

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: empresaParaEditar?.nome ?? '',
      pedidoMinimo: empresaParaEditar?.pedidoMinimo ?? null,
      nomeRepresentante: representanteParaEditar?.nome ?? '',
      emailRepresentante: representanteParaEditar?.email ?? '',
      whatsappRepresentante: aplicarMascaraTelefone(representanteParaEditar?.whatsapp ?? ''),
    },
  })

  const isPending =
    criarEmpresa.isPending ||
    atualizarEmpresa.isPending ||
    criarRepresentante.isPending ||
    atualizarRepresentante.isPending

  async function aoEnviar(valores: EmpresaFormValues) {
    setGenericError(null)
    const nomeEmpresa = valores.nome.trim().toUpperCase()
    const nomeRepresentante = valores.nomeRepresentante.trim().toUpperCase()
    const whatsapp = valores.whatsappRepresentante
      ? apenasNumeros(valores.whatsappRepresentante)
      : undefined
    try {
      if (isEdit) {
        await atualizarEmpresa.mutateAsync({
          id: empresaParaEditar.id,
          valores: { nome: nomeEmpresa, pedidoMinimo: valores.pedidoMinimo },
        })
        if (representanteParaEditar) {
          await atualizarRepresentante.mutateAsync({
            id: representanteParaEditar.id,
            body: {
              nome: nomeRepresentante,
              email: valores.emailRepresentante,
              whatsapp,
            },
          })
        } else {
          await criarRepresentante.mutateAsync({
            empresaId: empresaParaEditar.id,
            nome: nomeRepresentante,
            email: valores.emailRepresentante,
            whatsapp,
          })
        }
      } else {
        let empresaId = empresaIdCriada
        if (!empresaId) {
          const empresaCriada = await criarEmpresa.mutateAsync({
            nome: nomeEmpresa,
            pedidoMinimo: valores.pedidoMinimo,
          })
          empresaId = empresaCriada.id
          setEmpresaIdCriada(empresaId)
        }
        try {
          await criarRepresentante.mutateAsync({
            empresaId,
            nome: nomeRepresentante,
            email: valores.emailRepresentante,
            whatsapp,
          })
        } catch (e: unknown) {
          const motivo = e instanceof Error ? e.message : 'Erro inesperado'
          setGenericError(
            `Empresa criada, mas houve falha ao cadastrar o representante (${motivo}). Tente salvar novamente.`,
          )
          return
        }
      }
      form.reset()
      setEmpresaIdCriada(null)
      aoSalvar()
    } catch (e: unknown) {
      setGenericError(e instanceof Error ? e.message : 'Erro inesperado')
    }
  }

  return (
    <div className="bg-[#0d1410] border border-white/15 text-[#dde4dd] shadow-2xl overflow-visible font-mono">
      {/* Cabeçalho estilo planilha contábil */}
      <div className="bg-[#131b15] border-b border-white/15 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <Buildings className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#dde4dd] uppercase tracking-wider">
                {isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </span>
              <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-semibold bg-primary/15 text-primary border border-primary/30">
                PLANILHA
              </span>
            </div>
            <p className="text-[11px] font-mono text-on-surface-variant/70">
              {isEdit
                ? 'Atualize os dados cadastrais da empresa e de seu representante comercial.'
                : 'Preencha os dados da empresa e vincule o contato comercial responsável.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={aoSalvar}
          aria-label="Fechar"
          className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(aoEnviar)} className="p-4 space-y-4" noValidate>
        {/* GRADE PLANILHADA DE ENTRADA DE DADOS */}
        <div className="border border-white/15 divide-y divide-white/15 bg-[#080d0a]">
          {/* LINHA 1: Nome da empresa */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            <div className="sm:w-48 bg-[#131b15] p-3 flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase shrink-0">
              <label htmlFor="nome" className="flex items-center gap-1.5 cursor-pointer">
                <Buildings className="size-4 text-primary" />
                <span>Nome da empresa</span>
              </label>
            </div>
            <div className="flex-1 bg-[#0d1410] p-2.5">
              <Input
                id="nome"
                {...form.register('nome')}
                placeholder="Ex: ATACADÃO DISTRIBUIDORA S/A"
                className={`uppercase font-semibold bg-[#16201a] text-[#dde4dd] placeholder:text-on-surface-variant/40 text-xs rounded-none border-white/15 focus-visible:border-primary focus-visible:bg-[#1a251f] focus-visible:ring-0 w-full ${
                  form.formState.errors.nome ? 'border-destructive' : ''
                }`}
              />
              {form.formState.errors.nome && (
                <p className="text-[11px] font-mono text-destructive mt-1">{form.formState.errors.nome.message}</p>
              )}
            </div>
          </div>

          {/* LINHA 2: Pedido Mínimo Padrão */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            <div className="sm:w-48 bg-[#131b15] p-3 flex items-center justify-between sm:justify-start gap-2 text-xs font-mono font-semibold text-primary uppercase shrink-0">
              <label htmlFor="pedidoMinimo" className="flex items-center gap-1.5 cursor-pointer">
                <CurrencyDollar className="size-4 text-primary" />
                <span>Pedido Mínimo</span>
              </label>
              <span className="text-[10px] text-on-surface-variant/50 font-normal lowercase">(opcional)</span>
            </div>
            <div className="flex-1 bg-[#0d1410] p-2.5">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-mono font-bold text-on-surface-variant/60 pointer-events-none">
                  R$
                </span>
                <Input
                  id="pedidoMinimo"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('pedidoMinimo', {
                    setValueAs: (v) => (v === '' || v === null || isNaN(Number(v)) ? null : Number(v)),
                  })}
                  placeholder="0,00"
                  className={`pl-9 font-mono font-bold text-xs bg-[#16201a] text-[#dde4dd] placeholder:text-on-surface-variant/40 rounded-none border-white/15 focus-visible:border-primary focus-visible:bg-[#1a251f] focus-visible:ring-0 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    form.formState.errors.pedidoMinimo ? 'border-destructive' : ''
                  }`}
                />
              </div>
              {form.formState.errors.pedidoMinimo && (
                <p className="text-[11px] font-mono text-destructive mt-1">{form.formState.errors.pedidoMinimo.message}</p>
              )}
            </div>
          </div>

          {/* LINHA 3: Representante Comercial */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            <div className="sm:w-48 bg-[#131b15] p-3 flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase shrink-0">
              <label htmlFor="nomeRepresentante" className="flex items-center gap-1.5 cursor-pointer">
                <User className="size-4 text-primary" />
                <span>Nome do representante</span>
              </label>
            </div>
            <div className="flex-1 bg-[#0d1410] p-2.5">
              <Input
                id="nomeRepresentante"
                {...form.register('nomeRepresentante')}
                placeholder="Ex: JOÃO CARLOS DA SILVA"
                className={`uppercase font-semibold bg-[#16201a] text-[#dde4dd] placeholder:text-on-surface-variant/40 text-xs rounded-none border-white/15 focus-visible:border-primary focus-visible:bg-[#1a251f] focus-visible:ring-0 w-full ${
                  form.formState.errors.nomeRepresentante ? 'border-destructive' : ''
                }`}
              />
              {form.formState.errors.nomeRepresentante && (
                <p className="text-[11px] font-mono text-destructive mt-1">{form.formState.errors.nomeRepresentante.message}</p>
              )}
            </div>
          </div>

          {/* LINHA 4: Contatos — E-mail e WhatsApp divididos em 2 colunas da planilha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            {/* Célula E-mail */}
            <div className="bg-[#0d1410] p-2.5 space-y-1.5">
              <label htmlFor="emailRepresentante" className="text-xs font-mono font-semibold text-primary uppercase flex items-center gap-1.5 cursor-pointer">
                <Envelope className="size-4 text-primary" />
                E-mail
              </label>
              <Input
                id="emailRepresentante"
                type="email"
                {...form.register('emailRepresentante')}
                placeholder="exemplo@fornecedor.com.br"
                className={`bg-[#16201a] text-[#dde4dd] placeholder:text-on-surface-variant/40 text-xs rounded-none border-white/15 focus-visible:border-primary focus-visible:bg-[#1a251f] focus-visible:ring-0 w-full ${
                  form.formState.errors.emailRepresentante ? 'border-destructive' : ''
                }`}
              />
              {form.formState.errors.emailRepresentante && (
                <p className="text-[11px] font-mono text-destructive">{form.formState.errors.emailRepresentante.message}</p>
              )}
            </div>

            {/* Célula WhatsApp */}
            <div className="bg-[#0d1410] p-2.5 space-y-1.5">
              <label htmlFor="whatsappRepresentante" className="text-xs font-mono font-semibold text-primary uppercase flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <WhatsappLogo className="size-4 text-primary" />
                  WhatsApp
                </span>
                <span className="text-[10px] text-on-surface-variant/50 font-normal lowercase">(opcional)</span>
              </label>
              <Input
                id="whatsappRepresentante"
                {...form.register('whatsappRepresentante', {
                  onChange: (e) =>
                    form.setValue('whatsappRepresentante', aplicarMascaraTelefone(e.target.value), {
                      shouldValidate: true,
                    }),
                })}
                placeholder="(11) 99999-9999"
                className={`font-mono bg-[#16201a] text-[#dde4dd] placeholder:text-on-surface-variant/40 text-xs rounded-none border-white/15 focus-visible:border-primary focus-visible:bg-[#1a251f] focus-visible:ring-0 w-full ${
                  form.formState.errors.whatsappRepresentante ? 'border-destructive' : ''
                }`}
              />
              {form.formState.errors.whatsappRepresentante && (
                <p className="text-[11px] font-mono text-destructive">{form.formState.errors.whatsappRepresentante.message}</p>
              )}
            </div>
          </div>
        </div>

        {genericError && (
          <div role="alert" className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-none">
            {genericError}
          </div>
        )}

        {/* RODAPÉ DA PLANILHA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/15">
          <span className="text-[11px] font-mono text-on-surface-variant/60 hidden sm:inline">
            * Razão social e contatos serão salvos em maiúsculas no cadastro contábil.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={aoSalvar}
              disabled={isPending}
              className="rounded-none border border-white/15 bg-transparent hover:bg-white/5 text-[#dde4dd] text-xs font-mono uppercase px-4 py-2 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase font-mono tracking-wider rounded-none px-6 py-2 shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer"
            >
              {isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
