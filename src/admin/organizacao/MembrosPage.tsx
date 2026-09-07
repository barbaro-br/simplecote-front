import { useState } from 'react'
import { PaperPlaneTilt, Trash, UserMinus, UserPlus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ConfirmarDialog } from '@/admin/cotacoes/ConfirmarDialog'
import { ConvidarMembroDialog } from './ConvidarMembroDialog'
import {
  useInativarMembro,
  useMembros,
  useReenviarConvite,
  useRevogarConvite,
} from './organizacao.api'
import { ROTULO_STATUS, rotuloPapel, type Membro } from './organizacao.schema'

type AcaoConfirmar =
  | { tipo: 'revogar'; conviteId: string; email: string }
  | { tipo: 'inativar'; membro: Membro }
  | null

export function MembrosPage() {
  const { data: membros, isLoading, error } = useMembros()
  const revogar = useRevogarConvite()
  const reenviar = useReenviarConvite()
  const inativar = useInativarMembro()
  const [convidarAberto, setConvidarAberto] = useState(false)
  const [confirmar, setConfirmar] = useState<AcaoConfirmar>(null)

  function mensagemDeErro(e: unknown): string {
    return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
  }

  function aoReenviar(id: string) {
    reenviar.mutate(id, {
      onSuccess: () => toast.success('Convite reenviado.'),
      onError: (e) => {
        if (e instanceof SessaoExpiradaError) return
        toast.error(mensagemDeErro(e))
      },
    })
  }

  function aoConfirmar() {
    if (!confirmar) return
    if (confirmar.tipo === 'revogar') {
      revogar.mutate(confirmar.conviteId, {
        onSettled: () => setConfirmar(null),
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          toast.error(mensagemDeErro(e))
        },
      })
    } else {
      inativar.mutate(confirmar.membro.id, {
        onSettled: () => setConfirmar(null),
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          toast.error(mensagemDeErro(e))
        },
      })
    }
  }

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight ui-uppercase">Membros</h1>
          <p className="text-sm text-muted-foreground">Quem acessa o painel da sua loja.</p>
        </div>
        <Button onClick={() => setConvidarAberto(true)}>
          <UserPlus className="mr-2 size-4" />
          Convidar membro
        </Button>
      </div>

      <Dialog open={convidarAberto} onClose={() => setConvidarAberto(false)} title="Convidar membro">
        <ConvidarMembroDialog aoFechar={() => setConvidarAberto(false)} />
      </Dialog>

      {confirmar?.tipo === 'revogar' && (
        <ConfirmarDialog
          titulo="Revogar convite"
          descricao={`O convite de ${confirmar.email} será revogado e o link enviado deixará de funcionar.`}
          rotuloConfirmar="Revogar"
          pendente={revogar.isPending}
          onConfirmar={aoConfirmar}
          onCancelar={() => setConfirmar(null)}
        />
      )}

      {confirmar?.tipo === 'inativar' && (
        <ConfirmarDialog
          titulo="Inativar membro"
          descricao={`${confirmar.membro.nome ?? confirmar.membro.email} perderá o acesso ao painel.`}
          rotuloConfirmar="Inativar"
          pendente={inativar.isPending}
          onConfirmar={aoConfirmar}
          onCancelar={() => setConfirmar(null)}
        />
      )}

      {isLoading ? (
        <p className="p-6 text-muted-foreground">Carregando membros…</p>
      ) : error ? (
        <p className="p-6 text-destructive">Erro ao carregar membros: {error.message}</p>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium ui-uppercase">Nome</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">E-mail</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Papel</th>
                  <th className="px-4 py-3 font-medium ui-uppercase">Status</th>
                  <th className="px-4 py-3 font-medium ui-uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!membros?.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum membro ainda.
                    </td>
                  </tr>
                ) : (
                  membros.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{m.nome ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {rotuloPapel(m.papel)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-muted-foreground">{ROTULO_STATUS[m.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {m.status === 'CONVITE_PENDENTE' && (
                            <>
                              <IconButton
                                icon={PaperPlaneTilt}
                                label="Reenviar"
                                onClick={() => aoReenviar(m.id)}
                              />
                              <IconButton
                                icon={Trash}
                                label="Revogar"
                                onClick={() =>
                                  setConfirmar({ tipo: 'revogar', conviteId: m.id, email: m.email })
                                }
                              />
                            </>
                          )}
                          {m.status === 'ATIVO' && m.papel !== 'OWNER' && (
                            <IconButton
                              icon={UserMinus}
                              label="Inativar"
                              onClick={() => setConfirmar({ tipo: 'inativar', membro: m })}
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
      )}
    </PageContainer>
  )
}
