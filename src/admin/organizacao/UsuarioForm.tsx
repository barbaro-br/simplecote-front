import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Check, Eye, EyeSlash } from '@phosphor-icons/react'
import { z } from 'zod'
import { ROTULO_PAPEL } from '@/shared/domain/papel'
import type { Membro } from './organizacao.schema'
import { useAtualizarMembro, useCriarMembroComSenha } from './organizacao.api'

const SENHA_MIN = 8

// Schema temporário ou replicado do original (já que excluímos usuarios.schema)
export const usuarioFormSchema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o nome').min(3, 'Nome muito curto'),
    email: z.string().trim().min(1, 'Informe o e-mail').email('E-mail inválido'),
    papel: z.enum(['ADMIN', 'OPERADOR']),
    senha: z.string(),
  })
  .superRefine((data, ctx) => {
    // Na edição, não tem input de senha, então a string vazia é válida
    // Na criação, precisa ter 8+
    if (data.senha && data.senha.length > 0 && data.senha.length < SENHA_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['senha'],
        message: 'A senha deve ter ao menos 8 caracteres',
      })
    }
  })

export type UsuarioFormValues = z.infer<typeof usuarioFormSchema>

type Props = {
  aoSalvar: () => void
  usuarioParaEditar?: Membro
}

export function UsuarioForm({ aoSalvar, usuarioParaEditar }: Props) {
  const isEdit = !!usuarioParaEditar
  const criar = useCriarMembroComSenha()
  const atualizar = useAtualizarMembro()
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: usuarioParaEditar?.nome ?? '',
      email: usuarioParaEditar?.email ?? '',
      papel:
        usuarioParaEditar?.papel === 'OWNER'
          ? 'OPERADOR'
          : (usuarioParaEditar?.papel ?? 'OPERADOR'),
      senha: '',
    },
  })

  const senha = useWatch({ control: form.control, name: 'senha' }) ?? ''
  const senhaValida = senha.length >= SENHA_MIN

  const isPending = criar.isPending || atualizar.isPending
  const err = form.formState.errors

  async function aoEnviar(v: UsuarioFormValues) {
    setErro(null)
    if (!isEdit && (v.senha ?? '').length < SENHA_MIN) {
      form.setError('senha', { message: `Mínimo ${SENHA_MIN} caracteres` })
      return
    }
    try {
      if (isEdit) {
        await atualizar.mutateAsync({
          id: usuarioParaEditar.id,
          body: { nome: v.nome, email: v.email, papel: v.papel },
        })
      } else {
        await criar.mutateAsync({
          nome: v.nome,
          email: v.email,
          papel: v.papel,
          senha: v.senha ?? '',
        })
      }
      aoSalvar()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.problem.detail : 'Erro inesperado ao salvar.')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="p-6 space-y-5">
        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <label
              htmlFor="user-nome"
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Nome
            </label>
            <input
              id="user-nome"
              {...form.register('nome')}
              disabled={isPending}
              placeholder="Ex: Ana Silva"
              className="w-full bg-[#131b15] border border-white/15 rounded-none px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium disabled:opacity-50"
            />
            {err.nome && <p className="text-[11px] text-rose-400 font-medium">{err.nome.message}</p>}
          </div>

          {/* Email e Papel */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="user-email"
                className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
              >
                E-mail
              </label>
              <input
                id="user-email"
                type="email"
                {...form.register('email')}
                disabled={isPending}
                placeholder="usuario@empresa.com"
                className="w-full bg-[#131b15] border border-white/15 rounded-none px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium disabled:opacity-50"
              />
              {err.email && (
                <p className="text-[11px] text-rose-400 font-medium">{err.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="user-papel"
                className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
              >
                Papel
              </label>
              <div className="relative">
                <select
                  id="user-papel"
                  {...form.register('papel')}
                  disabled={isPending}
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
            </div>
          </div>

          {/* Senha Inicial (apenas na criação) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label
                htmlFor="user-senha"
                className="block text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
              >
                Senha inicial
              </label>
              <div className="relative">
                <input
                  id="user-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  {...form.register('senha')}
                  placeholder="Mínimo 8 caracteres"
                  disabled={isPending}
                  className="w-full bg-[#131b15] border border-white/15 rounded-none pl-3 pr-10 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer"
                  disabled={isPending}
                >
                  {mostrarSenha ? (
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
          )}
        </div>

        {erro && (
          <div
            role="alert"
            className="rounded-none border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300"
          >
            {erro}
          </div>
        )}

        {/* RODAPÉ DE AÇÕES */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={aoSalvar}
            disabled={isPending}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
  )
}
