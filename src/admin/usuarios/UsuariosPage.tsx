import { useState } from 'react'
import { Key, Pencil, PlusCircle, UserMinus } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, Superficie, Selo, ChipsFiltro, type OpcaoChip } from '@/shared/ui'
import { UsuarioForm } from './UsuarioForm'
import { RedefinirSenhaForm } from './RedefinirSenhaForm'
import { useInativarUsuario, useUsuarios } from './usuarios.api'
import { ROTULO_PAPEL, type Usuario } from './usuarios.schema'

type Modal =
  | { tipo: 'criar' }
  | { tipo: 'editar'; usuario: Usuario }
  | { tipo: 'senha'; usuario: Usuario }
  | null

const FILTROS: OpcaoChip[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'inativos', rotulo: 'Inativos' },
]

export function UsuariosPage() {
  const { data: usuarios, isLoading, error } = useUsuarios()
  const inativar = useInativarUsuario()
  const [modal, setModal] = useState<Modal>(null)
  const [confirmar, setConfirmar] = useState<Usuario | null>(null)
  const [filtro, setFiltro] = useState('todos')

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando usuários…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar usuários: {error.message}</p>

  const lista = (usuarios ?? []).filter(
    (u) => filtro === 'todos' || (filtro === 'ativos' ? u.ativo : !u.ativo),
  )

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <CabecalhoPagina titulo="Usuários" subtitulo="Quem acessa o painel administrativo." acao={<Button onClick={() => setModal({ tipo: 'criar' })}>
          <PlusCircle className="mr-2 size-4" />
          Novo usuário
        </Button>} />

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

      <Superficie>
        <ChipsFiltro opcoes={FILTROS} valor={filtro} aoTrocar={setFiltro} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-white/[0.03] border-b border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
              <tr className="text-left text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                <th className="px-4 py-3 font-medium ui-uppercase">Nome</th>
                <th className="px-4 py-3 font-medium ui-uppercase">E-mail</th>
                <th className="px-4 py-3 font-medium ui-uppercase">Papel</th>
                <th className="px-4 py-3 font-medium ui-uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
              {!lista.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                lista.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-white/[0.03] ${u.ativo ? '' : 'opacity-60'}`}
                  >
                    <td className="px-4 py-3 font-medium text-[var(--pnl-txt,#fff)]">
                      {u.nome}
                      {!u.ativo && (
                        <Selo tom="neutro" className="ml-2">
                          Inativo
                        </Selo>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{u.email}</td>
                    <td className="px-4 py-3">
                      <Selo tom="info">{ROTULO_PAPEL[u.papel]}</Selo>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {u.papel !== 'OWNER' && (
                          <>
                            <IconButton
                              icon={Pencil}
                              label="Editar"
                              onClick={() => setModal({ tipo: 'editar', usuario: u })}
                            />
                            <IconButton
                              icon={Key}
                              label="Trocar senha"
                              onClick={() => setModal({ tipo: 'senha', usuario: u })}
                            />
                            {u.ativo && (
                              <IconButton
                                icon={UserMinus}
                                label="Inativar"
                                onClick={() => setConfirmar(u)}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Superficie>
    </PageContainer>
  )
}
