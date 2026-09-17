import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'

import { convidarSchema, type ConvidarValues } from './organizacao.schema'
import { useConvidar } from './organizacao.api'
import { ROTULO_PAPEL } from '@/shared/domain/papel'

export function ConvidarMembroDialog({ aoFechar }: { aoFechar: () => void }) {
  const convidar = useConvidar()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<ConvidarValues>({
    resolver: zodResolver(convidarSchema),
    defaultValues: { email: '', papel: 'OPERADOR' },
  })

  async function aoEnviar(v: ConvidarValues) {
    setErro(null)
    try {
      await convidar.mutateAsync(v)
      aoFechar()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro inesperado ao convidar.')
    }
  }

  const err = form.formState.errors

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="convite-email"
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
            >
              E-mail
            </label>
            <input
              id="convite-email"
              type="email"
              autoComplete="email"
              placeholder="pessoa@empresa.com.br"
              {...form.register('email')}
              disabled={convidar.isPending}
              className="w-full bg-[#131b15] border border-white/15 rounded-none px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium disabled:opacity-50"
            />
            {err.email && <p className="text-[11px] text-rose-400 font-medium">{err.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="convite-papel"
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Papel
            </label>
            <div className="relative">
              <select
                id="convite-papel"
                {...form.register('papel')}
                disabled={convidar.isPending}
                className="w-full bg-[#131b15] border border-white/15 rounded-none px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="ADMIN" className="bg-[#131b15] text-on-surface">
                  {ROTULO_PAPEL.ADMIN}
                </option>
                <option value="OPERADOR" className="bg-[#131b15] text-on-surface">
                  {ROTULO_PAPEL.OPERADOR}
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                <svg className="size-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {err.papel && <p className="text-[11px] text-rose-400 font-medium">{err.papel.message}</p>}
          </div>
        </div>

        {erro && (
          <div
            role="alert"
            className="rounded-none border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300"
          >
            {erro}
          </div>
        )}

        {/* RODAPÉ */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={aoFechar}
            disabled={convidar.isPending}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={convidar.isPending}
            className="px-5 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {convidar.isPending ? 'Enviando…' : 'Convidar'}
          </button>
        </div>
      </form>
  )
}
