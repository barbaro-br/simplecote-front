import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Check, Eye, EyeSlash, Key, X } from '@phosphor-icons/react'
import { z } from 'zod'
import { useRedefinirSenhaMembro } from './organizacao.api'

const SENHA_MIN = 8

export const redefinirSenhaFormSchema = z
  .object({
    senha: z.string().min(1, 'Informe a nova senha').min(SENHA_MIN, 'A senha deve ter ao menos 8 caracteres'),
    confirmar: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.senha === data.confirmar, {
    message: 'As senhas não coincidem',
    path: ['confirmar'],
  })

export type RedefinirSenhaFormValues = z.infer<typeof redefinirSenhaFormSchema>

type Props = {
  usuarioId: string
  usuarioNome: string
  aoSalvar: () => void
}

export function RedefinirSenhaForm({ usuarioId, usuarioNome, aoSalvar }: Props) {
  const redefinir = useRedefinirSenhaMembro()
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)

  const form = useForm<RedefinirSenhaFormValues>({
    resolver: zodResolver(redefinirSenhaFormSchema),
    defaultValues: { senha: '', confirmar: '' },
  })

  const senha = useWatch({ control: form.control, name: 'senha' }) ?? ''
  const confirmar = useWatch({ control: form.control, name: 'confirmar' }) ?? ''
  const senhaValida = senha.length >= SENHA_MIN
  const coincidem = confirmar !== '' && confirmar === senha

  const err = form.formState.errors

  async function aoEnviar(v: RedefinirSenhaFormValues) {
    setErro(null)
    try {
      await redefinir.mutateAsync({ id: usuarioId, senha: v.senha })
      aoSalvar()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.problem.detail : 'Erro inesperado ao trocar a senha.')
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto rounded-none border border-white/15 bg-[#0d1410] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-on-surface">
      {/* CABEÇALHO DO MODAL */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#131b15]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <Key className="text-xl" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
                SEGURANÇA
              </span>
            </div>
            <h2 className="text-base font-bold text-on-surface tracking-tight">Trocar senha</h2>
            <p className="text-xs text-on-surface-variant font-mono">{usuarioNome}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={aoSalvar}
          aria-label="Fechar"
          className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="nova-senha"
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Nova senha
            </label>
            <div className="relative">
              <input
                id="nova-senha"
                type={mostrarNovaSenha ? 'text' : 'password'}
                {...form.register('senha')}
                placeholder="Mínimo 8 caracteres"
                disabled={redefinir.isPending}
                className="w-full bg-[#131b15] border border-white/15 rounded-none pl-3 pr-10 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setMostrarNovaSenha((v) => !v)}
                aria-label={mostrarNovaSenha ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer"
                disabled={redefinir.isPending}
              >
                {mostrarNovaSenha ? (
                  <EyeSlash className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            {err.senha && (
              <p className="text-[11px] text-rose-400 font-medium">{err.senha.message}</p>
            )}
            <p
              className={`flex items-center gap-1.5 text-[11px] font-mono ${senhaValida ? 'text-success' : 'text-muted-foreground'}`}
            >
              {senhaValida && <Check className="size-3.5" aria-hidden />}
              8+ caracteres
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmar-senha"
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="confirmar-senha"
                type={mostrarConfirmarSenha ? 'text' : 'password'}
                {...form.register('confirmar')}
                placeholder="Repita a nova senha"
                disabled={redefinir.isPending}
                className="w-full bg-[#131b15] border border-white/15 rounded-none pl-3 pr-10 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarSenha((v) => !v)}
                aria-label={mostrarConfirmarSenha ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer"
                disabled={redefinir.isPending}
              >
                {mostrarConfirmarSenha ? (
                  <EyeSlash className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            {err.confirmar && (
              <p className="text-[11px] text-rose-400 font-medium">{err.confirmar.message}</p>
            )}
            {confirmar !== '' && (
              <p
                className={`flex items-center gap-1.5 text-[11px] font-mono ${coincidem ? 'text-success' : 'text-muted-foreground'}`}
              >
                {coincidem && <Check className="size-3.5" aria-hidden />}
                {coincidem ? 'As senhas coincidem' : 'As senhas ainda não coincidem'}
              </p>
            )}
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
            onClick={aoSalvar}
            disabled={redefinir.isPending}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={redefinir.isPending}
            className="px-5 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {redefinir.isPending ? 'Trocando…' : 'Trocar senha'}
          </button>
        </div>
      </form>
    </div>
  )
}
