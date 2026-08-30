import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  ROTULO_PAPEL,
  SENHA_MIN,
  usuarioFormSchema,
  type Usuario,
  type UsuarioFormValues,
} from './usuarios.schema'
import { useAtualizarUsuario, useCriarUsuario } from './usuarios.api'

const inputCls =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

type Props = {
  aoSalvar: () => void
  usuarioParaEditar?: Usuario
}

export function UsuarioForm({ aoSalvar, usuarioParaEditar }: Props) {
  const isEdit = !!usuarioParaEditar
  const criar = useCriarUsuario()
  const atualizar = useAtualizarUsuario()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: usuarioParaEditar?.nome ?? '',
      email: usuarioParaEditar?.email ?? '',
      papel: usuarioParaEditar?.papel ?? 'OPERADOR',
      senha: '',
    },
  })

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
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight">
        {isEdit ? 'Editar usuário' : 'Novo usuário'}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="user-nome" className="text-sm font-medium">
            Nome
          </label>
          <Input id="user-nome" {...form.register('nome')} disabled={isPending} />
          {err.nome && <p className="text-[13px] text-destructive font-medium">{err.nome.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="user-email" className="text-sm font-medium">
              E-mail
            </label>
            <Input id="user-email" type="email" {...form.register('email')} disabled={isPending} />
            {err.email && (
              <p className="text-[13px] text-destructive font-medium">{err.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="user-papel" className="text-sm font-medium">
              Papel
            </label>
            <select id="user-papel" {...form.register('papel')} className={inputCls} disabled={isPending}>
              <option value="ADMIN">{ROTULO_PAPEL.ADMIN}</option>
              <option value="OPERADOR">{ROTULO_PAPEL.OPERADOR}</option>
            </select>
          </div>
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <label htmlFor="user-senha" className="text-sm font-medium">
              Senha inicial
            </label>
            <Input
              id="user-senha"
              type="password"
              {...form.register('senha')}
              placeholder="Mínimo 8 caracteres"
              disabled={isPending}
            />
            {err.senha && (
              <p className="text-[13px] text-destructive font-medium">{err.senha.message}</p>
            )}
          </div>
        )}
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t pt-2">
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
