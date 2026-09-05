import { useState } from 'react'
import { KeyRound, Pencil, PlusCircle, UserX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { UsuarioForm } from './UsuarioForm'
import { RedefinirSenhaForm } from './RedefinirSenhaForm'
import { useInativarUsuario, useUsuarios } from './usuarios.api'
import { ROTULO_PAPEL, type Usuario } from './usuarios.schema'

type Modal =
  | { tipo: 'criar' }
  | { tipo: 'editar'; usuario: Usuario }
  | { tipo: 'senha'; usuario: Usuario }
  | null

export function UsuariosPage() {
  const { data: usuarios, isLoading, error } = useUsuarios()
  const inativar = useInativarUsuario()
  const [modal, setModal] = useState<Modal>(null)
  const [confirmar, setConfirmar] = useState<Usuario | null>(null)

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando usuários…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar usuários: {error.message}</p>

  const lista = usuarios ?? []

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">Quem acessa o painel administrativo.</p>
        </div>
        <Button onClick={() => setModal({ tipo: 'criar' })}>
          <PlusCircle className="mr-2 size-4" />
          Novo usuário
        </Button>
      </div>

      <Dialog open={modal !== null} onClose={() => setModal(null)} size="lg" ariaLabel="Usuário">
        {modal?.tipo === 'editar' && (
          <UsuarioForm aoSalvar={() => setModal(null)} usuarioParaEditar={modal.usuario} />
        )}
        {modal?.tipo === 'senha' && (
          <RedefinirSenhaForm
            usuarioId={modal.usuario.id}
            usuarioNome={modal.usuario.nome}
            aoSalvar={() => setModal(null)}
          />
        )}
        {modal?.tipo === 'criar' && <UsuarioForm aoSalvar={() => setModal(null)} />}
      </Dialog>

      <Dialog open={confirmar !== null} onClose={() => setConfirmar(null)} title="Inativar usuário">
        <p className="text-sm text-muted-foreground">
          {confirmar?.nome} perde o acesso ao painel. Não há como reativar pela tela.
        </p>
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="ghost" onClick={() => setConfirmar(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={inativar.isPending}
            onClick={() => {
              if (!confirmar) return
              inativar.mutate(confirmar.id, { onSettled: () => setConfirmar(null) })
            }}
          >
            {inativar.isPending ? 'Inativando…' : 'Inativar'}
          </Button>
        </div>
      </Dialog>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!lista.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                lista.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-muted/50 ${u.ativo ? '' : 'opacity-60 bg-muted/10'}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {u.nome}
                      {!u.ativo && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {ROTULO_PAPEL[u.papel]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          icon={Pencil}
                          label="Editar"
                          onClick={() => setModal({ tipo: 'editar', usuario: u })}
                        />
                        <IconButton
                          icon={KeyRound}
                          label="Trocar senha"
                          onClick={() => setModal({ tipo: 'senha', usuario: u })}
                        />
                        {u.ativo && (
                          <IconButton
                            icon={UserX}
                            label="Inativar"
                            onClick={() => setConfirmar(u)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  )
}
